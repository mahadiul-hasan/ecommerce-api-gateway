import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import config from "../config";
import { IGenericErrorMessage } from "../interfaces/error";
import ApiError from "../errors/ApiError";
import { ZodError } from "zod";
import handleZodError from "../errors/handleZodError";
import handleCastError from "../errors/handleCastError";
import handleValidationError from "../errors/handleValidationError";
import { logger } from "../utils/mongoLogger";

const globalErrorHandler: ErrorRequestHandler = (
	error,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	config.env === "development"
		? logger.info(`🐱‍🏍 globalErrorHandler ~~`, error)
		: logger.error(`🐱‍🏍 globalErrorHandler ~~`, error);

	let statusCode = 500;
	let message = "Something went wrong !";
	let errorMessages: IGenericErrorMessage[] = [];

	// Extract service name from error or URL
	const serviceName =
		error.service ||
		req.url.split("/")[2] || // Extract from URL like /api/auth/login
		"api-gateway";

	logger.error("Global Error Handler", {
		service: serviceName,
		message: error.message,
		stack: error.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
		userId: (req as any).userId || "unknown",
		statusCode: error.statusCode || statusCode,
		metadata: {
			originalUrl: req.originalUrl,
			query: req.query,
			body: req.body,
			params: req.params,
		},
	});

	if (error?.name === "ValidationError") {
		const simplifiedError = handleValidationError(error);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorMessages = simplifiedError.errorMessages;
	} else if (error instanceof ZodError) {
		const simplifiedError = handleZodError(error);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorMessages = simplifiedError.errorMessages;
	} else if (error?.name === "CastError") {
		const simplifiedError = handleCastError(error);
		statusCode = simplifiedError.statusCode;
		message = simplifiedError.message;
		errorMessages = simplifiedError.errorMessages;
	} else if (error instanceof ApiError) {
		statusCode = error?.statusCode;
		message = error.message;
		errorMessages = error?.message
			? [
					{
						path: "",
						message: error?.message,
					},
			  ]
			: [];
	} else if (error instanceof Error) {
		message = error?.message;
		errorMessages = error?.message
			? [
					{
						path: "",
						message: error?.message,
					},
			  ]
			: [];
	}

	res.status(statusCode).json({
		success: false,
		message,
		errorMessages,
		stack: config.env !== "production" ? error?.stack : undefined,
	});
};

export default globalErrorHandler;
