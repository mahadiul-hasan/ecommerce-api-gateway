import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import routes from "./routes";
import config from "./config";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
	cors({
		origin:
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
				  ],
		credentials: true,
	})
);

// Logging
app.use(morgan(config.env === "production" ? "combined" : "dev"));

// Rate limiting
const limiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.max,
	message: {
		error: "Too many requests from this IP, please try again later.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({
		status: "OK",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	});
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
