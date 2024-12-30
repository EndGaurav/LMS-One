import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { 
  useCompleteCourseMutation, 
  useGetCourseProgressQuery, 
  useIncompleteCourseMutation , 
  useUpdateLectureProgressMutation 
} from '@/features/api/progressApi'
import { CheckCircle, CheckCircle2, CirclePlay } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [currentLecture, setCurrentLecture] = useState(null);
  const { data, isLoading, isSuccess, error, isError, refetch } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress, {data:updateLPData}] = useUpdateLectureProgressMutation();
  const [completeCourse, {data:courseCompleteData, isSuccess:completeIsSuccess}] = useCompleteCourseMutation();
  const [incompleteCourse, {data:courseIncompleteData, isSuccess:incompleteIsSuccess}] = useIncompleteCourseMutation();


  useEffect(() => {
  
    if (completeIsSuccess) {
      refetch();
      toast.success(courseCompleteData?.message || "fallback")
    }

    if (incompleteIsSuccess) {
      refetch();
      toast.success(courseIncompleteData?.message || "fallback")
    }
    
  }, [completeIsSuccess, incompleteIsSuccess])
  
  if (isLoading) return <h1>Loading...</h1>
  if (isError) return <h1>Failed to load details</h1>

  console.log("use get course progress query: ", data?.data);

  const { course, isCompleted, progress } = data?.data;
  console.log("isCompleted: ", isCompleted);
  
  const initialLecture = currentLecture || course?.lectures_id && course?.lectures_id[0];

  const isLectureCompleted = (lectureId) => {
    
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  }
  const lectureProgressHandler = async (lectureId) => {
    await updateLectureProgress({courseId, lectureId})
    refetch();
  }

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    lectureProgressHandler(lecture._id);
  }

  
  const completeCourseHandler = async() => {
      await completeCourse(courseId);
  }

  const incompleteCourseHandler = async() => {
      await incompleteCourse(courseId)
     
  }

  

  return (
    <div className='max-w-7xl mx-auto p-4 mt-20'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold'>{course?.courseTitle || "Course Title"}</h1>
        <Button 
        onClick={isCompleted ? incompleteCourseHandler : completeCourseHandler}
        variant={isCompleted ? "outline" : "default"}
        >
          {
            isCompleted ? <div className='flex items-center'><CheckCircle className='h-4 w-4 mr-2' /><span>Completed</span></div> : "Mark as completed"
          }
        </Button>
      </div>
      <div className='flex flex-col md:flex-row gap-6'>
        {/* video section */}
        <div className='flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4'>
          <div>
            <video
              src={currentLecture?.videoFile?.url || initialLecture?.videoFile?.url}
              controls
              className='w-full h-auto md:rounded-lg'
              onEnded={() => lectureProgressHandler(currentLecture?._id || initialLecture?._id)}
            />
          </div>
          {/* display current watching lecture title */}
          <div className='mt-2'>
            <h3 className='font-medium text-lg'>
              {`Lecture-${course?.lectures_id?.findIndex((lecture) => lecture._id === (currentLecture?._id || initialLecture?._id)) + 1}`}: {currentLecture?.lectureTitle || initialLecture?.lectureTitle}
            </h3>
          </div>
        </div>

        <div className='flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 md:pt-0 '>
          <h2 className='font-semibold text-xl mb-4'>Course Lecture</h2>
          <div className='flex-1 overflow-y-auto'>
            {
              course?.lectures_id.map((lecture) => (
                <Card onClick={() => handleSelectLecture(lecture)} key={lecture?._id} className={`mb-3 hover:cursor-pointer transition transform ${lecture?._id === currentLecture?._id ? "bg-gray-300 dark:bg-gray-800" : ""}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className='flex items-center'>
                      {
                        isLectureCompleted(lecture._id) ? (
                          <CheckCircle2 size={24} className='text-green-500 mr-2' />
                        ) : (
                          <CirclePlay size={24} className='text-gray-500 mr-2' />
                        )
                      }
                      <div>
                        <CardTitle className="text-lg font-medium">{lecture?.lectureTitle || "Introduction"}</CardTitle>
                      </div>
                    </div>
                    {
                      isLectureCompleted(lecture._id) && (
                        <Badge variant={"outline"} className="bg-green-200 text-green-600">Completed</Badge>
                      )
                    }

                  </CardContent>
                </Card>
              ))
            }
          </div>
        </div>
      </div>
      {/* lecture sidebar */}
    </div>
  )
}

export default CourseProgress