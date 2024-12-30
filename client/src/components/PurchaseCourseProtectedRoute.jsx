import { useGetCourseDetailsWithPurchaseStatusQuery } from '@/features/api/purchaseApi';
import React from 'react'
import { Navigate, useParams } from 'react-router-dom'

const PurchaseCourseProtectedRoute = ({children}) => {
    const { courseId } = useParams();

    const {isLoading, data} = useGetCourseDetailsWithPurchaseStatusQuery(courseId);
    console.log("purchase protected: ",data);
    console.log("purchase protected: ",data?.data?.isPurchasedCourse);
    
    if(isLoading) return <h1>Loading...</h1>
    return data?.data?.isPurchasedCourse ? children : <Navigate to={`/course-details/${courseId}`} /> 
}

export default PurchaseCourseProtectedRoute