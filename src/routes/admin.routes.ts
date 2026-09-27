import { Router, Response } from "express";
import {
  authenticate,
  AuthRequest,
} from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";

const router = Router();

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