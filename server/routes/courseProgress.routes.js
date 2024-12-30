import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCourseProgress, markAsCompleted, markAsInCompleted, updateLectureProgress } from "../controllers/courseProgress.controller.js";



const router = Router();


// Protected routes
router.route("/:courseId").get(verifyJWT, getCourseProgress);
router.route("/:courseId/lecture/:lectureId/view").patch(verifyJWT, updateLectureProgress);
router.route("/:courseId/complete").patch(verifyJWT, markAsCompleted);
router.route("/:courseId/incomplete").patch(verifyJWT, markAsInCompleted);


export default router;