import { Request, Response } from 'express';
import Annotation from '../models/Annotation';
import mongoose from 'mongoose';

export const createAnnotation = async (req: Request, res: Response) => {
    try {
        const { documentId, type, data, isPrivate, visibility } = req.body;
        const createdBy = req.header('X-User-Role') || 'D1';

        if (!documentId || !type || !data) {
            return res.status(400).json({ 
                message: 'Missing required fields: documentId, type, or data' 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID format' });
        }

        const annotation = new Annotation({
            documentId,
            createdBy,
            type,
            data,
            isPrivate: isPrivate !== undefined ? isPrivate : true,
            visibility: visibility || []
        });

        await annotation.save();

        res.status(201).json({
            message: 'Annotation created successfully',
            annotation
        });
    } catch (error) {
        console.error('Error creating annotation:', error);
        res.status(500).json({ message: 'Server error while creating annotation' });
    }
};

export const getAnnotationsByDocument = async (req: Request, res: Response) => {
    try {
        const { documentId } = req.params;
        const currentUser = req.header('X-User-Role') || 'R1';

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ message: 'Invalid document ID format' });
        }

        // Fetch all annotations for the document
        const allAnnotations = await Annotation.find({ documentId });

        // Filter based on visibility rules
        const visibleAnnotations = allAnnotations.filter(annotation => {
            // R1 cannot see any annotations
            if (currentUser === 'R1') {
                return false;
            }

            // User can see their own annotations
            if (annotation.createdBy === currentUser) {
                return true;
            }

            // Private annotations are only visible to creator
            if (annotation.isPrivate) {
                return false;
            }

            // Shared annotations: admin can always see them
            if (currentUser === 'A1') {
                return true;
            }

            // For non-admin users, check if they're in the visibility list
            return annotation.visibility.includes(currentUser);
        });

        res.status(200).json(visibleAnnotations);
    } catch (error) {
        console.error('Error fetching annotations:', error);
        res.status(500).json({ message: 'Server error while fetching annotations' });
    }
};

export const updateAnnotation = async (req: Request, res: Response) => {
    try {
        const { annotationId } = req.params;
        const { type, data, isPrivate, visibility } = req.body;
        const currentUser = req.header('X-User-Role') || 'D1';

        if (!mongoose.Types.ObjectId.isValid(annotationId)) {
            return res.status(400).json({ message: 'Invalid annotation ID format' });
        }

        const annotation = await Annotation.findById(annotationId);
        if (!annotation) {
            return res.status(404).json({ message: 'Annotation not found' });
        }

        // Only creator or admin can update
        if (annotation.createdBy !== currentUser && currentUser !== 'A1') {
            return res.status(403).json({ 
                message: 'You do not have permission to update this annotation' 
            });
        }

        // Update fields
        if (type) annotation.type = type;
        if (data) annotation.data = data;
        if (isPrivate !== undefined) annotation.isPrivate = isPrivate;
        if (visibility) annotation.visibility = visibility;

        await annotation.save();

        res.status(200).json({
            message: 'Annotation updated successfully',
            annotation
        });
    } catch (error) {
        console.error('Error updating annotation:', error);
        res.status(500).json({ message: 'Server error while updating annotation' });
    }
};

export const deleteAnnotation = async (req: Request, res: Response) => {
    try {
        const { annotationId } = req.params;
        const currentUser = req.header('X-User-Role') || 'D1';

        if (!mongoose.Types.ObjectId.isValid(annotationId)) {
            return res.status(400).json({ message: 'Invalid annotation ID format' });
        }

        const annotation = await Annotation.findById(annotationId);
        if (!annotation) {
            return res.status(404).json({ message: 'Annotation not found' });
        }

        // Only creator or admin can delete
        if (annotation.createdBy !== currentUser && currentUser !== 'A1') {
            return res.status(403).json({ 
                message: 'You do not have permission to delete this annotation' 
            });
        }

        await Annotation.findByIdAndDelete(annotationId);

        res.status(200).json({
            message: 'Annotation deleted successfully',
            annotationId
        });
    } catch (error) {
        console.error('Error deleting annotation:', error);
        res.status(500).json({ message: 'Server error while deleting annotation' });
    }
};
