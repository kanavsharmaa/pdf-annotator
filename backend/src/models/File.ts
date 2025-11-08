import mongoose, { Schema, Document } from 'mongoose';

// // Define an interface for our document (optional, but good TS practice)
// export interface IFile extends Document {
//     gridFsId: mongoose.Schema.Types.ObjectId;
//     fileName: string;
//     uploaderRole: string;
//     uploadDate: Date;
// }

const FileSchema = new Schema({
    gridFsId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    fileName: { 
        type: String, 
        required: true 
    },
    uploaderRole: { 
        type: String, 
        required: true 
    },
    uploadDate: { 
        type: Date, 
        default: Date.now 
    }
});

const File = mongoose.models.File || mongoose.model('File', FileSchema);
export default File;
