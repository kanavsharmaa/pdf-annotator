import multer, { FileFilterCallback } from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import crypto from 'crypto';
import path from 'path';
import { Request } from 'express';
import { MONGO_URI } from '../db/db';


// 1. Create the GridFS storage engine
const storage = new GridFsStorage({
    url: MONGO_URI!,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    
    // 2. Define how files are stored
    file: (req: Request, file: Express.Multer.File) => {
        return new Promise((resolve, reject) => {
            // Use crypto to generate a unique filename
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                // Create a filename like "abcdef123456.pdf"
                const filename = buf.toString('hex') + path.extname(file.originalname);
                
                // Return the file info
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads' // This must match the bucketName in db.ts
                };
                resolve(fileInfo);
            });
        });
    }
});

// 3. Create the file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    // Only accept PDFs
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept file
    } else {
        cb(null, false); // Reject file
    }
};

// 4. Export the configured Multer instance
export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});