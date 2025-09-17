import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	env: process.env.NODE_ENV,
	port: process.env.PORT,

	jwt: {
		secret: process.env.JWT_SECRET!,
		refreshSecret: process.env.JWT_REFRESH_SECRET!,
	},

	services: {
		auth: process.env.AUTH_SERVICE_URL!,
		customer: process.env.CUSTOMER_SERVICE_URL!,
		vendor: process.env.VENDOR_SERVICE_URL!,
		admin: process.env.ADMIN_SERVICE_URL!,
	},

	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
		max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
	},
};
