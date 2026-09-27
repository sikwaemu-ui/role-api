import { registerSchema } from "../schemas/auth.schema.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { AuthRequest } from "../middleware/auth.middleware.js";




//register user
export const register = async (
    req: Request,
    res: Response
) => {
try{
    //validate the request
    const data = registerSchema.parse(req.body);
    const{name, email, password} = data;


     // Check existing user
    const existingUser = await prisma.user.findUnique({
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
    const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
    const user = await prisma.user.create({
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

  } catch (error: any) {

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
}

//login user
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate request
    const data = loginSchema.parse(req.body);

    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
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
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(
      user.id
    );

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

  } catch (error: any) {

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



export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};