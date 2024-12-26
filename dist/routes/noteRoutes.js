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
const noteModel_1 = __importDefault(require("../models/noteModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const router = express_1.default.Router();
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
        if (err)
            return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
};
router.post("/", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { content } = req.body;
    if (!content)
        return res.status(400).json({ error: "Content is required" });
    try {
        const note = new noteModel_1.default({ userId: req.user.id, content });
        yield note.save();
        res.status(201).json(note);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create note" });
    }
}));
router.delete("/:id", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield noteModel_1.default.findByIdAndDelete({ _id: req.params.id, userId: req.user.id });
        res.status(200).json({ message: "Note deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete note" });
    }
}));
router.get("/", authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.default.findById(req.user.id).select("name email");
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const notes = yield noteModel_1.default.find({ userId: req.user.id });
        res.status(200).json({ user, notes });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
}));
exports.default = router;
