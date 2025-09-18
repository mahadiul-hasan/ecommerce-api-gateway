import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { proxyToService } from "../controllers/proxyController";

const router = Router();

// Registration routes
router.post("/vendor/register", proxyToService("vendor"));

// ===== PROTECTED ROUTES =====
router.use(authenticateToken);

// ===== VENDOR ROUTES =====
router.get(
	"/vendor/profile",
	requireRole(["vendor"]),
	proxyToService("vendor")
);
router.put(
	"/vendor/profile",
	requireRole(["vendor"]),
	proxyToService("vendor")
);
router.delete(
	"/vendor/profile",
	requireRole(["vendor"]),
	proxyToService("vendor")
);

// Vendor shop routes
router.get("/vendor/shops", requireRole(["vendor"]), proxyToService("vendor"));
router.post("/vendor/shops", requireRole(["vendor"]), proxyToService("vendor"));
router.get(
	"/vendor/shops/:id",
	requireRole(["vendor"]),
	proxyToService("vendor")
);
router.put(
	"/vendor/shops/:id",
	requireRole(["vendor"]),
	proxyToService("vendor")
);
router.delete(
	"/vendor/shops/:id",
	requireRole(["vendor"]),
	proxyToService("vendor")
);

// Vendor management routes
router.post(
	"/vendor/management-register",
	requireRole(["vendor"]),
	proxyToService("vendor")
);

export const VendorRoute = router;
