import axios from "axios";
import { PERMISSIONS } from "../middleware/roles";
import config from "../config";

const seedPermissions = async () => {
	try {
		console.log("Seeding default permissions...");

		const authServiceUrl = `${config.services.auth}/auth/seed-permissions`;

		const response = await axios.post(authServiceUrl, {
			permissions: Object.values(PERMISSIONS),
		});

		console.log("Permissions seeded successfully:", response.data);
	} catch (error) {
		console.error("Failed to seed permissions:", error);
	}
};

// Run if this file is executed directly
if (require.main === module) {
	seedPermissions();
}

export { seedPermissions };
