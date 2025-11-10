// @ts-nocheck
import express from "express";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import annotationRoutes from "./routes/annotationRoutes.js";
import cors from "cors";
import { connectDB } from "./db/db.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// --- CORS Configuration ---
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-role'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: false,
  optionsSuccessStatus: 204
};

// Apply CORS with the specified options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

app.get('/', (req, res) => {
  return res.send("Backend is running");
})

app.use("/api/files", fileRoutes);
app.use("/api/annotations", annotationRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});