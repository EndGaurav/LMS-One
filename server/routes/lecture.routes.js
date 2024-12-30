import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createLecture, getAllLectures, getLectureById, removeLecture, updateLecture, uplaodVideoFile } from "../controllers/lecture.controller.js";


const router = Router();


// Protected routes
router.route("/:courseId").post(verifyJWT, createLecture);
router.route("/:courseId").get(verifyJWT, getAllLectures);
router.route("/update-video/:lectureId").post(verifyJWT, upload.single("videoFile"), uplaodVideoFile);
router.route("/update-lecture/:lectureId").post(verifyJWT, updateLecture);
router.route("/:lectureId").delete(verifyJWT, removeLecture).get(verifyJWT, getLectureById);
router.route("/l/:lectureId").get(verifyJWT, getLectureById);


export default router;