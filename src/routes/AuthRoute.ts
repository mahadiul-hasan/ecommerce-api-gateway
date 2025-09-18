import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { proxyToService } from "../controllers/proxyController";

const router = Router();

// ===== PUBLIC ROUTES =====
// Auth routes
router.post("/auth/login", proxyToService("auth"));
router.post("/auth/register", proxyToService("auth"));
router.post("/auth/refresh-token", proxyToService("auth"));
router.post("/auth/forgot-password", proxyToService("auth"));
router.post("/auth/reset-password", proxyToService("auth"));

// OAuth routes
router.get("/oauth/google", proxyToService("auth"));
router.get("/oauth/google/callback", proxyToService("auth"));
router.get("/oauth/success", proxyToService("auth"));
router.get("/oauth/failure", proxyToService("auth"));

// ===== PROTECTED ROUTES =====
router.use(authenticateToken);

// Auth routes
router.post("/auth/change-password", proxyToService("auth"));
router.post("/auth/logout", proxyToService("auth"));

export const AuthRoute = router;
