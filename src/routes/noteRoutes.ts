import express from "express";
import Note from "../models/noteModel";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
const router = express.Router();

const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret",
    (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid Token" });
      req.user = user;
      next();
    }
  );
};
router.post("/", authenticate, async (req: any, res: any) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: "Content is required" });
  try {
    const note = new Note({ userId: req.user.id, content });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});
router.delete("/:id", authenticate, async (req: any, res: any) => {
  try {
    await Note.findByIdAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});
router.get("/", authenticate, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) return res.status(404).json({ error: "User not found" });

    const notes = await Note.find({ userId: req.user.id });
    res.status(200).json({ user, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});
export default router;
