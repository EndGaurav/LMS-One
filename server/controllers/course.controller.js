import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { deleteOnCloudinary, optimizedUrl, uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import { Lecture } from "../models/lecture.model.js";
import { skip } from "node:test";
const createCourse = asyncHandler(async (req, res) => {
    const { courseTitle, category } = req.body;

    if (!(courseTitle || category)) {
        throw new ApiError(400, "Course title and category are required");
    }


    const course = await Course.create({
        courseTitle,
        category,
        creator: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, course, "Course created successfully"))
})

const getCreatorCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find({ creator: req.user?._id });

    if (!courses) {
        throw new ApiError(404, "No course found of current creator");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, courses, "All courses fetched successfully"));
})

const editCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { courseTitle,
        subTitle,
        description,
        category,
        courseLevel,
        coursePrice,
    } = req.body;

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course.courseThumbnail?.url) {
        try {
            await deleteOnCloudinary(course.courseThumbnail.public_id);
        } catch (error) {
            // console.log("Failed to delete the current thumbnail from Cloudinary");
            throw new ApiError(500, "Failed to delete the current thumbnail from Cloudinary");
        }
    }

    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    } catch (error) {
        // console.log("Error while uploading thumbnail on cloudinary: ", error);
        throw new ApiError(500, error, "Error while uploading thumbnail on cloudinary");
    }

    const optimizedUri = await optimizedUrl(thumbnail?.public_id);

    const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
            $set: {
                courseTitle,
                subTitle,
                description,
                category,
                courseLevel,
                coursePrice,
                courseThumbnail: {
                    url: optimizedUri,
                    public_id: thumbnail.public_id
                }
            }
        },
        { new: true }
    );

    // console.log("Updated course: ", updatedCourse);

    if (!updatedCourse) {
        throw new ApiError(500, "Failed in updating the course.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedCourse, "Course updated successfully."));
})

const getCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, course, "Course fetched successfully"));
})

const togglePublishCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { publish } = req.query;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "course not found");
    }

    course.isPublished = publish === "true";

    await course.save({ validateBeforeSave: false });

    const statusMessage = course.isPublished ? "Published" : "Unpublished";

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                isPublished: course?.isPublished
            },
            `Course is ${statusMessage} successfully.`
        )
        );
})

const removeCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }

    const course = await Course.findById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    if (course?.courseThumbnail?.url) {
        try {
            await deleteOnCloudinary(course?.courseThumbnail?.public_id);
        } catch (error) {
            throw new ApiError(500, "Failed to delete thumbnail on cloudinary");
        }
    }

    try {
        const lectures = await Lecture.find({ course_id: courseId });

        // console.log("Removing course controller: ", lectures);
        for (const lecture of lectures) {
            if (lecture?.videoFile?.url) {
                try {
                    await deleteOnCloudinary(lecture?.videoFile?.public_id, "video")
                } catch (error) {
                    throw new ApiError(500, "failed to delete video from cloudinary");
                }
            }
        }

        await Lecture.deleteMany({ course_id: courseId });
    } catch (error) {
        throw new ApiError(500, "Failed to delete lectures of the course");
    }

    try {
        await Course.findByIdAndDelete(courseId)
    } catch (error) {
        throw new ApiError(500, "Failed to delete course, please try again");
    };

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Course deleted successfully"));


})

const getPublishedCourse = asyncHandler(async (req, res) => {

    const course = await Course.aggregate([
        {
            $match: {
                isPublished: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator_details"
            }
            
        },
        {
            $addFields: {
                creator_details: {
                    $first: "$creator_details"
                }
            }
        },
        {
            $project: {
                _id: 1,
                courseTitle: 1,
                courseLevel: 1,
                coursePrice: 1,
                "courseThumbnail.url": 1,
                "creator_details.name": 1,
                "creator_details.photoUrl.url": 1   
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, course, "Published courses fetched successfully"));
    
})

const searchCourse = asyncHandler(async (req, res) => {
    const {query = "", categories = "", sortByPrice = "", page = 1, limit = 10} = req.query;

 // Build the aggregation pipeline
    const pipeline = [];
  
    // Search stage using $search for index-based searching
   if (query) {
        pipeline.push({
            $search: {
                index: "search-course",
                text: {
                    query: query,
                    path: ["courseTitle", "subTitle", "category"]
                }
            }
        })
   }

   const categoryArray = categories ? categories.split(',') : [];
   

    // Match for isPublished
   pipeline.push({
        $match: {
            isPublished: true
        }
   })

    // Match categories if provided

   if(categoryArray.length > 0) {
    pipeline.push({
        $match: {
            category: {
                $in: categoryArray.map(category => new RegExp(`^${category}$`, 'i'))
            }
        }
    })
   }

   // Sort stage for price
   if (sortByPrice) {
        const sortOrder = sortByPrice === "low" ? 1 : -1;
        pipeline.push({
            $sort: {
                coursePrice: sortOrder
            }
        })
   }

   // Lookup stage to populate creator details
   pipeline.push({
    $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator_details"
    }
   });

    // Unwind the creator details array
    pipeline.push({
        $unwind: {
            path: "$creator_details",
            preserveNullAndEmptyArrays: true
        }
    })

    pipeline.push({
        $project: {
            courseTitle: 1,
            subTitle: 1,
            category: 1,
            "courseThumbnail.url": 1,
            courseLevel: 1,
            coursePrice: 1,
            creator: {
                name: "$creator_details.name",
                photoUrl: "$creator_details.photoUrl.url"
            }
        }
    })

    pipeline.push(
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: Number(limit)
        }
    )

    const courses = await Course.aggregate(pipeline);

    return res
            .status(200)
            .json(new ApiResponse(200, {courses: courses || []}, "Courses fetched successfully"));
})
export {
    createCourse,
    getCreatorCourses,
    editCourse,
    getCourseById,
    togglePublishCourse,
    removeCourse,
    getPublishedCourse,
    searchCourse
}