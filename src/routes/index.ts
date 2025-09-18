import { Router } from "express";
import { AuthRoute } from "./AuthRoute";
import { CustomerRoute } from "./CustomerRoute";
import { VendorRoute } from "./VendorRoute";
import { AdminRoute } from "./AdminRoute";
import { LogManagementRoute } from "./logManagement";
const router = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoute,
	},
	{
		path: "/customer",
		route: CustomerRoute,
	},
	{
		path: "/vendor",
		route: VendorRoute,
	},
	{
		path: "/admin",
		route: AdminRoute,
	},
	{
		path: "/admin/logs",
		route: LogManagementRoute,
	},
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
