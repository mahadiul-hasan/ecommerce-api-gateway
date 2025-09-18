import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Request } from "express";
import config from "../config";
import { logger } from "../utils/mongoLogger";

class ServiceProxy {
	private services: Map<string, AxiosInstance>;

	constructor() {
		this.services = new Map();

		// Initialize all service clients
		this.initializeService("auth", config.services.auth);
		this.initializeService("customer", config.services.customer);
		this.initializeService("vendor", config.services.vendor);
		this.initializeService("admin", config.services.admin);
	}

	private initializeService(name: string, baseURL: string) {
		const instance = axios.create({
			baseURL,
			timeout: 10000,
			withCredentials: true,
		});

		// Request interceptor
		instance.interceptors.request.use(
			(config) => {
				logger.info(
					`Proxying request to ${name} service: ${config.method?.toUpperCase()} ${
						config.url
					}`
				);
				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		// Response interceptor
		instance.interceptors.response.use(
			(response) => response,
			(error) => {
				logger.error(`Error from ${name} service:`, error.message);
				return Promise.reject(error);
			}
		);

		this.services.set(name, instance);
	}

	private getServiceInstance(service: string): AxiosInstance {
		const instance = this.services.get(service);
		if (!instance) {
			throw new Error(`Service not configured: ${service}`);
		}
		return instance;
	}

	async proxyRequest(req: Request, service: string, path: string) {
		const instance = this.getServiceInstance(service);

		try {
			const config: AxiosRequestConfig = {
				method: req.method as any,
				url: path,
				params: req.query,
				data: req.body,
				headers: {
					// Forward necessary headers
					...req.headers,
					authorization: req.headers.authorization,
					"content-type": req.headers["content-type"],
					accept: req.headers["accept"],
					"user-agent": req.headers["user-agent"],
					// Remove headers that shouldn't be forwarded
					host: undefined,
					"content-length": undefined,
					connection: undefined,
					cookie: req.headers.cookie,
				},
				withCredentials: true,
				maxRedirects: 0, // Don't follow redirects automatically
			};

			const response = await instance.request(config);

			// Return the full response object including headers and status
			return {
				status: response.status,
				data: response.data,
				headers: response.headers,
			};
		} catch (error: any) {
			// Handle OAuth redirects (302 responses)
			if (
				error.response?.status === 302 &&
				error.response.headers?.location
			) {
				return {
					status: 302,
					headers: {
						location: error.response.headers.location,
						// Forward other headers if needed
						...error.response.headers,
					},
					data: null,
				};
			}

			// Enhanced error handling for other cases
			if (error.response) {
				// Service responded with error status
				throw {
					status: error.response.status,
					data: error.response.data,
					headers: error.response.headers,
					service,
					path,
				};
			} else if (error.code === "ECONNREFUSED") {
				// Service unavailable
				throw {
					status: 503,
					data: {
						error: "Service temporarily unavailable",
						service,
						message: `Cannot connect to ${service} service`,
					},
				};
			} else if (error.code === "ETIMEDOUT") {
				// Request timeout
				throw {
					status: 504,
					data: {
						error: "Service timeout",
						service,
						message: `${service} service did not respond in time`,
					},
				};
			} else {
				// Other errors
				throw {
					status: 500,
					data: {
						error: "Internal proxy error",
						service,
						message: error.message,
					},
				};
			}
		}
	}
}

export const serviceProxy = new ServiceProxy();
