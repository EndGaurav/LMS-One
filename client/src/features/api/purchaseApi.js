import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import conf from "../../conf/conf.js";

const PURCHASE_API = conf.purchaseAPI;
export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: PURCHASE_API,
        credentials: "include"
    }),
    endpoints: (builder) => (
        {
            // provide Api ONE BY ONE
            createCheckoutSessions: builder.mutation({
                query: (courseId) => (
                    {
                        url: `/checkout/create-checkout-session`,
                        method: 'POST',
                        body: {courseId}
                    }
                )
            }),
            getCourseDetailsWithPurchaseStatus: builder.query({
                query: (courseId) => (
                    // /course/:courseId/details-with-status
                    {
                        url: `/course/${courseId}/details-with-status`,
                        method: 'GET'
                    }
                )
            }),
            getAllPurchasedCourse: builder.query({
                query: () => (
                    {
                        url: `/`,
                        method: 'GET'
                    }
                )
            })
        }
    )
})

export const {
    useCreateCheckoutSessionsMutation, 
    useGetCourseDetailsWithPurchaseStatusQuery,
    useGetAllPurchasedCourseQuery
} = purchaseApi;