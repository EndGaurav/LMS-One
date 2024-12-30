import { Router } from "express";
import { 
    createCourse, 
    editCourse, 
    getCourseById, 
    getCreatorCourses, 
    getPublishedCourse, 
    removeCourse, 
    searchCourse, 
    togglePublishCourse 
} from "../controllers/course.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

// unprotected routes
router.route("/published-courses").get(getPublishedCourse);

// Protected routes
router.route("/").post(verifyJWT, createCourse);
router.route("/search").get(verifyJWT, searchCourse);
router.route("/").get(verifyJWT, getCreatorCourses);
router.route("/:courseId").post(verifyJWT, upload.single("courseThumbnail"), editCourse).get(verifyJWT, getCourseById);
router.route("/:courseId").get(verifyJWT, getCourseById);
router.route("/:courseId").delete(verifyJWT, removeCourse);
router.route("/t/:courseId").patch(verifyJWT, togglePublishCourse);





export default router;