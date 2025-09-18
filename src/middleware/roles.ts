import { Request, Response, NextFunction } from "express";
import axios from "axios";
import config from "../config";

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
