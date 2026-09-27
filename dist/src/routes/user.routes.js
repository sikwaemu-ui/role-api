import { Router } from "express";
import { authenticate, } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/profile", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Authenticated user",
        user: req.user,
    });
});
export default router;
