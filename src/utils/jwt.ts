import jwt from "jsonwebtoken";
import config from "../config";

export const verifyToken = (token: string): any => {
	try {
		return jwt.verify(token, config.jwt.secret);
	} catch (error) {
		throw new Error("Invalid or expired token");
	}
};

export const decodeToken = (token: string): any => {
	try {
		return jwt.decode(token);
	} catch (error) {
		throw new Error("Invalid token");
	}
};
