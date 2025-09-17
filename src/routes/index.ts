import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
	requireRole,
	requireRoleAndPermission,
	canManageResource,
	PERMISSIONS,
} from "../middleware/roles";
import { proxyToService } from "../controllers/proxyController";

const router = Router();

// ===== PUBLIC ROUTES =====
// Auth routes
router.post("/auth/login", proxyToService("auth"));
router.post("/auth/register", proxyToService("auth"));
router.post("/auth/refresh-token", proxyToService("auth"));
router.post("/auth/forgot-password", proxyToService("auth"));
router.post("/auth/reset-password", proxyToService("auth"));

// OAuth routes
router.get("/oauth/google", proxyToService("auth"));
router.get("/oauth/google/callback", proxyToService("auth"));
router.get("/oauth/success", proxyToService("auth"));
router.get("/oauth/failure", proxyToService("auth"));

// Registration routes
router.post("/customer/register", proxyToService("customer"));
router.post("/vendor/register", proxyToService("vendor"));

// ===== PROTECTED ROUTES =====
router.use(authenticateToken);

// Auth routes
router.post("/auth/change-password", proxyToService("auth"));
router.post("/auth/logout", proxyToService("auth"));

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

// ===== ADMIN ROUTES =====

// User management
router.get(
	"/admin/users",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.USER_READ),
	proxyToService("admin")
);

router.get(
	"/admin/users/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.USER_READ),
	proxyToService("admin")
);

router.put(
	"/admin/users/:id/status",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.USER_MANAGE_STATUS
	),
	canManageResource("user", "update"),
	proxyToService("admin")
);

router.delete(
	"/admin/users/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.USER_DELETE),
	canManageResource("user", "delete"),
	proxyToService("admin")
);

// Customer management
router.get(
	"/admin/customers",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.CUSTOMER_READ
	),
	proxyToService("admin")
);

router.get(
	"/admin/customers/:id",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.CUSTOMER_READ
	),
	proxyToService("admin")
);

router.put(
	"/admin/customers/:id/status",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.CUSTOMER_MANAGE_STATUS
	),
	canManageResource("customer", "update"),
	proxyToService("admin")
);

// Vendor management
router.get(
	"/admin/vendors",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.VENDOR_READ),
	proxyToService("admin")
);

router.get(
	"/admin/vendors/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.VENDOR_READ),
	proxyToService("admin")
);

router.put(
	"/admin/vendors/:id/status",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.VENDOR_MANAGE_STATUS
	),
	canManageResource("vendor", "update"),
	proxyToService("admin")
);

router.put(
	"/admin/vendors/:id/approve",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.VENDOR_APPROVE
	),
	canManageResource("vendor", "update"),
	proxyToService("admin")
);

router.put(
	"/admin/vendors/:id/reject",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.VENDOR_REJECT
	),
	canManageResource("vendor", "update"),
	proxyToService("admin")
);

// Shop management
router.get(
	"/admin/shops",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.SHOP_READ),
	proxyToService("admin")
);

router.get(
	"/admin/shops/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.SHOP_READ),
	proxyToService("admin")
);

router.put(
	"/admin/shops/:id/status",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.SHOP_MANAGE_STATUS
	),
	canManageResource("shop", "update"),
	proxyToService("admin")
);

// Role management
router.get(
	"/admin/roles",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_READ),
	proxyToService("auth")
);

router.post(
	"/admin/roles",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_CREATE),
	proxyToService("auth")
);

router.get(
	"/admin/roles/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_READ),
	proxyToService("auth")
);

router.put(
	"/admin/roles/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_UPDATE),
	proxyToService("auth")
);

router.delete(
	"/admin/roles/:id",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_DELETE),
	proxyToService("auth")
);

// Permission management
router.get(
	"/admin/permissions",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.PERMISSION_READ
	),
	proxyToService("auth")
);

router.post(
	"/admin/permissions",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.PERMISSION_CREATE
	),
	proxyToService("auth")
);

router.get(
	"/admin/permissions/:id",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.PERMISSION_READ
	),
	proxyToService("auth")
);

router.put(
	"/admin/permissions/:id",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.PERMISSION_UPDATE
	),
	proxyToService("auth")
);

router.delete(
	"/admin/permissions/:id",
	requireRoleAndPermission(
		["admin", "super_admin"],
		PERMISSIONS.PERMISSION_DELETE
	),
	proxyToService("auth")
);

// Assign permissions to roles
router.post(
	"/admin/roles/:roleId/permissions",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_UPDATE),
	proxyToService("auth")
);

router.delete(
	"/admin/roles/:roleId/permissions/:permissionId",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.ROLE_UPDATE),
	proxyToService("auth")
);

// Assign roles to users
router.post(
	"/admin/users/:userId/roles",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.USER_UPDATE),
	proxyToService("auth")
);

router.delete(
	"/admin/users/:userId/roles/:roleId",
	requireRoleAndPermission(["admin", "super_admin"], PERMISSIONS.USER_UPDATE),
	proxyToService("auth")
);

// ===== SUPER ADMIN ONLY ROUTES =====
router.post(
	"/admin/register",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_CREATE),
	proxyToService("admin")
);

router.post(
	"/admin/management-register",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_CREATE),
	proxyToService("admin")
);

// Admin user management
router.get(
	"/admin/admins",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_READ),
	proxyToService("admin")
);

router.get(
	"/admin/admins/:id",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_READ),
	proxyToService("admin")
);

router.put(
	"/admin/admins/:id",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_UPDATE),
	canManageResource("user", "update"),
	proxyToService("admin")
);

router.delete(
	"/admin/admins/:id",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.USER_DELETE),
	canManageResource("user", "delete"),
	proxyToService("admin")
);

// System management
router.get(
	"/admin/system/stats",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.SYSTEM_STATS_READ),
	proxyToService("admin")
);

router.get(
	"/admin/system/health",
	requireRoleAndPermission(["super_admin"], PERMISSIONS.SYSTEM_HEALTH_READ),
	proxyToService("admin")
);

// Fallback for undefined routes
router.all("*", (req, res) => {
	res.status(404).json({ error: "Endpoint not found" });
});

export default router;
