import mongoose from "mongoose";
import { logger } from "../utils/mongoLogger";
import config from "./index";

const MONGODB_URI = config.database_url as string;

export const connectDatabase = async (): Promise<void> => {
	try {
		await mongoose.connect(MONGODB_URI);
		logger.info("MongoDB connected successfully");
	} catch (error) {
		logger.error("MongoDB connection error:", error);
		process.exit(1);
	}
};

export const disconnectDatabase = async (): Promise<void> => {
	try {
		await mongoose.disconnect();
		logger.info("MongoDB disconnected successfully");
	} catch (error) {
		logger.error("MongoDB disconnection error:", error);
	}
};
