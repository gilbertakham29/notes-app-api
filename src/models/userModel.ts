import mongoose, { Document, Schema } from "mongoose";

interface User extends Document {
  name: string;
  email: string;
  password: string;
  otp: string | null;
}
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
});
export default mongoose.model<User>("User", userSchema);
