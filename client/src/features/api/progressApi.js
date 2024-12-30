import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import conf from "../../conf/conf.js"

const COURSE_PROGRESS_API = conf.progressAPI;

export const courseProgressApi = createApi({
    reducerPath: "courseProgressApi",
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_PROGRESS_API,
        credentials: "include"
    }),
    endpoints: (builder) => (
        {
            getCourseProgress: builder.query({
                query: (courseId) => (
                    {
                        url: `/${courseId}`,
                        method: "GET"
                    }
                )
            }),
            updateLectureProgress: builder.mutation({
                query: ({courseId, lectureId}) => (
                    {
                        url: `/${courseId}/lecture/${lectureId}/view`,
                        method: 'PATCH'
                    }
                )
            }),
            completeCourse: builder.mutation({
                query: (courseId) => (
                    {
                        url: `/${courseId}/complete`,
                        method: 'PATCH'
                    }
                )
            }),
            incompleteCourse: builder.mutation({
                query: (courseId) => (
                    {
                        url: `/${courseId}/incomplete`,
                        method: 'PATCH'
                    }
                )
            })
        }
    )
})

export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useCompleteCourseMutation,
    useIncompleteCourseMutation
} = courseProgressApi;
