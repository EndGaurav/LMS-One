import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: [true, "Course title is required"],
        trim: true
    },
    subTitle: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: [true, "Course category is required"]
    },
    courseLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advance"]
    },
    coursePrice: {
        type: Number
    },
    courseThumbnail: {
        type: {
            url: String,
            public_id: String
        }
    },
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    lectures_id: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture'
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublished: {
        type: Boolean, 
        default: false
    }
}, {timestamps: true});

courseSchema.plugin(mongooseAggregatePaginate);

export const Course = mongoose.model("Course", courseSchema);