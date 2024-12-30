import BuyCourseButton from '@/components/BuyCourseButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetAllPurchasedCourseQuery, useGetCourseDetailsWithPurchaseStatusQuery } from '@/features/api/purchaseApi'
import { BadgeInfo, Lock, PlayCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import parse from "html-react-parser";
import ReactPlayer from 'react-player'

const CourseDetails = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);
    const { data } = useGetAllPurchasedCourseQuery();
    const {
        data: specificCourseDataWithPuchasedStatus,
        isLoading,
        isError,
        isSuccess,
        error
    } = useGetCourseDetailsWithPurchaseStatusQuery(courseId);

    console.log("courseDetails about get all purchased course: ", data);
    console.log("single course: ", specificCourseDataWithPuchasedStatus);

    if (isLoading) return <h1>Loading...</h1>

    if (isError) return <h1>Failed to load</h1>

    const { course, isPurchasedCourse } = specificCourseDataWithPuchasedStatus?.data;
    const formattedDate = new Date(course?.updatedAt).toLocaleString();

    const continueCourseHandler = () => {
        if (isPurchasedCourse) {
            navigate(`/course-progress/${courseId}`);
        }
    }

    return (
        <div className=' space-y-5'>
            <div className='bg-[#2D2F31] text-white'>
                <div className='max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2'>
                    <h1 className='font-bold text-2xl md:text-3xl'>{course?.courseTitle || "Course Title"}</h1>
                    <p className='text-base md:text-lg'>{course?.subTitle || "Course Sub-title"}</p>
                    <p>Created By{" "} <span className='text-[#C0C4FC] underline italic'>{course?.creator_details?.name || "username"}</span></p>
                    <div className='flex items-center gap-2 text-sm'>
                        <BadgeInfo size={16} />
                        <p>Last updated {formattedDate || "N/A"}</p>
                    </div>
                    <p>Student enrolled: {course?.enrolledStudents?.length || "10"}</p>
                </div>
            </div>
            <div className='max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10'>
                <div className='w-full lg:w-1/2 space-y-5'>
                    <h1 className='font-bold text-xl md:text-2xl'>Description</h1>
                    <div className='text-sm'>{parse(course?.description) || "description of course will be lie here."}</div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>{course?.lecture_details.length} Lectures</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {course?.lecture_details.map((lecture, index) => (
                                <div key={lecture?._id} className='flex items-center gap-3 text-sm'>
                                    <span>
                                        {
                                            isPurchasedCourse ? (<PlayCircle size={14} />) : (<Lock size={14} />)
                                        }
                                    </span>
                                    <p>{lecture?.lectureTitle || "Lecture title"}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className='w-full lg:w-1/3'>
                    <Card>
                        <CardContent className="p-4 flex flex-col">
                            <div className='w-full aspect-video mb-4'>
                                <ReactPlayer
                                    height='100%'
                                    width="100%"
                                    controls={isReady}
                                    url={course?.lecture_details[0]?.videoFile?.url}
                                    light={<img src={course?.courseThumbnail?.url} width={"100%"} height={"100%"} />}
                                    onReady={() => setIsReady(true)}
                                    play={isReady}
                                />
                            </div>
                            <h1>{course?.lecture_details[0]?.lectureTitle||"Lecture title"}</h1>
                            <Separator className="my-2" />
                            <h1 className='text-lg md:text-xl font-semibold'>₹{course?.coursePrice||"Course Price"}</h1>
                        </CardContent>
                        <CardFooter className="flex justify-center p-4">
                            {
                                isPurchasedCourse ? (<Button className="w-full" onClick={continueCourseHandler}>Continue Course</Button>) : (<BuyCourseButton courseId={courseId} />)
                            }

                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default CourseDetails