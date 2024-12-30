import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";

const createLecture = asyncHandler(async(req, res) => {
    const {lectureTitle} = req.body;
    const {courseId} = req.params;

    if (!lectureTitle) {
        throw new ApiError(400, "Lecture title is required");
    }

    if (lectureTitle && (typeof lectureTitle !== "string" || lectureTitle.trim() === "")) {
        throw new ApiError(400, "Invalid type of lecture");
    }

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Provided invalid course id");
    }

    const lecture = await Lecture.create({
        lectureTitle,
        course_id: courseId
    })

    if (!lecture) {
        throw new ApiError(500, "Failed to created lecture, please try again");
    }

    const course = await Course.findById(courseId);

    if (course) {
        course.lectures_id?.push(lecture?._id);
        await course.save({ validateBeforeSave: false });
    }

    return res
            .status(201)
            .json(new ApiResponse(201, lecture, "Lecture created successfully."));

})

const getAllLectures = asyncHandler(async(req, res) => {
    const {courseId} = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Provided invalid course id");
    }

    // any one you can use either aggregation pipeline or populate 
    // const course = await Course.findById(courseId).populate("lectures_id");
    const course = await Course.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(courseId)
            }
        },
        {
            $lookup: {
                from: "lectures",
                localField: "lectures_id",
                foreignField: "_id",
                as: "lectures_details"
            }
        },
        {
            $project: {
                lectures_details: 1
            }
        }
    ])

    
    if (course[0]?.lectures_details.length === 0) {
        throw new ApiError(400, "No lecture available");
    }

    // console.log("Lectures: ", course[0].lectures_details);
    
    // return res
    //         .status(200)
    //         .json(new ApiResponse(200, course, "all lectures fetched successfully"));
    return res
            .status(200)
            .json(new ApiResponse(200, course[0]?.lectures_details, "all lectures fetched successfully"));
})

const updateLecture = asyncHandler(async(req, res) => {
    const {lectureTitle, isPreviewFree, uploadVideoInfo} = req.body;
    const { lectureId } = req.params;

    if (lectureTitle && (typeof lectureTitle !== "string" || lectureTitle.trim() === "")) {
        throw new ApiError(400, "Lecture title is required");
    }

    if (!isValidObjectId(lectureId)) {
        throw new ApiError(400, "Provide valid lecture id");
    }

    const lecture = await Lecture.findById(lectureId);
   
    
    const updatedLecture = await Lecture.findByIdAndUpdate(
        lectureId,
        {
            $set: {
                lectureTitle,
                videoFile: {
                    url: uploadVideoInfo.secure_url,
                    public_id: uploadVideoInfo.public_id
                },
                isPreviewFree
            }
        },
        { new: true }
    );

    if (!updatedLecture) {
        throw new ApiError(500, "Failed to updated lecture");
    }

    
    return res
            .status(200)
            .json(new ApiResponse(200, updatedLecture, "Lecture updated successfully"));
})

const removeLecture = asyncHandler(async(req, res) => {
    const { lectureId } = req.params;

    if (!isValidObjectId(lectureId)) {
        throw new ApiError(400, "Invalid lecture id");
    }

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
        throw new ApiError(404, "No lecture found");
    }

    const lectureDeleted = await Lecture.findByIdAndDelete(lectureId);

    if (!lectureDeleted) {
        throw new ApiError(500, "Failed to delete lecture, please try again");
    }

    try {
        await deleteOnCloudinary(lecture?.videoFile?.public_id, "video")
    } catch (error) {
        throw new ApiError(500, "failed to remove lecture video");
    }

    try {
        await Course.updateOne(
            { lectures_id: lectureId },
            { $pull: { lectures_id: lectureId } }
        );
    } catch (error) {
        throw new ApiError(500, "Failed to update course document");
    }

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Lecture deleted successully"));
})

const getLectureById = asyncHandler(async (req, res) => {
    
    const { lectureId } = req.params;
    if (!isValidObjectId(lectureId)) {
        throw new ApiError(400, "Invalid lecture id");
    }

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
        throw new ApiError(404, "No lecture found");
    }
    
    return res
            .status(200)
            .json(new ApiResponse(200, lecture, "Here is the lecture"));
})

const uplaodVideoFile = asyncHandler(async (req, res) => {
    const { lectureId } = req.params;

    if (!isValidObjectId(lectureId)) {
        throw new ApiError(400, "Provide valid lecture id");
    }

    const videoFileLocalPath = req.file?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is missing");
    }

    const lecture = await Lecture.findById(lectureId);
    
    if(lecture.videoFile?.url) {
            
        try {
            await deleteOnCloudinary(lecture.videoFile?.public_id, "video");
    
        } catch (error) {
            // console.log("ERROR -> updateLecture -> deleting video file: ", error);
            throw new ApiError(500, "Error got while deleting file from cloudinary");
        }
    }

    let video;
    try {
        video = await uploadOnCloudinary(videoFileLocalPath);
    } catch (error) {
        // console.log("Error -> updateLecture -> uploading video file: ",error);
        throw new ApiError(500, "Error got while uploading file on cloudinary");      
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video file uploaded"));
})

export {
    createLecture, 
    getAllLectures, 
    updateLecture, 
    removeLecture,
    getLectureById,
    uplaodVideoFile
}; 