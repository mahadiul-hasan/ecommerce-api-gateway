import { Request, Response } from "express";
import { serviceProxy } from "../services/proxy";

export const proxyToService = (service: string) => {
	return async (req: Request, res: Response) => {
		try {
			const path = req.originalUrl.replace(`/api/${service}`, "") || "/";
			const response = await serviceProxy.proxyRequest(
				req,
				service,
				path
			);

			// Handle redirects
			if (response.status === 302 && response.headers?.location) {
				return res.redirect(response.headers.location);
			}

			// Forward set-cookie headers from the service
			if (response.headers?.["set-cookie"]) {
				res.setHeader("set-cookie", response.headers["set-cookie"]);
			}

			// Send the response with proper status and data
			res.status(response.status || 200).json(response.data);
		} catch (error: any) {
			res.status(error.status || 500).json(
				error.data || { error: "Proxy error" }
			);
		}
	};
};
