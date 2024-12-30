import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import conf from "../../../conf/conf.js";
import { useGetLectureQuery, useRemoveLectureMutation, useUpdateLectureMutation } from '@/features/api/lectureApi.js';
import { Loader2 } from 'lucide-react';
import { usePublishCourseMutation } from '@/features/api/courseApi.js';



const LECTURE_API = conf.lectureAPI;

const LectureTab = () => {
    const { lectureId, courseId } = useParams();
    const navigate = useNavigate();
    const [lectureTitle, setLectureTitle] = useState("");
    const [isPreviewFree, setIsPreviewFree] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [mediaProgress, setMediaProgress] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [btnDisable, setBtnDisable] = useState(true);
    const [uploadVideoInfo, setUploadVideoInfo] = useState(null);

    const {data:lectureData, isError:lectureError, isSuccess:lectureIsSuccess} = useGetLectureQuery(lectureId);

    useEffect(()=>{
        if(lectureData?.data){
          setLectureTitle(lectureData?.data?.lectureTitle);
          setIsPreviewFree(lectureData?.data?.isPreviewFree);
          setUploadVideoInfo(lectureData?.data?.videoFile?.url)
        }
      },[lectureData?.data])
    
    const fileChangeHandler = async (e) => {
        const videoFile = e.target.files[0];
        if (videoFile) {
            const formData = new FormData();
            formData.append("videoFile", videoFile);
            setMediaProgress(true);

            try {
                const res = await axios.post(
                    `${LECTURE_API}/update-video/${lectureId}`,
                    formData,
                    {
                        withCredentials: true,
                        onUploadProgress: ({ loaded, total }) => {
                            setUploadProgress(Math.round((loaded * 100) / total));
                        },
                    });

                if (res.data.success) {
                    console.log("update lecture response: ", res);
                    setUploadVideoInfo({
                        secure_url: res.data.data.secure_url,
                        public_id: res.data.data.public_id,
                    });
                    setBtnDisable(false);
                    toast.success(res.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error("video upload failed");
            } finally {
                setMediaProgress(false);
            }

        }
    }

    const [updateLecture, {isSuccess, isLoading, data, error}] = useUpdateLectureMutation();

    const getData = async () => {
        
        await updateLecture({lectureTitle, isPreviewFree, uploadVideoInfo, lectureId})
        navigate(`/admin/course/${courseId}/lecture`)
    }



    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "removed");
        }

        if (error) {
            toast.error(error?.data?.message || "Error while updating lec..")
        }
    }, [isSuccess, error])

    const [removeLecture, { isSuccess: removeSuccess, isError: removeIsError, error: removeError, isLoading: removeLoading, data: removeData }] = useRemoveLectureMutation();

    const removeLectureHandler = async () => {
        await removeLecture(lectureId);
    }

    useEffect(() => {
        if (removeSuccess) {
            toast.success(removeData.message || "removed");
        }

        if (removeIsError) {
            toast.error(removeError?.data?.message || "Error while removing")
        }
    }, [removeSuccess, removeError])

    
    return (
        <Card>
            <CardHeader className="flex justify-center">
                <div>
                    <CardTitle>Edit Lecture</CardTitle>
                    <CardDescription>Make changes and click save when  you done.</CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                    <Button disabled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
                        {
                            removeLoading ? <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
                            </> : "Remove Lecture"

                        }
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        placeholder="Ex. Introduction to javascript"
                    />
                </div>
                <div className='my-5'>
                    <Label htmlFor="title">Video <span className='text-red-600'>*</span></Label>
                    <Input
                        type="file"
                        accept="video/*"
                        className="w-fit"
                        onChange={fileChangeHandler}
                    />
                </div>
                {mediaProgress && (
                    <div className="my-4">
                        <Progress value={uploadProgress} />
                        <p>{uploadProgress}% uploaded</p>
                    </div>
                )}
                <div className='flex items-center space-x-2 my-5'>
                    <Switch
                        id="free"
                        checked={isPreviewFree}
                        onCheckedChange={setIsPreviewFree}
                    />
                    <Label htmlFor="free">Is this video <strong>FREE</strong></Label>
                </div>
                <div className='mt-5'>
                    <Button disabled={isLoading} onClick={getData}>
                       {
                        isLoading ? <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                        </> : "UpdateLecture"
                       }
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}

export default LectureTab;