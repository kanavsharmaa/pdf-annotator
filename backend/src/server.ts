import express from "express";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes"; // 2. Import our file routes
import { connectDB, MONGO_URI } from "./db/db";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use("/api/files", fileRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
