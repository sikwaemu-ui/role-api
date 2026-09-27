import { Router } from "express";
import { register, login, getMe, } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = Router();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, minLength: 2, example: John Doe }
 *               email: { type: string, format: email, example: john@example.com }
 *               password: { type: string, minLength: 6, example: Password123 }
 *     responses:
 *       '201': { description: User registered successfully }
 *       '400': { description: Invalid request body, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       '409': { description: Email already exists }
 */
router.post("/register", register);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: john@example.com }
 *               password: { type: string, example: Password123 }
 *     responses:
 *       '200':
 *         description: Login successful; authorize with the returned JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Login successful }
 *                 token: { type: string, description: JWT bearer token }
 *                 user: { $ref: '#/components/schemas/User' }
 *       '400': { description: Invalid request body }
 *       '401': { description: Invalid email or password }
 */
router.post("/login", login);
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the authenticated user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 user: { $ref: '#/components/schemas/User' }
 *       '401': { description: Missing, invalid, or expired token }
 */
router.get("/me", authenticate, getMe);
export default router;
