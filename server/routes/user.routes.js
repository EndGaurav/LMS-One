import { Router } from "express";
import { 
    getUserProfile, 
    loginUser, 
    logoutUser, 
    registerUser, 
    updateUserProfile 
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


// Protected routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/currentUser").get(verifyJWT, getUserProfile)
router.route("/update-account").patch(verifyJWT, upload.single("profilePhoto"), updateUserProfile)    
export default router;