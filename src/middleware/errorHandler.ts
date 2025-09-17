import { Request, Response, NextFunction } from "express";

export const errorHandler = (
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	console.error("Error:", error);

	const status = error.status || 500;
	const message = error.message || "Internal Server Error";
	const data = error.data || {};

	res.status(status).json({
		error: message,
		...data,
		...(process.env.NODE_ENV === "development" && { stack: error.stack }),
	});
};
