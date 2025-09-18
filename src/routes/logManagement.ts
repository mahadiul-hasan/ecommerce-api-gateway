import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { logCleanupService } from "../services/logCleanup";

const router = Router();

// Admin only routes for log management
router.use(authenticateToken);
router.use(requireRole(["admin", "super_admin"]));

// Get database statistics
router.get("/stats", async (req, res) => {
	try {
		const stats = await logCleanupService.getDatabaseStats();
		res.json(stats);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Manual log cleanup
router.post("/cleanup", async (req, res) => {
	try {
		const { days, service } = req.body;
		const retentionDays = parseInt(days) || 30;

		let result;
		if (service) {
			result = await logCleanupService.cleanupServiceLogs(
				service,
				retentionDays
			);
		} else {
			result = await logCleanupService.cleanupOldLogs();
		}

		res.json(result);
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Update retention policy
router.put("/retention", async (req, res) => {
	try {
		const { days } = req.body;

		if (!days || isNaN(days) || days < 1) {
			return res.status(400).json({
				error: "Valid days parameter required (minimum 1 day)",
			});
		}

		logCleanupService.setRetentionDays(parseInt(days));
		res.json({ message: `Retention period updated to ${days} days` });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
});

// Get current retention policy
router.get("/retention", (req, res) => {
	res.json({ retentionDays: (logCleanupService as any).cleanupDays });
});

export const LogManagementRoute = router;
