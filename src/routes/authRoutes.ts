import express from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "default-key");
const router = express.Router();

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(
    token,
    process.env.JWT_SECRET || "secret",
    (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
    }
  );
};
router.post("/signup", async (req: any, res: any) => {
  const { name, email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Invalid Input" });
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists!" });
    const otp = generateOTP();
    const user = new User({ name, email, password: hashedPassword, otp });
    await user.save();
    const emailContent = {
      to: email,
      from: "alenworld123@gmail.com",
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };

    try {
      await sgMail.send(emailContent);
      res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Failed to send OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: "Signup failed", err });
  }
});
router.post("/verify-otp", async (req: any, res: any) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp)
      return res.status(400).json({ error: "Invalid OTP" });
    user.otp = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, message: "Signin Successful" });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});
router.get("/user", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password -otp");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});
export default router;
