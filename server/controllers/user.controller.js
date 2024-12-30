import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { autoCropUrl, deleteOnCloudinary, optimizedUrl, uploadOnCloudinary } from "../utils/cloudinary.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        // console.log("user: ", user);

        if (!user) {
            throw new ApiError(400, "No user exist");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        // console.log("Error in generating access and refresh token: ", error);
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!(name || email || password)) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(400, "user already exist");
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    if (!user) {
        throw new ApiError(500, "User creation failed");
    }

    const createdUser = await User.findById(user?._id).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, createdUser, "Account created successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!(email || password || role)) {
        throw new ApiError(400, "Both fields are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User is not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect email or password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user?._id);

    const loggedInUser = await User.findById(user?._id).select("-password -refreshToken");

    if (!loggedInUser) {
        throw new ApiError(404, "User not found");
    }


    const options = {
        httpOnly: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
        secure:  true  // process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, `Welcome back ${loggedInUser.name}`));
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, { $set: { refreshToken: undefined } }, { new: true });

    const options = {
        httpOnly: true,
        secure: true,   // process.env.NODE_ENV === "production",
        sameSite: "None"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
})

const getUserProfile = asyncHandler(async (req, res) => {
    // const user = await User.aggregate([
    //     {
    //         $match: {
    //             _id: req.user?._id
    //         }
    //     },
    //     {
    //         $project: {
    //             name: 1,
    //             email: 1,
    //             role: 1,
    //             createdAt: 1,
    //             updatedAt: 1,
    //             enrolledCourses: 1,
    //             photoUrl: 1
    //         }
    //     }
    // ]);
 
    const user = await User.findById(req.user?._id).select("-password -refreshToken").populate({path: "enrolledCourses"});

    // console.log("GET USER PROFILE: ", user);
    

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user details"));
})

const updateUserProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    // console.log("Request file from multer: ",req.file);
    const fileLocalPath = req.file?.path;
    
    
    if (name && (typeof name !== "string" || name.trim() === "")) {
        throw new ApiError(400, "Invalid name");
    }

    if (!name) {
        throw new ApiError(400, "name is required");
    }

    if (!fileLocalPath) {
        throw new ApiError(400, "File is required");
    }

    const user = await User.findById(req.user?._id);
    // console.log(user);
    
    
    if (user?.photoUrl?.url) {
        const currentPhotoUrl = user.photoUrl;
        // console.log("Current Profile photo: ", currentPhotoUrl);
        try {
            await deleteOnCloudinary(currentPhotoUrl.public_id);
        } catch (error) {
            throw new ApiError(500, "Failed to delete the current photo from Cloudinary");
        }
    }
    

    const photo = await uploadOnCloudinary(fileLocalPath);
    // console.log("Photo response from cloudinary: ",photo);
    const optimizedURI = await optimizedUrl(photo.public_id);
    // console.log("Optimized URI: ",optimizedURI);
    const autoCropURI = await autoCropUrl(photo.public_id);
    // console.log("Auto crop URI: ",autoCropURI);
    
    // const {secure_url} = photo;
    
    
    if (!photo.url) {
        throw new ApiError(400, "Something went wrong while uploading avatar");
    }

    const updatedDocument = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            photoUrl: {
                // url: secure_url,
                url: autoCropURI,
                public_id: photo.public_id
            },
            name
        }
    },
        { new: true }
    ).select("-password -refreshToken");

    return res
            .status(200)
            .json(new ApiResponse(200, updatedDocument, "Profile updated successfully"));

})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
}