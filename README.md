# FileUploader: Detailed Documentation for Assessment

This document provides a detailed breakdown of the FileUploader application, covering the technology stack, project structure, setup instructions, and the core logic behind the Role-Based Access Control (RBAC) and annotation features.

## 1. Technology Stack Used

The application is a full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) solution implemented entirely with **TypeScript**.

| Component        | Key Technologies                    | Description                                                                                            |
| :--------------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Backend**      | **Node.js, Express.js, TypeScript** | Provides a REST API, utilizing `tsx` for hot-reloading in development.                                 |
| **Database**     | **MongoDB, Mongoose**               | MongoDB is the database, with Mongoose ODM defining schemas for `File` and `Annotation`.               |
| **File Storage** | **MongoDB GridFS, Multer**          | GridFS is used to store the PDF binary data, orchestrated by Multer middleware to handle file uploads. |
| **Frontend**     | **React 18, Vite, TypeScript**      | Client-side application for the user interface.                                                        |
| **PDF Handling** | **react-pdf, pdfjs-dist**           | Used for reliable PDF rendering and accessing the text layer for highlighting.                         |
| **Styling**      | **Tailwind CSS, shadcn/ui**         | Utility-first CSS framework combined with accessible, pre-built components for a responsive design.    |

---

## 2. Features

- **File Upload & Management**: Upload PDF files securely using MongoDB GridFS.
- **File Viewing**: High-fidelity PDF rendering using `react-pdf`.
- **Annotation Tools**:
  - **Highlight**: Select and highlight text.
  - **Comment**: Add comments at specific coordinates.
  - **Draw**: Freehand drawing on the PDF.
- **Role-Based Access Control (RBAC)**: Granular permissions for Admin (A1), Default (D1, D2), and Read-only (R1) roles.
- **Annotation Visibility**: Control who can see annotations based on roles and privacy settings.
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui.

---

## 3. Project Setup and Run Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)

### Backend Setup

1.  Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install
    ```
2.  Create a `.env` file in the `/backend` directory and configure your MongoDB URI.
    _Example `backend/.env` contents:_
    ```env
    MONGO_URI={_Enter your mongodb connection string here_}
    PORT=4000
    ```
3.  Start the backend server using `tsx`:
    ```bash
    npm run dev
    # Server running on http://localhost:4000
    ```

### Frontend Setup

1.  Navigate to the frontend directory and install dependencies:
    ```bash
    cd frontend
    npm install
    ```
2.  Start the development server using Vite:
    ```bash
    npm run dev
    # Application available at http://localhost:5173
    ```

---

## 4. Folder Structure

The project maintains a clean separation of concerns between the frontend and backend.

### Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── controllers/    # Request handlers for files and annotations
│   ├── db/             # Database connection logic
│   ├── middlewares/    # Express middlewares (Auth, Multer)
│   ├── models/         # Mongoose schemas (File, Annotation)
│   ├── routes/         # API route definitions
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Application entry point
├── .env                # Environment variables
└── package.json        # Backend dependencies and scripts
```

### Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── components/     # Reusable UI components (shadcn/ui, custom)
│   ├── contexts/       # React Context providers (e.g., AuthContext)
│   ├── lib/            # Utility libraries and helpers
│   ├── pages/          # Page components (Home, PDFViewer)
│   ├── styles/         # Global styles and Tailwind configuration
│   ├── types/          # Frontend TypeScript types
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── index.html          # HTML template
└── package.json        # Frontend dependencies and scripts
```

---

## 5. API Endpoints and Annotation Logic

### Role-Based Access Control (RBAC)

Access control is implemented in the `auth.ts` middleware and enforced on a per-route basis. The client sends the user's current role via the **`X-User-Role`** HTTP header.

| Role                 | File Upload/Delete | Annotation Creation/Update/Delete    |
| :------------------- | :----------------- | :----------------------------------- |
| **A1 (Admin)**       | ✅ Full Access     | ✅ All Annotations (Own and others') |
| **D1, D2 (Default)** | ❌ Forbidden       | ✅ Own Annotations Only              |
| **R1 (Read-only)**   | ❌ Forbidden       | ❌ Forbidden                         |

### Core API Endpoints

| Method   | Endpoint               | Description                                                              |
| :------- | :--------------------- | :----------------------------------------------------------------------- |
| `GET`    | `/api/files`           | Retrieves all document metadata (accessible to all roles).               |
| `GET`    | `/api/files/:fileId`   | Streams the PDF document (accessible to all roles).                      |
| `POST`   | `/api/annotations`     | Creates a new annotation (requires A1, D1, or D2 role).                  |
| `PUT`    | `/api/annotations/:id` | Updates an annotation (permission checked in controller: creator or A1). |
| `DELETE` | `/api/annotations/:id` | Deletes an annotation (permission checked in controller: creator or A1). |

### Annotation Logic Explained

#### Annotation Data

The core of the annotation logic is the polymorphic data structure defined in `frontend/src/types/index.ts`.

- **Highlight Data**: Stores an array of pixel bounding boxes (`rects`) and the selected `text`, relative to the PDF page dimensions.
- **Comment Data**: Stores absolute pixel coordinates (`x`, `y`) for marker placement.
- **Draw Data**: Stores an array of `paths`, where each path contains multiple `points` (x, y coordinates) for freehand drawing.

#### Visibility Filtering (`GET /api/annotations/document/:documentId`)

The `annotationController.ts` implements a multi-step filter to ensure the correct annotations are returned based on the `X-User-Role` header:

1.  **R1 Exclusion**: If the current user is **R1 (Read-only)**, they see **zero** annotations.
2.  **Creator Access**: An annotation is always visible to its creator.
3.  **Admin Override**: An annotation is always visible to **A1 (Admin)**.
4.  **Private Check**: If the annotation is marked `isPrivate`, it is visible _only_ to the creator and Admin.
5.  **Shared Check**: If the annotation is _not_ private, it is visible if the `currentUser`'s role is explicitly included in the annotation's `visibility` array.

---

## 6. Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

---

## 7. License

This project is licensed under the **ISC License**.
