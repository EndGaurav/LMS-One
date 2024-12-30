import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = asyncHandler(async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);

        if (!course) {
            throw new ApiError(404, "Course not found");
        }

        const newPurchase = new CoursePurchase({
            courseId,
            userId: req.user?._id,
            amount: course.coursePrice,
            status: "pending",
        });

        // create stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: course.courseTitle,
                            images: [course.courseThumbnail.url],
                        },
                        unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination) 1 rupee == 100 paisa
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`, // once payment successful redirect to course progress page
            cancel_url: `${process.env.FRONTEND_URL}/course-details/${courseId}`,
            metadata: {
                courseId: courseId,
                userId: req.user?._id.toString(),
            },
            shipping_address_collection: {
                allowed_countries: ["IN"], // Optionally restrict allowed countries
            },
            // invoice_creation: {
            //     enabled: true
            // }
        });

        if (!session.url) {
            throw new ApiError(400, "Error while creating session");
        }

        // console.log("Session in create checkout session: ", session);

        // create a course's new purchase record
        // const newPurchase = await CoursePurchase.create({
        //     userId: req.user?._id,
        //     courseId,
        //     amount: course.coursePrice,
        //     status: "pending",
        //     paymentId: session.id
        // });
        newPurchase.paymentId = session.id;
        await newPurchase.save();

        if (!newPurchase) {
            throw new ApiError(500, "Failed to crate purchase record");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { url: session.url }, "Checkout session created successfully"));
    } catch (error) {
        console.log("Error from checkout session: ", error);
        throw new ApiError(500, error, "Error from checkout session creation");

    }

});

const stripeWebhook = asyncHandler(async (req, res) => {
    let event;

    try {
        const payloadString = JSON.stringify(req.body, null, 2);
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        });

        event = stripe.webhooks.constructEvent(payloadString, header, secret);
    } catch (error) {
        console.error("Webhook error:", error.message);
        throw new ApiError(400, `Webhook error: ${error.message}`);
    }

    // console.log("Event from webhook after payment: ", event);

    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        // console.log("check session complete is called");

        try {
            const session = event.data.object;

            const purchase = await CoursePurchase.findOne({
                paymentId: session.id,
            }).populate({ path: "courseId" });

            if (!purchase) {
                throw new ApiError(404, "Purchase not found");
            }

            if (session.amount_total) {
                purchase.amount = session.amount_total / 100;
            }
            purchase.status = "completed";

            // Make all lectures visible by setting `isPreviewFree` to true
            if (purchase.courseId && purchase.courseId.lectures_id.length > 0) {
                await Lecture.updateMany(
                    { _id: { $in: purchase.courseId.lectures_id } },
                    { $set: { isPreviewFree: true } }
                );
            }

            await purchase.save();

            // Update user's enrolledCourses
            await User.findByIdAndUpdate(
                purchase.userId,
                { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
                { new: true }
            );

            // Update course to add user ID to enrolledStudents
            await Course.findByIdAndUpdate(
                purchase.courseId._id,
                { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
                { new: true }
            );

            return res
                .status(200)
                .json(new ApiResponse(200, {}, "Purchase successfully processed"));
        } catch (error) {
            console.error("Error handling event:", error);
            throw new ApiError(500, "Internal Server Error");
        }
    }

});

const getCourseDetailsWithPurchaseStatus = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
        throw new ApiError(400, "Invalid course id");
    }


    const course = await Course.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(courseId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "creator",
                foreignField: "_id",
                as: "creator_details"
            },
        },
        {
            $addFields: {
                creator_details: {
                    $first: "$creator_details"
                }
            },
        },
        {
            $lookup: {
                from: "lectures",
                localField: "lectures_id",
                foreignField: "_id",
                as: "lecture_details"
            }
        }
    ])


    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    // console.log("Course details -> coursePurchase controller: ", course[0]);

    const purchase = await CoursePurchase.findOne({ courseId, userId: req.user?._id });

    // console.log("Purchase details: ", purchase);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                course: course[0],
                isPurchasedCourse: !!purchase
            },
            "Course details with purchase status fetched successfully")
        );
})

const getAllPurchasedCourse = asyncHandler(async (req, res) => {
    // const purchased = await CoursePurchase.find({ status: "completed" }).populate({ path: "courseId" });
    const purchased = await CoursePurchase.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(req.user?._id),
                status: "completed"
            }
        },
        {
            $lookup: {
                from: "courses",
                localField: "courseId",
                foreignField: "_id",
                as: "course_details"
            }
        },
        {
            $addFields: {
                course_details: {
                    $first: "$course_details"
                }
            }
        }
    ]);

    if (!purchased) {
        throw new ApiError(404, "No course has been purchased yet");
    }

    // console.log("getAllPurchasedCourse: ", purchased);

    return res
        .status(200)
        .json(new ApiResponse(200, purchased, "All purchased course fetched successfully"));
})

export {
    createCheckoutSession,
    stripeWebhook,
    getCourseDetailsWithPurchaseStatus,
    getAllPurchasedCourse
}