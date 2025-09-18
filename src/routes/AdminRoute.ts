import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
	requireRoleAndPermission,
	canManageResource,
} from "../middleware/roles";
import { proxyToService } from "../controllers/proxyController";
import { PERMISSIONS } from "../utils/permissions";

const router = Router();

// ===== PROTECTED ROUTES =====
router.use(authenticateToken);

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

export const AdminRoute = router;
