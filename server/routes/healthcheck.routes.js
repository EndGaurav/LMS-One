import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/").get(healthCheck)

export default router;