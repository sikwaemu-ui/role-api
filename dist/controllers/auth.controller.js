"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const auth_schema_1 = require("../schemas/auth.schema");
const auth_schema_js_1 = require("../schemas/auth.schema.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = __importDefault(require("../db/prisma.js"));
const jwt_js_1 = require("../utils/jwt.js");
//register user
const register = async (req, res) => {
    try {
        //validate the request
        const data = auth_schema_1.registerSchema.parse(req.body);
        const { name, email, password } = data;
        // Check existing user
        const existingUser = await prisma_js_1.default.user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma_js_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message
            });
        }
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
exports.register = register;
//login user
const login = async (req, res) => {
    try {
        // Validate request
        const data = auth_schema_js_1.loginSchema.parse(req.body);
        const { email, password } = data;
        // Find user
        const user = await prisma_js_1.default.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // Compare password
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        // Generate JWT
        const token = (0, jwt_js_1.generateToken)(user.id);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                success: false,
                message: error.issues[0].message,
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
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
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
exports.getMe = getMe;
