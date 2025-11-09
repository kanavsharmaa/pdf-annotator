import { Request, Response } from 'express';
import File from '../models/File';
import Annotation from '../models/Annotation';
import mongoose from 'mongoose';
import { gfs } from '../db/db';
import { Readable } from 'stream';

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ 
            message: "No file uploaded. Make sure it's a single PDF file." 
        });
    }

    try {
        const readableStream = Readable.from(req.file.buffer);
        const uploadStream = gfs.openUploadStream(req.file.originalname, {
            contentType: 'application/pdf'
        });

        readableStream.pipe(uploadStream);

        uploadStream.on('finish', async () => {
            const newFile = new File({
                gridFsId: uploadStream.id,
                fileName: req.file!.originalname,
                uploaderRole: req.header('X-User-Role') || 'A1'
            });

            await newFile.save();
            
            res.status(201).json({
                message: "File uploaded successfully",
                file: newFile
            });
        });

        uploadStream.on('error', (error) => {
            console.error("Error uploading to GridFS:", error);
            res.status(500).json({ message: "Server error while uploading file." });
        });

    } catch (error) {
        console.error("Error saving file metadata:", error);
        res.status(500).json({ message: "Server error while saving file metadata." });
    }
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ 
            message: "No files uploaded. Make sure it's an array of PDF files." 
        });
    }

    const files = req.files as Express.Multer.File[];
    const uploaderRole = req.header('X-User-Role') || 'A1';

    try {
        const uploadPromises = files.map((file) => {
            return new Promise<any>((resolve, reject) => {
                const readableStream = Readable.from(file.buffer);
                const uploadStream = gfs.openUploadStream(file.originalname, {
                    contentType: 'application/pdf'
                });

                readableStream.pipe(uploadStream);

                uploadStream.on('finish', () => {
                    resolve({
                        gridFsId: uploadStream.id,
                        fileName: file.originalname,
                        uploaderRole: uploaderRole
                    });
                });

                uploadStream.on('error', reject);
            });
        });

        const fileData = await Promise.all(uploadPromises);
        const savedFiles = await File.insertMany(fileData);
        
        res.status(201).json({
            message: `Successfully uploaded ${savedFiles.length} files.`,
            files: savedFiles
        });

    } catch (error) {
        console.error("Error saving multiple file metadata:", error);
        res.status(500).json({ message: "Server error while saving file metadata." });
    }
};

export const getAllFiles = async (req: Request, res: Response) => {
    try {
        const files = await File.find().select('-gridFsId');
        res.status(200).json(files);
    } catch (error) {
        console.error("Error fetching file list:", error);
        res.status(500).json({ message: "Server error while fetching file list." });
    }
};

export const getFileById = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
            return res.status(400).json({ message: 'Invalid file ID format.' });
        }

        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File metadata not found.' });
        }

        const gridFsId = file.gridFsId;
        const [gridFsFile] = await gfs.find({ _id: gridFsId }).toArray();
        if (!gridFsFile) {
            return res.status(404).json({ message: 'File not found in storage.' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);

        const readStream = gfs.openDownloadStream(gridFsId);
        readStream.pipe(res);

        readStream.on('error', (error) => {
            console.error("Stream error:", error);
            res.status(500).json({ message: "Error streaming file." });
        });

    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ message: "Server error." });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
            return res.status(400).json({ message: 'Invalid file ID format.' });
        }

        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File metadata not found.' });
        }

        // Delete all annotations associated with this file
        const deletedAnnotations = await Annotation.deleteMany({ documentId: req.params.fileId });
        console.log(`Deleted ${deletedAnnotations.deletedCount} annotations for file ${req.params.fileId}`);

        // Delete the file from GridFS
        await gfs.delete(new mongoose.Types.ObjectId(file.gridFsId));
        
        // Delete the file metadata
        await File.findByIdAndDelete(req.params.fileId);

        res.status(200).json({
            message: 'File and associated annotations deleted successfully.',
            fileId: req.params.fileId,
            annotationsDeleted: deletedAnnotations.deletedCount
        });

    } catch (error: any) {
        if (error.message && error.message.includes('File not found')) {
             // Clean up annotations and metadata even if GridFS file is missing
             await Annotation.deleteMany({ documentId: req.params.fileId });
             await File.findByIdAndDelete(req.params.fileId);
             return res.status(200).json({ message: 'File metadata and annotations deleted (actual file was already missing).' });
        }
        console.error("Error deleting file:", error);
        res.status(500).json({ message: "Server error while deleting file." });
    }
};