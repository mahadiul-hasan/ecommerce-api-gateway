import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const authenticateToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

		if (!token) {
			return res.status(401).json({
				error: "Access token required",
			});
		}

		const decoded = verifyToken(token);
		req.user = decoded;
		req.userId = decoded.userId;

		next();
	} catch (error) {
		return res.status(403).json({
			error: "Invalid or expired token",
		});
	}
};
