import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";

const getCourseProgress = asyncHandler(async(req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }

    const course = await Course.findById(courseId).populate({path: "lectures_id"})

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    let courseProgress = await CourseProgress.findOne({
        courseId,
        userId: req.user?._id
    }).populate({path: "courseId"});

    if (!courseProgress) {
        return res
                .status(200)
                .json(new ApiResponse(
                    200, 
                    {
                    course,
                    progress: [],
                    isCompleted: false   
                    },
                    "Course details with an empty progress"
                ));
    }

    return res
            .status(200)
            .json(new ApiResponse(200, {
                course,
                progress: courseProgress.lectureProgress,
                isCompleted: courseProgress.completed
            }));
})

const updateLectureProgress = asyncHandler(async (req, res) => {
    const {courseId, lectureId} = req.params;
    
    let courseProgress = await CourseProgress.findOne({
        courseId,
        userId: req.user?._id
    });

    if (!courseProgress) {
        courseProgress = new CourseProgress({
            courseId,
            userId: req.user?._id,
            completed: false,
            lectureProgress: []
        });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex((lecture) => lecture.lectureId === lectureId);

    if (lectureIndex !== -1) {
        courseProgress.lectureProgress[lectureIndex].viewed = true;
    }else {
        courseProgress.lectureProgress.push({
            lectureId,
            viewed: true
        });
    }

    // if all lectures are completed.
    const lectureProgressLength = courseProgress.lectureProgress.filter((lecture) => lecture.viewed).length;

    const course = await Course.findById(courseId);

    if (lectureProgressLength === course.lectures_id) {
        courseProgress.completed = true;
    }

    await courseProgress.save({validateBeforeSave: false});

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Lecture progress updated successfully"));
})

const markAsCompleted = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const courseProgress = await CourseProgress.findOne({courseId, userId: req.user?._id});

    if (!courseProgress) {
        throw new ApiError(404, "Course progress not found");
    }
    // console.log("before: ",courseProgress)

    courseProgress.lectureProgress.map((lecture) => lecture.viewed = true);
    courseProgress.completed = true;
    // console.log("After: ",courseProgress)
    await courseProgress.save({validateBeforeSave: false}); 

    return res  
            .status(200)
            .json(new ApiResponse(200, {}, "Course marked as completed successfully"));
})

const markAsInCompleted = asyncHandler(async (req, res) => {
    const {courseId} = req.params;

    const courseProgress = await CourseProgress.findOne({courseId, userId: req.user?._id});

    if (!courseProgress) {
        throw new ApiError(404, "Course progress not found");
    }

    courseProgress.lectureProgress.map((lecture) => lecture.viewed = false);
    courseProgress.completed = false;

    await courseProgress.save({validateBeforeSave: false}); 
    console.log("course progress: ", courseProgress);
    
    return res  
            .status(200)
            .json(new ApiResponse(200, {}, "Course marked as incompleted successfully"));
})

export {
    getCourseProgress,
    updateLectureProgress,
    markAsCompleted,
    markAsInCompleted
}