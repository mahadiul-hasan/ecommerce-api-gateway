import { Request, Response } from "express";
import { serviceProxy } from "../services/proxy";

export const proxyToService = (service: string) => {
	return async (req: Request, res: Response) => {
		try {
			const path = req.originalUrl.replace(`/api/${service}`, "") || "/";
			const proxyResponse = await serviceProxy.proxyRequest(
				req,
				service,
				path
			);

			// Handle redirects (OAuth 302)
			if (
				proxyResponse.status === 302 &&
				proxyResponse.headers?.location
			) {
				return res.redirect(proxyResponse.headers.location);
			}

			// Forward set-cookie headers from the service
			const setCookieHeader = proxyResponse.headers?.["set-cookie"];
			if (setCookieHeader) {
				// Set cookies for frontend domain
				res.setHeader("set-cookie", setCookieHeader);
			}

			// Send response
			res.status(proxyResponse.status || 200).json(proxyResponse.data);
		} catch (error: any) {
			res.status(error.status || 500).json(
				error.data || { error: "Proxy error" }
			);
		}
	};
};
