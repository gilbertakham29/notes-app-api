"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const noteSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
});
exports.default = mongoose_1.default.model("Note", noteSchema);
