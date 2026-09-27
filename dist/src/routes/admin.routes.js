import { Router } from "express";
import { authenticate, } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
const router = Router();
router.get("/dashboard", authenticate, requireAdmin, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the admin dashboard",
        admin: req.user,
    });
});
export default router;
