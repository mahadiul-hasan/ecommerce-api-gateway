import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import fs from "fs";
import yaml from "js-yaml";
import path from "path";

export const setupSwagger = (app: Express) => {
	const swaggerPath = path.join(__dirname, "./docs/swagger.yaml");
	const swaggerDocument = yaml.load(
		fs.readFileSync(swaggerPath, "utf8")
	) as object;

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
