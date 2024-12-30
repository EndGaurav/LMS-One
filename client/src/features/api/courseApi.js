import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import  conf from "../../conf/conf.js";

const COURSE_API = conf.courseAPI;


export const courseApi = createApi({
    reducerPath: "courseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: COURSE_API,
        credentials: "include"
    }),
    tagTypes: ["Refetch_Creator_Course"],
    endpoints: (builder) => (
        {
            createCourse: builder.mutation({
                query: ({courseTitle, category}) => (
                    {
                        url: "",
                        method: 'POST',
                        body: {courseTitle, category}
                    }
                ),
                invalidatesTags: ["Refetch_Creator_Course"]
            }),
            // When a mutation happens (like creating, updating, or deleting data), you can use invalidatesTags to mark certain data as "stale." This forces the query to re-fetch fresh data from the server.


            getCreatorCourses: builder.query({
                query: () => (
                    {
                        url: "",
                        method: 'GET'
                    }
                ),
                providesTags: ["Refetch_Creator_Course"]
            }),
            updateCourse: builder.mutation({
                query: ({formData, courseId}) => (
                    {
                        url: `/${courseId}`,
                        method: 'POST',
                        body: formData
                    } 
                ),
                invalidatesTags: ["Refetch_Creator_Course"]
            }),
            getCourseById: builder.query({
                query: (courseId) => (
                    {
                        url: `${courseId}`,
                        method: 'GET'
                    }
                )
            }),
            publishCourse: builder.mutation({
                query: ({courseId, query}) => (
                    {
                        url: `/t/${courseId}?publish=${query}`,
                        method: 'PATCH'
                    }
                    
                ),
                invalidatesTags: ["Refetch_Creator_Course"]
            }),
            removeCourse: builder.mutation({
                query: (courseId) => (
                    {
                        url: `/${courseId}`,
                        method: 'DELETE'
                    }
                )
            }),
            publishedCourse: builder.query({
                query: () => (
                    {
                        url: "/published-courses",
                        method: 'GET'
                    }
                )
            }),
            getSearchCourse: builder.query({
                query: ({searchQuery, categories, sortByPrice, page, limit}) => {
                    let queryString = `/search?query=${encodeURIComponent(searchQuery)}`;
                    
                    if (categories && categories.length > 0) {
                        const categoriesString = categories.map(encodeURIComponent).join(",");
                        queryString += `&categories=${categoriesString}`
                    }

                    if (sortByPrice) {
                        queryString +=`&sortByPrice=${encodeURIComponent(sortByPrice)}`
                    }

                    if (page) {
                        queryString += `&page=${encodeURIComponent(page)}`
                    }

                    if (limit) {
                        queryString += `&limit=${encodeURIComponent(limit)}`
                    }

                    return {
                        url: queryString,
                        method: 'GET'
                    }
                }
            }) 
        }   
    )
})

export const {
    useCreateCourseMutation, 
    useGetCreatorCoursesQuery, 
    useUpdateCourseMutation,
    useGetCourseByIdQuery,
    usePublishCourseMutation,
    useRemoveCourseMutation,
    usePublishedCourseQuery,
    useGetSearchCourseQuery

} = courseApi; 