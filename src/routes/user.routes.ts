import { Router, Response } from "express";
import {
  authenticate,
  AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/profile",
  authenticate,
  (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      message: "Authenticated user",
      user: req.user,
    });
  }
);

export default router;