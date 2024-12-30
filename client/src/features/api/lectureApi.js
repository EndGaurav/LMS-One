import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import  conf from "../../conf/conf.js";


const LECTURE_API = conf.lectureAPI;

export const lectureApi = createApi({
    reducerPath: "lectureApi",
    baseQuery: fetchBaseQuery({
        baseUrl: LECTURE_API,
        credentials: "include"
    }),
    tagTypes: ["REFETCH_ALL_LECTURES"],
    endpoints: (builder) => (
        {
            createLecture: builder.mutation({
                query: ({ lectureTitle, courseId }) => (
                    {
                        url: `/${courseId}`,
                        method: 'POST',
                        body: { lectureTitle }
                    }
                ),
                invalidatesTags: ["REFETCH_ALL_LECTURES"]
            }),
            getAllLectures: builder.query({
                query: (courseId) => (
                    {
                        url: `/${courseId}`,
                        method: 'GET'
                    }
                ),
                providesTags: ["REFETCH_ALL_LECTURES"]
            }),
            updateLecture: builder.mutation({
                query: ({ lectureTitle, isPreviewFree, uploadVideoInfo, lectureId }) => (
                    {
                        url: `/update-lecture/${lectureId}`,
                        method: 'POST',
                        body: {lectureTitle, isPreviewFree, uploadVideoInfo},
                    }
                ),
                
            }),
            removeLecture: builder.mutation({
                query: (lectureId) => (
                    {
                        url: `/${lectureId}`,
                        method: 'DELETE'
                    }
                )
            }),
            getLecture: builder.query({
                query: (lectureId) => (
                    {
                        url: `/l/${lectureId}`,
                        method: 'GET'
                    }
                )
            })
            
        }
    )
})


export const { 
    useCreateLectureMutation, 
    useGetAllLecturesQuery, 
    useUpdateLectureMutation,
    useRemoveLectureMutation,
    useGetLectureQuery 
} = lectureApi