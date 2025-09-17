import { Server } from "http";
import app from "./app";
import { logCleanupService } from "./services/logCleanup";
import { logger } from "./utils/mongoLogger";
import config from "./config";
import { connectDatabase } from "./config/database";

async function bootstrap() {
	try {
		// Use the connectDatabase function instead of direct mongoose.connect
		await connectDatabase();
		logger.info(`🛢   Database is connected successfully`);

		// Start automated log cleanup after DB connection is established
		if (config.env === "production") {
			// Run every 24 hours in production
			logCleanupService.startAutomatedCleanup(24 * 60 * 60 * 1000);
		} else {
			// Run every 6 hours in development
			logCleanupService.startAutomatedCleanup(6 * 60 * 60 * 1000);
		}

		const server: Server = app.listen(config.port, () => {
			logger.info(`Server running on port ${config.port}`);
		});

		const exitHandler = () => {
			if (server) {
				server.close(() => {
					logger.info("Server closed");
					// Stop the log cleanup service
					logCleanupService.stopAutomatedCleanup();
				});
			}
			process.exit(1);
		};

		const unexpectedErrorHandler = (error: unknown) => {
			logger.error("Unexpected error:", error);
			exitHandler();
		};

		process.on("uncaughtException", unexpectedErrorHandler);
		process.on("unhandledRejection", unexpectedErrorHandler);

		process.on("SIGTERM", () => {
			logger.info("SIGTERM received");
			if (server) {
				server.close(() => {
					// Stop the log cleanup service
					logCleanupService.stopAutomatedCleanup();
				});
			}
		});

		process.on("SIGINT", () => {
			logger.info("SIGINT received");
			if (server) {
				server.close(() => {
					// Stop the log cleanup service
					logCleanupService.stopAutomatedCleanup();
				});
			}
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
}

bootstrap();
