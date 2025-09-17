import winston from "winston";
import "winston-mongodb";
import config from "../config";

// Create logger instance with winston-mongodb
export const logger = winston.createLogger({
	level: config.env === "production" ? "info" : "debug",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	defaultMeta: { service: "api-gateway" },
	transports: [
		// Console transport
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		}),
	],
});

if (config.database_url) {
	logger.add(
		new winston.transports.MongoDB({
			db: config.database_url,
			options: {
				useUnifiedTopology: true,
			},
			collection: "error_logs",
			level: "warn", // Only store warnings and errors
			storeHost: true,
			tryReconnect: true,
			includeIds: true,
		} as any)
	); // Use "as any" to bypass TypeScript checking for now
}

// Morgan stream for HTTP logging
export const morganStream = {
	write: (message: string) => {
		const logData = parseMorganMessage(message);
		logger.info("HTTP Request", logData);
	},
};

// Parse Morgan log message
function parseMorganMessage(message: string): any {
	const regex =
		/(\S+)\s+(\S+)\s+(\d+)\s+(\S+)\s+ms\s+-\s+(\S+)\s+(\S+)\s+(.+)/;
	const match = message.match(regex);

	if (match) {
		return {
			method: match[1],
			url: match[2],
			status: parseInt(match[3]),
			responseTime: match[4],
			contentLength: match[5],
			ip: match[6],
			userAgent: match[7],
		};
	}
	return { message };
}

// Service error logging function
export const logServiceError = (
	service: string,
	error: any,
	context: any = {}
) => {
	logger.error("Service Error", {
		service,
		message: error.message,
		stack: error.stack,
		code: error.code,
		...context,
	});
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		const logData = {
			method: req.method,
			url: req.url,
			status: res.statusCode,
			duration: `${duration}ms`,
			ip: req.ip,
			userAgent: req.get("User-Agent"),
			userId: req.userId || "anonymous",
		};

		if (res.statusCode >= 400) {
			logger.warn("Request Completed with Error", logData);
		} else {
			logger.info("Request Completed", logData);
		}
	});

	next();
};
