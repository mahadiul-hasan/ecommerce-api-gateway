import app from "./app";
import config from "./config";

const PORT = config.port;

app.listen(PORT, () => {
	console.log(`API Gateway running on port ${PORT}`);
	console.log(`Environment: ${config.env}`);
	console.log(`Services configured:`);
	console.log(`- Auth: ${config.services.auth}`);
	console.log(`- Customer: ${config.services.customer}`);
	console.log(`- Vendor: ${config.services.vendor}`);
	console.log(`- Admin: ${config.services.admin}`);
});
