import express from "express";
import cors from "cors";
import  dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config({
    path: "./.env",
})

const app = express();

const _dirname = path.resolve();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}));



app.use(express.json({limit: "16kb"}));
app.use(cookieParser());

// Router imports 
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import courseRouter from "./routes/course.routes.js";
import lectureRouter from "./routes/lecture.routes.js";
import purchaseRouter from "./routes/coursePurchase.routes.js";
import courseProgressRouter from "./routes/courseProgress.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/lecture", lectureRouter);
app.use("/api/v1/purchase", purchaseRouter);
app.use("/api/v1/progress", courseProgressRouter);
app.use(errorHandler)
app.use(express.static(path.join(_dirname, "./client/dist")));
app.get("*", (req, res) => {
    res.sendFile(path.resolve(_dirname, "client", "dist", "index.html")); 
})

export {app};