import mongoose, { Document, Schema } from "mongoose";

interface Note extends Document {
  userId: string;
  content: string;
}

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
});
export default mongoose.model<Note>("Note", noteSchema);
