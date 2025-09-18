import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { proxyToService } from "../controllers/proxyController";

const router = Router();

// Registration routes
router.post("/customer/register", proxyToService("customer"));

// ===== PROTECTED ROUTES =====
router.use(authenticateToken);

// ===== CUSTOMER ROUTES =====
router.get(
	"/customer/profile",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.put(
	"/customer/profile",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.delete(
	"/customer/profile",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.get(
	"/customer/addresses",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.post(
	"/customer/addresses",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.put(
	"/customer/addresses/:id",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.delete(
	"/customer/addresses/:id",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.get(
	"/customer/payment-methods",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.post(
	"/customer/payment-methods",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.put(
	"/customer/payment-methods/:id",
	requireRole(["customer"]),
	proxyToService("customer")
);
router.delete(
	"/customer/payment-methods/:id",
	requireRole(["customer"]),
	proxyToService("customer")
);

export const CustomerRoute = router;
