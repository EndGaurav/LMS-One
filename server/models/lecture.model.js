import  mongoose from "mongoose";
import  mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const lectureSchema = new mongoose.Schema({
    lectureTitle: {
        type: String,
        reuired: [true, "lecture title is required"],
        trim: true
    },
    videoFile: {
        type: {
            url: String,
            public_id: String
        }
    },
    isPreviewFree: {
        type: Boolean
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }
}, {timestamps: true});

lectureSchema.plugin(mongooseAggregatePaginate);

export const Lecture = mongoose.model("Lecture", lectureSchema); 