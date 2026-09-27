import { Router } from "express";
import { authenticate, } from "../middleware/auth.middleware.js";
const router = Router();
/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     tags: [User]
 *     summary: Get the authenticated user's token identity
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: Authenticated user identity }
 *       '401': { description: Missing, invalid, or expired token }
 */
router.get("/profile", authenticate, (req, res) => {
    res.json({
        success: true,
        message: "Authenticated user",
        user: req.user,
    });
});
export default router;
