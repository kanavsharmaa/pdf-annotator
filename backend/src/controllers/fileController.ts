import { Request, Response } from 'express';
import File from '../models/File'; // Import our File model
import mongoose from 'mongoose';
import { gfs } from '../db/db';


export const uploadFile = async (req: Request, res: Response) => {
    console.log("Inside uploadFile");
    // 1. Check if the file was uploaded by Multer
    // The 'upload' middleware we made will add 'req.file'
    if (!req.file) {
        return res.status(400).json({ 
            message: "No file uploaded. Make sure it's a single PDF file." 
        });
    }

    try {
        // 2. Create a new document in our 'File' collection
        // The 'id' on req.file is added by multer-gridfs-storage
        const newFile = new File({
            gridFsId: (req.file as any).id, // The ID of the file in GridFS
            fileName: req.file.originalname,
            
            // We'll get the uploader's role from a header
            // (A middleware will check this header later)
            uploaderRole: req.header('X-User-Role') || 'A1' 
        });

        // 3. Save the new 'File' document to MongoDB
        await newFile.save();
        
        // 4. Send a success response
        res.status(201).json({
            message: "File uploaded successfully",
            file: newFile
        });

    } catch (error) {
        console.error("Error saving file metadata:", error);
        res.status(500).json({ message: "Server error while saving file metadata." });
    }
};

export const uploadMultipleFiles = async (req: Request, res: Response) => {
    // 1. Check if files were uploaded. Multer adds 'req.files' as an array.
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ 
            message: "No files uploaded. Make sure it's an array of PDF files." 
        });
    }

    // Cast req.files to the correct type
    const files = req.files as Express.Multer.File[];
    const uploaderRole = req.header('X-User-Role') || 'A1';

    try {
        // 2. Create an array of 'File' documents to be saved
        const filesToSave = files.map(file => {
            return new File({
                gridFsId: (file as any).id, // The ID from GridFS
                fileName: file.originalname,
                uploaderRole: uploaderRole
            });
        });

        // 3. Save all the new 'File' documents to MongoDB
        const savedFiles = await File.insertMany(filesToSave);
        
        // 4. Send a success response
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
    console.log("Inside getAllFiles");
    try {
        // Find all documents in the 'File' collection
        // We use .select() to exclude the gridFsId, which is an
        // internal detail the frontend doesn't need.
        const files = await File.find().select('-gridFsId');

        res.status(200).json(files);

    } catch (error) {
        console.error("Error fetching file list:", error);
        res.status(500).json({ message: "Server error while fetching file list." });
    }
};

export const getFileById = async (req: Request, res: Response) => {
    try {
        // 1. Check if the ID from the URL is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
            return res.status(400).json({ message: 'Invalid file ID format.' });
        }

        // 2. Find the file *metadata* in our 'File' collection
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File metadata not found.' });
        }

        // 3. Find the *actual file data* in GridFS using the gridFsId
        const gridFsId = file.gridFsId;
        
        // We query the 'uploads.files' collection (managed by GridFS)
        const [gridFsFile] = await gfs.find({ _id: gridFsId }).toArray();
        if (!gridFsFile) {
            return res.status(404).json({ message: 'File not found in storage.' });
        }

        // 4. Set the response headers
        // This tells the browser it's a PDF and how to display it
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="${file.fileName}"` // 'inline' tells browser to display, not download
        );

        // 5. Create the download stream and pipe it to the response
        const readStream = gfs.openDownloadStream(gridFsId);
        readStream.pipe(res);

        // Handle errors during the stream
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
        // 1. Validate the file ID
        if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
            return res.status(400).json({ message: 'Invalid file ID format.' });
        }

        // 2. Find the file metadata to get the gridFsId
        const file = await File.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File metadata not found.' });
        }

        // 3. Delete the actual file from GridFS
        // We use the gridFsId we stored in our File model
        await gfs.delete(new mongoose.Types.ObjectId(file.gridFsId));

        // 4. Delete the metadata document from our 'File' collection
        await File.findByIdAndDelete(req.params.fileId);

        res.status(200).json({
            message: 'File deleted successfully.',
            fileId: req.params.fileId
        });

    } catch (error: any) {
        // Handle case where file might not exist in GridFS but exists in metadata
        if (error.message && error.message.includes('Tnvalid File Not Found')) {
             // If GridFS delete fails because it's already gone, just delete metadata
             await File.findByIdAndDelete(req.params.fileId);
             return res.status(200).json({ message: 'File metadata deleted (actual file was already missing).' });
        }
        console.error("Error deleting file:", error);
        res.status(500).json({ message: "Server error while deleting file." });
    }
};