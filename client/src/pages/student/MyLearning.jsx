import React from 'react'
import { CourseSkeleton } from './Courses.jsx'
import Course from './Course.jsx';
import { useLoadUserQuery } from '@/features/api/authApi.js';

const MyLearning = () => {
  // const isLoading = false;
  const {data, isLoading, isSuccess} = useLoadUserQuery();
  
  console.log("GET CURRENT USER DATA IN MYLEARNING: ", data?.data);
  return (
    <div className='max-w-4xl mx-auto my-10 px-4 md:px-0'>
      <h1 className='font-bold text-2xl'>My Learning</h1>
      <div className='my-5'>
        {
          isLoading ? (<CourseSkeleton />) : (data?.data?.enrolledCourses?.length === 0 ? (<p>You have not yet enrolled in any course.</p>) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {
              data?.data?.enrolledCourses?.map((course, index) => (<Course key={index} course={course} creatorDetails={data?.data} />))
            }
            </div>
          )) 
        }
      </div>
    </div>
  )
}

export default MyLearning