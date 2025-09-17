import { ErrorLog } from "../models/ErrorLog";
import { logger } from "../utils/mongoLogger";

export class LogCleanupService {
	private cleanupInterval: NodeJS.Timeout | null = null;
	private cleanupDays: number = 30; // Default: remove logs older than 30 days

	constructor(cleanupDays: number = 30) {
		this.cleanupDays = cleanupDays;
	}

	/**
	 * Start automated log cleanup
	 */
	startAutomatedCleanup(intervalMs: number = 24 * 60 * 60 * 1000): void {
		// Run immediately on startup
		this.cleanupOldLogs().catch((err) => {
			logger.error("Initial log cleanup failed", { error: err.message });
		});

		// Set up periodic cleanup
		this.cleanupInterval = setInterval(() => {
			this.cleanupOldLogs().catch((err) => {
				logger.error("Periodic log cleanup failed", {
					error: err.message,
				});
			});
		}, intervalMs);

		logger.info("Automated log cleanup started", {
			interval: `${intervalMs / 1000 / 60 / 60} hours`,
			retentionDays: this.cleanupDays,
		});
	}

	/**
	 * Stop automated log cleanup
	 */
	stopAutomatedCleanup(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
			logger.info("Automated log cleanup stopped");
		}
	}

	/**
	 * Clean up logs older than specified days
	 */
	async cleanupOldLogs(): Promise<{ deletedCount: number; error?: string }> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - this.cleanupDays);

			const result = await ErrorLog.deleteMany({
				timestamp: { $lt: cutoffDate },
			});

			logger.info("Log cleanup completed", {
				deletedCount: result.deletedCount,
				cutoffDate: cutoffDate.toISOString(),
				retentionDays: this.cleanupDays,
			});

			return { deletedCount: result.deletedCount };
		} catch (error: any) {
			const errorMessage = `Log cleanup failed: ${error.message}`;
			logger.error(errorMessage, { error: error.message });
			return { deletedCount: 0, error: errorMessage };
		}
	}

	/**
	 * Clean up logs for a specific service
	 */
	async cleanupServiceLogs(
		service: string,
		days: number = this.cleanupDays
	): Promise<{ deletedCount: number; error?: string }> {
		try {
			const cutoffDate = new Date();
			cutoffDate.setDate(cutoffDate.getDate() - days);

			const result = await ErrorLog.deleteMany({
				service: service,
				timestamp: { $lt: cutoffDate },
			});

			logger.info("Service log cleanup completed", {
				service,
				deletedCount: result.deletedCount,
				cutoffDate: cutoffDate.toISOString(),
				retentionDays: days,
			});

			return { deletedCount: result.deletedCount };
		} catch (error: any) {
			const errorMessage = `Service log cleanup failed for ${service}: ${error.message}`;
			logger.error(errorMessage, { service, error: error.message });
			return { deletedCount: 0, error: errorMessage };
		}
	}

	/**
	 * Get database statistics
	 */
	async getDatabaseStats(): Promise<{
		totalLogs: number;
		oldestLog: Date | null;
		newestLog: Date | null;
		logsByLevel: Record<string, number>;
		logsByService: Record<string, number>;
	}> {
		try {
			const totalLogs = await ErrorLog.countDocuments();
			const oldestLog = await ErrorLog.findOne()
				.sort({ timestamp: 1 })
				.select("timestamp");
			const newestLog = await ErrorLog.findOne()
				.sort({ timestamp: -1 })
				.select("timestamp");

			// Get logs count by level
			const levelsStats = await ErrorLog.aggregate([
				{ $group: { _id: "$level", count: { $sum: 1 } } },
			]);

			// Get logs count by service
			const servicesStats = await ErrorLog.aggregate([
				{ $group: { _id: "$service", count: { $sum: 1 } } },
			]);

			const logsByLevel: Record<string, number> = {};
			levelsStats.forEach((stat) => {
				logsByLevel[stat._id] = stat.count;
			});

			const logsByService: Record<string, number> = {};
			servicesStats.forEach((stat) => {
				logsByService[stat._id] = stat.count;
			});

			return {
				totalLogs,
				oldestLog: oldestLog?.timestamp || null,
				newestLog: newestLog?.timestamp || null,
				logsByLevel,
				logsByService,
			};
		} catch (error: any) {
			logger.error("Failed to get database stats", {
				error: error.message,
			});
			throw error;
		}
	}

	/**
	 * Set new retention period
	 */
	setRetentionDays(days: number): void {
		if (days < 1) {
			throw new Error("Retention period must be at least 1 day");
		}
		this.cleanupDays = days;
		logger.info("Retention period updated", { retentionDays: days });
	}
}

// Singleton instance
export const logCleanupService = new LogCleanupService();
