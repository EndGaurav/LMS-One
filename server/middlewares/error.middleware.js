import  mongoose from "mongoose";

import { ApiError } from "../utils/ApiError.js";
import { log } from "node:console";

const errorHandler = (err, req, res, next) => {
    let error = err;
    // console.log("Error middleware: ",error);
    // console.log("Error middleware message: ",error.message);
    if(!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500; 
        const message = error.message || "Something went wrong";

        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        ...error, 
        message: error.message,
        ...(process.env.NODE_ENV === "developement" ? {stack: error.stack} : {})
    }

    return res.status(error.statusCode).json(response);
}

export {errorHandler};