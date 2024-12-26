import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import noteRoutes from "./routes/noteRoutes";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("Database conection failed", err));
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
