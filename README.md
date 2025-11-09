# PDF Document Management System with Annotations

A full-stack MERN application for uploading, viewing, and annotating PDF documents with role-based access control.

## Features

### 1. Document Upload
- **Admin (A1)** can upload single or multiple PDF files
- Files stored using MongoDB GridFS
- Metadata tracking (filename, uploader, upload date)

### 2. Role-Based Access Control (RBAC)
Four predefined user roles:
- **Admin (A1)**: Full access - upload, view, annotate, edit/delete all annotations
- **Default Users (D1, D2)**: View and annotate PDFs, manage own annotations
- **Read-only User (R1)**: View PDFs only, no annotation capabilities

### 3. PDF Annotation Features

#### Annotation Types
1. **Highlight** 🖍️
   - Select text on PDF to highlight
   - Choose from multiple colors
   - Highlights are semi-transparent overlays

2. **Comment** 💬
   - Click anywhere on PDF to add a comment
   - Comments appear as markers with tooltips
   - Hover to view comment text and author

3. **Draw** ✏️
   - Freehand drawing on PDF pages
   - Customizable colors
   - Smooth line rendering

#### Annotation Visibility Controls
- **Private**: Only visible to creator and Admin
- **Shared**: Choose specific users who can view
- **Public**: Visible to all users (empty visibility list)

#### Annotation Permissions
- **Create**: A1, D1, D2 can create annotations
- **View**: Based on visibility settings and role
- **Edit**: Only creator or Admin can edit
- **Delete**: Only creator or Admin can delete

### 4. User Switching
- Dropdown menu to switch between users (A1, D1, D2, R1)
- No authentication required for testing
- Instant permission updates on role change

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **GridFS** for file storage
- **Multer** for file uploads

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **React-PDF** for PDF rendering
- **CSS Modules** for styling

## Project Structure

```
FileUploader/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── fileController.ts
│   │   │   └── annotationController.ts
│   │   ├── models/
│   │   │   ├── File.ts
│   │   │   └── Annotation.ts
│   │   ├── routes/
│   │   │   ├── fileRoutes.ts
│   │   │   └── annotationRoutes.ts
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   ├── db/
│   │   │   └── db.ts
│   │   └── server.ts
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── FileUploader/
    │   │   ├── FileList/
    │   │   ├── Header/
    │   │   ├── AnnotationToolbar/
    │   │   ├── AnnotationLayer/
    │   │   └── VisibilitySelector/
    │   ├── pages/
    │   │   ├── Dashboard/
    │   │   └── PdfViewer/
    │   ├── contexts/
    │   │   └── UserContext.tsx
    │   ├── utils/
    │   │   ├── api.ts
    │   │   └── annotationApi.ts
    │   └── types/
    │       └── index.ts
    └── package.json
```

## API Endpoints

### File Management
- `GET /api/files` - Get all files
- `GET /api/files/:fileId` - Get file by ID (stream PDF)
- `POST /api/files/upload` - Upload single PDF (Admin only)
- `POST /api/files/upload-bulk` - Upload multiple PDFs (Admin only)
- `DELETE /api/files/:fileId` - Delete file (Admin only)

### Annotations
- `GET /api/annotations/document/:documentId` - Get annotations for a document
- `POST /api/annotations` - Create annotation (A1, D1, D2)
- `PUT /api/annotations/:annotationId` - Update annotation (Creator or Admin)
- `DELETE /api/annotations/:annotationId` - Delete annotation (Creator or Admin)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGODB_URI=mongodb://localhost:27017/fileuploader
# PORT=4000
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000

## Usage Guide

### Uploading Documents
1. Switch to Admin (A1) role
2. Select one or multiple PDF files
3. Click Upload

### Viewing Documents
1. All users can view the document list
2. Click on any document to open the PDF viewer

### Adding Annotations

#### Highlight Text
1. Select the Highlight tool 🖍️
2. Choose a color
3. Select text on the PDF
4. Text will be highlighted automatically

#### Add Comment
1. Select the Comment tool 💬
2. Choose a color
3. Click anywhere on the PDF
4. Enter your comment text
5. Click "Add"

#### Draw on PDF
1. Select the Draw tool ✏️
2. Choose a color
3. Click and drag on the PDF to draw
4. Release to save the drawing

### Setting Visibility
1. Click "Show Visibility Settings"
2. Choose:
   - **Private**: Only you and Admin can see
   - **Shared**: Select specific users
3. Create annotations with selected visibility

### Managing Annotations
- **View**: Hover over comment markers to see details
- **Delete**: Click the × button on your own annotations (or Admin can delete any)

## Key Features Implemented

✅ MERN stack with TypeScript  
✅ Role-based access control (RBAC)  
✅ PDF upload (single & bulk)  
✅ GridFS file storage  
✅ PDF viewing with react-pdf  
✅ Three annotation types (Highlight, Comment, Draw)  
✅ Annotation visibility controls  
✅ Permission-based annotation management  
✅ User switching dropdown  
✅ Clean, modular code structure  
✅ Responsive UI design  

## Notes

- This is a demonstration application for assessment purposes
- No authentication system implemented (uses role header for testing)
- Focus is on functionality and code structure
- All annotations are stored per-page for accurate positioning
- Canvas-based rendering for highlights and drawings
- Real-time annotation updates when switching users
