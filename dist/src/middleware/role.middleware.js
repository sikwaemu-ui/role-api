import prisma from "../db/prisma.js";
export const requireAdmin = async (req, res, next) => {
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
                role: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};
