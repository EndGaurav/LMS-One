import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import { authApi } from "../features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { lectureApi } from "@/features/api/lectureApi.js";
import { purchaseApi } from "@/features/api/purchaseApi.js";
import { courseProgressApi } from "@/features/api/progressApi.js";


const store = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer, // Adding the RTK Query reducer
        [courseApi.reducerPath]: courseApi.reducer,
        [lectureApi.reducerPath]: lectureApi.reducer,
        [purchaseApi.reducerPath]: purchaseApi.reducer,
        [courseProgressApi.reducerPath]: courseProgressApi.reducer

    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(
            authApi.middleware, 
            courseApi.middleware, 
            lectureApi.middleware, 
            purchaseApi.middleware,
            courseProgressApi.middleware
        ) // Adding the RTK Query middleware
});


const initializeApp = async() => {
    try {
        await store.dispatch(authApi.endpoints.loadUser.initiate({}, {forceRefetch: true}));
    } catch (error) {
        console.log("INITIALIZE APP: ", error);
    }
} 

initializeApp();
 
export default store;   