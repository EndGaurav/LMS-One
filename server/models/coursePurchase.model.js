import mongoose from "mongoose";
import  mongooseAggragtePaginate from "mongoose-aggregate-paginate-v2";

const coursePurchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    paymentId: {
        type: String,
        required: true
    }
}, {timestamps: true});

coursePurchaseSchema.plugin(mongooseAggragtePaginate);

export const CoursePurchase = mongoose.model("CoursePurchase", coursePurchaseSchema);