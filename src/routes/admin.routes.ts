import { Router, Response } from "express";
import {
  authenticate,
  AuthRequest,
} from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Access the administrator dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200': { description: Admin dashboard access granted }
 *       '401': { description: Missing, invalid, or expired token, or user no longer exists }
 *       '403': { description: Admin access required }
 */
router.get(
  "/dashboard",
  authenticate,
  requireAdmin,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: "Welcome to the admin dashboard",
      admin: req.user,
    });
  }
);

export default router;