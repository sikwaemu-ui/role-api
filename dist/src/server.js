import authRoutes from "./routes/auth.routes.js";
import express from "express";
import dotenv from "dotenv";
import prisma from "./db/prisma.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Auth API is running"
    });
});
app.get("/api/db-test", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            success: true,
            message: "Database connection successful"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
