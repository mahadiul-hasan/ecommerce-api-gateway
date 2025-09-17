import axios from "axios";
import { PERMISSIONS } from "../middleware/roles";
import config from "../config";
import { logger } from "../utils/mongoLogger";

const seedPermissions = async () => {
	try {
		logger.info("Seeding default permissions...");

		const authServiceUrl = `${config.services.auth}/auth/seed-permissions`;

		const response = await axios.post(authServiceUrl, {
			permissions: Object.values(PERMISSIONS),
		});

		logger.info("Permissions seeded successfully:", response.data);
	} catch (error) {
		logger.error("Failed to seed permissions:", error);
	}
};

// Run if this file is executed directly
if (require.main === module) {
	seedPermissions();
}

export { seedPermissions };
