import { Request, Response, NextFunction } from "express";
import axios from "axios";
import config from "../config";

// Permission constants
export const PERMISSIONS = {
	// User permissions
	USER_READ: "user.read",
	USER_CREATE: "user.create",
	USER_UPDATE: "user.update",
	USER_DELETE: "user.delete",
	USER_MANAGE_STATUS: "user.manage_status",

	// Customer permissions
	CUSTOMER_READ: "customer.read",
	CUSTOMER_CREATE: "customer.create",
	CUSTOMER_UPDATE: "customer.update",
	CUSTOMER_DELETE: "customer.delete",
	CUSTOMER_MANAGE_STATUS: "customer.manage_status",

	// Vendor permissions
	VENDOR_READ: "vendor.read",
	VENDOR_CREATE: "vendor.create",
	VENDOR_UPDATE: "vendor.update",
	VENDOR_DELETE: "vendor.delete",
	VENDOR_MANAGE_STATUS: "vendor.manage_status",
	VENDOR_APPROVE: "vendor.approve",
	VENDOR_REJECT: "vendor.reject",

	// Shop permissions
	SHOP_READ: "shop.read",
	SHOP_CREATE: "shop.create",
	SHOP_UPDATE: "shop.update",
	SHOP_DELETE: "shop.delete",
	SHOP_MANAGE_STATUS: "shop.manage_status",

	// Role permissions
	ROLE_READ: "role.read",
	ROLE_CREATE: "role.create",
	ROLE_UPDATE: "role.update",
	ROLE_DELETE: "role.delete",

	// Permission permissions
	PERMISSION_READ: "permission.read",
	PERMISSION_CREATE: "permission.create",
	PERMISSION_UPDATE: "permission.update",
	PERMISSION_DELETE: "permission.delete",

	// System permissions
	SYSTEM_STATS_READ: "system.stats.read",
	SYSTEM_HEALTH_READ: "system.health.read",
};

export const requireRole = (roles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Check if user has one of the required roles
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				error:
					"Insufficient role permissions. Required roles: " +
					roles.join(", "),
			});
		}

		next();
	};
};

export const requirePermission = (permission: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		try {
			// For super admin, allow all permissions
			if (req.user.role === "super_admin") {
				return next();
			}

			// Call auth service to check user permissions
			const authServiceUrl = `${config.services.auth}/auth/check-permission`;

			const response = await axios.post(
				authServiceUrl,
				{
					userId: req.user.userId,
					permission: permission,
				},
				{
					headers: {
						Authorization: req.headers.authorization,
						"Content-Type": "application/json",
					},
					timeout: 5000,
				}
			);

			const hasPermission = response.data.hasPermission;

			if (!hasPermission) {
				return res.status(403).json({
					error: `Insufficient permissions. Required: ${permission}`,
				});
			}

			next();
		} catch (error: any) {
			console.error("Permission check failed:", error.message);

			if (error.response?.status === 403) {
				return res.status(403).json({
					error: `Insufficient permissions. Required: ${permission}`,
				});
			}

			return res.status(500).json({
				error: "Permission check service unavailable",
			});
		}
	};
};

// Middleware that requires both role AND permission
export const requireRoleAndPermission = (
	roles: string[],
	permission: string
) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// First check role
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				error:
					"Insufficient role permissions. Required roles: " +
					roles.join(", "),
			});
		}

		// Then check permission
		await requirePermission(permission)(req, res, next);
	};
};

// Middleware to check if user can manage specific resource
export const canManageResource = (resourceType: string, action: string) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({ error: "Authentication required" });
		}

		try {
			const resourceId = req.params.id || req.body.id;

			// For super admin, allow all operations
			if (req.user.role === "super_admin") {
				return next();
			}

			// Call auth service to check resource management permissions
			const authServiceUrl = `${config.services.auth}/auth/can-manage-resource`;

			const response = await axios.post(
				authServiceUrl,
				{
					userId: req.user.userId,
					resourceType,
					resourceId,
					action: action || req.method.toLowerCase(),
				},
				{
					headers: {
						Authorization: req.headers.authorization,
						"Content-Type": "application/json",
					},
					timeout: 5000,
				}
			);

			if (response.data.canManage) {
				return next();
			}

			return res.status(403).json({
				error: `Insufficient permissions to manage this ${resourceType}`,
			});
		} catch (error: any) {
			console.error("Resource permission check failed:", error.message);
			return res.status(500).json({
				error: "Permission check service unavailable",
			});
		}
	};
};
