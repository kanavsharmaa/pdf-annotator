// @ts-nocheck
import express from "express";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes";
import annotationRoutes from "./routes/annotationRoutes";
import cors from "cors";
import { connectDB } from "./db/db";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS Configuration ---

// const corsOptions = {
//   origin: '*', // Allow all origins
//   methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
//   credentials: true
// };

// app.use(cors(corsOptions));

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use("/api/files", fileRoutes);
app.use("/api/annotations", annotationRoutes);

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

export default app;