import { Request, Response } from "express";
import { serviceProxy } from "../services/proxy";

export const proxyToService = (service: string) => {
	return async (req: Request, res: Response) => {
		try {
			// Remove the /api prefix and service prefix to get the actual path
			const path = req.originalUrl.replace(`/api/${service}`, "") || "/";

			const data = await serviceProxy.proxyRequest(req, service, path);
			res.json(data);
		} catch (error: any) {
			res.status(error.status || 500).json(
				error.data || { error: "Proxy error" }
			);
		}
	};
};
