import { Router } from 'express';
import {
    createAnnotation,
    getAnnotationsByDocument,
    updateAnnotation,
    deleteAnnotation
} from '../controllers/annotationController';
import { isUser, canAnnotate } from '../middlewares/auth';

const router = Router();

// Get all annotations for a document (filtered by visibility)
router.get('/document/:documentId', isUser, getAnnotationsByDocument);

// Create a new annotation (only users with annotation permission)
router.post('/', canAnnotate, createAnnotation);

// Update an annotation (only creator or admin)
router.put('/:annotationId', canAnnotate, updateAnnotation);

// Delete an annotation (only creator or admin)
router.delete('/:annotationId', canAnnotate, deleteAnnotation);

export default router;
