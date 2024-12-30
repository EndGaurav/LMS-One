import express, { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCheckoutSession, getAllPurchasedCourse, getCourseDetailsWithPurchaseStatus, stripeWebhook } from "../controllers/coursePurchase.controller.js";



const router = Router();


// Protected routes
router.route("/checkout/create-checkout-session").post(verifyJWT, createCheckoutSession);
router.route("/webhook").post(express.raw({type: 'application/json'}), stripeWebhook)
router.route("/course/:courseId/details-with-status").get(verifyJWT, getCourseDetailsWithPurchaseStatus);
router.route("/").get(verifyJWT, getAllPurchasedCourse);

export default router;