import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateLectureMutation, useGetAllLecturesQuery } from '@/features/api/lectureApi'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Lecture from './Lecture.jsx'

const CreateLecture = () => {
    const { courseId } = useParams();
    const [lectureTitle, setLectureTitle] = useState("");
    const [createLecture, { error, isLoading, isSuccess, data }] = useCreateLectureMutation();
    const { data: getAllLecturesData, isLoading: isLecturesLoading, isError: lectureError, error:getLectureError } = useGetAllLecturesQuery(courseId, { refetchOnMountOrArgChange: true });

    console.log("get all lectures: ", getAllLecturesData?.data);

    const navigate = useNavigate();

    const createLectureHandler = async () => {
        await createLecture({ lectureTitle, courseId });
        setLectureTitle("");
    }

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "course created");
        }

        if (lectureError) {
            
            toast.error(getLectureError?.data?.message || "error occurred");
        }

    }, [isSuccess, lectureError])

    return (
        <div className='flex-1 mx-10'>
            <div className='mb-4'>
                <h1 className='font-bold text-xl'>Lets add lecture, add some baisc details about your new lecture.</h1>
                <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos rerum expedita soluta.</p>
            </div>
            <div className='space-y-4'>
                <div className=''>
                    <Label>Title</Label>
                    <Input
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        name="courseTitle"
                        placeholder="Your course name"
                    />
                </div>

                <div className='flex gap-2 items-center'>
                    <Button variant='outline' onClick={() => navigate(`/admin/course/${courseId}`)}>Back to course</Button>
                    <Button disabled={isLoading} onClick={createLectureHandler} >
                        {
                            isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
                                </>
                            ) : "Create lecture"
                        }
                    </Button>
                </div>
                <div className='mt-10'>
                    {
                        isLecturesLoading ? (<LoadingSpinner />) : lectureError ? (<p>{getLectureError?.data?.message}</p>) : getAllLecturesData?.data?.length === 0 ? (<p>{getAllLecturesData.message}</p>) : (
                            getAllLecturesData?.data?.map((lecture, index) => (
                                <Lecture key={lecture?._id} lecture={lecture} index={index} courseId={courseId}/>
                            ))
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default CreateLecture