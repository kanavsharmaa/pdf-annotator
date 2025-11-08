import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Annotation document
// export interface IAnnotation extends Document {
//     documentId: mongoose.Schema.Types.ObjectId; // Link to the 'File'
//     createdBy: string;
//     isPrivate: boolean;
//     visibility: string[];
//     type: 'Highlight' | 'Comment' | 'Draw';
//     data: any; // Using 'any' for flexibility (position, text, etc.)
//     createdAt: Date;
// }

const AnnotationSchema: Schema = new Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'File' // This creates a reference to our 'File' model
    },
    createdBy: {
        type: String, // e.g., 'A1', 'D1', 'D2'
        required: true
    },
    isPrivate: {
        type: Boolean,
        required: true,
        default: true // Default to private
    },
    visibility: {
        type: [String], // Array of roles: ['A1', 'D1']
        default: []
    },
    type: {
        type: String,
        required: true,
        enum: ['Highlight', 'Comment', 'Draw'] // Only allow these values
    },
    data: {
        type: mongoose.Schema.Types.Mixed, // Allows storing flexible objects
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Annotation = mongoose.models.Annotation || mongoose.model('Annotation', AnnotationSchema);
export default Annotation;