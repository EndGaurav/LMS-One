import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice.js";
import  conf from "../../conf/conf.js";


const USER_API = conf.userAPI;

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: USER_API,
        credentials: "include"
    }),
    endpoints: (builder) => (
        {
            registerUser: builder.mutation({
                query: (inputData) => (
                    {
                        url: '/register',
                        method: 'POST',
                        body: inputData
                    }
                )
            }),
            loginUser: builder.mutation({
                query: (inputData) => (
                    {
                        url: '/login',
                        method: 'POST',
                        body: inputData
                    }
                ),
                async onQueryStarted(args, {queryFulfilled, dispatch}) {
                    try {
                        const response = await queryFulfilled;
                        
                        // console.log("Response: ",response);
                        // console.log("Response.data 2: ",response.data);
                        // console.log("Response.data 3: ",response.data.data);
                     
                        dispatch(userLoggedIn({user: response.data.data.user}))
                    } catch (error) {
                        console.log("Error -> createApi -> endpoint:loginUser: ", error);
                    }
                }
            }),
            loadUser: builder.query({
                query: () => (
                    {
                        url: '/currentUser',
                        method: 'GET'
                    }
                ),
                async onQueryStarted(args, {queryFulfilled, dispatch}) {
                    try {
                        const response = await queryFulfilled;
                        // console.log("Response.data: ",response.data);
                        // console.log("Response.data 1: ",response.data.data);
                        dispatch(userLoggedIn({user: response.data.data}));
                    } catch (error) {
                        console.log("Error -> createApi -> endpoint:loginUser: ", error);
                    }
                }
            }),
            updateUser: builder.mutation({
                query: (formData) => ({
                    url: '/update-account',
                    method: 'PATCH',
                    body: formData
                })
            }),
            logoutUser: builder.mutation({
                query: () => ({
                    url: '/logout',
                    method: 'GET'
                }),
                async onQueryStarted(args, {queryFulfilled, dispatch}) {
                    try {
                        // const response = await queryFulfilled;
                        // console.log("Logout dispatch response: ", response);
                        dispatch(userLoggedOut());
                    } catch (error) {
                        console.log("User logout -> authapi -> ERROR: ",error);  
                    }
                }
            })
        }
        
    )
});

export const {
    useLoginUserMutation, 
    useRegisterUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useLogoutUserMutation
} = authApi;