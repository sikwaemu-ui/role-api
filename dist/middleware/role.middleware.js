"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const prisma_js_1 = __importDefault(require("../db/prisma.js"));
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const user = await prisma_js_1.default.user.findUnique({
            where: {
                id: req.user.userId,
            },
            select: {
                role: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.requireAdmin = requireAdmin;
