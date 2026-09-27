"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_js_1 = __importDefault(require("./db/prisma.js"));
const user_routes_js_1 = __importDefault(require("./routes/user.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_js_1.default);
app.use("/api/user", user_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Auth API is running"
    });
});
app.get("/api/db-test", async (_req, res) => {
    try {
        await prisma_js_1.default.$queryRaw `SELECT 1`;
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
