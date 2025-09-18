import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestLogger, morganStream } from "./utils/mongoLogger";
import routes from "./routes";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { logCleanupService } from "./services/logCleanup";
import config from "./config";

const app = express();

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
			},
		},
		crossOriginEmbedderPolicy: false,
	})
);

// CORS configuration
const corsOptions = {
	origin: (
		origin: string | undefined,
		callback: (err: Error | null, allow?: boolean) => void
	) => {
		if (!origin) return callback(null, true);

		const allowedOrigins =
			config.env === "production"
				? [
						"https://mshop.com",
						"https://admin.mshop.com",
						"https://vendor.mshop.com",
				  ]
				: [
						"http://localhost:3000",
						"http://localhost:3001",
						"http://localhost:3002",
				  ];

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Compression for production
if (config.env === "production") {
	app.use(compression());
}

// Request logging
app.use(requestLogger);

// HTTP request logging with Morgan
app.use(
	morgan("combined", {
		stream: morganStream,
		skip: (req) => req.url === "/health",
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.max,
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => {
		return req.ip || req.connection.remoteAddress || "unknown";
	},
	skip: (req) => {
		return req.url === "/health";
	},
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", async (req, res) => {
	try {
		const dbStats = await logCleanupService
			.getDatabaseStats()
			.catch(() => null);

		res.status(200).json({
			status: "OK",
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			environment: config.env,
			database: dbStats
				? {
						totalLogs: dbStats.totalLogs,
						oldestLog: dbStats.oldestLog,
						newestLog: dbStats.newestLog,
				  }
				: "disconnected",
		});
	} catch (error) {
		res.status(500).json({
			status: "ERROR",
			error: "Health check failed",
		});
	}
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
