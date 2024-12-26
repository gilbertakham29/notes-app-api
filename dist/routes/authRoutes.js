"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || "default-key");
const router = express_1.default.Router();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "No token provided" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err)
            return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Invalid Input" });
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: "User already exists!" });
        const otp = generateOTP();
        const user = new userModel_1.default({ name, email, password: hashedPassword, otp });
        yield user.save();
        const emailContent = {
            to: email,
            from: "alenworld123@gmail.com",
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
        };
        try {
            yield mail_1.default.send(emailContent);
            res.status(200).json({ message: "OTP sent to email" });
        }
        catch (error) {
            console.error("Error sending email:", error);
            return res.status(500).json({ error: "Failed to send OTP" });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Signup failed", err });
    }
}));
router.post("/verify-otp", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const user = yield userModel_1.default.findOne({ email });
        if (!user || user.otp !== otp)
            return res.status(400).json({ error: "Invalid OTP" });
        user.otp = null;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.status(200).json({ token, message: "Signin Successful" });
    }
    catch (err) {
        res.status(500).json({ error: "Verification failed" });
    }
}));
router.get("/user", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield userModel_1.default.findById(userId).select("-password -otp");
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
}));
exports.default = router;
