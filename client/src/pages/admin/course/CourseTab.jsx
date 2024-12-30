import RichTextEditor from '@/components/RichTextEditor.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCourseByIdQuery, usePublishCourseMutation, useRemoveCourseMutation, useUpdateCourseMutation } from '@/features/api/courseApi';
import { useGetAllLecturesQuery } from '@/features/api/lectureApi';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const CourseTab = () => {
    const isPublished = true;

    const navigate = useNavigate();
    const { courseId } = useParams();

    const [input, setInput] = useState({
        courseTitle: "",
        subTitle: "",
        description: "",
        category: "",
        courseLevel: "",
        coursePrice: "",
        courseThumbnail: ""
    });
    const [thumbnailPreview, setThumbnailPreview] = useState("");


    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        // console.log("event: ", e.target);


        setInput({ ...input, [name]: value })
    }

    const selectCategory = (value) => {
        // console.log("VALUE: ", value);

        setInput({ ...input, category: value });
    }

    const selectThumbnail = (e) => {
        // console.log("File: ", e.target.files);

        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, courseThumbnail: file });

            // for preview please do chatgpt about it.
            const fileReader = new FileReader();
            fileReader.onloadend = () => setThumbnailPreview(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    }


    const [updateCourse, { error, isLoading, isSuccess, data }] = useUpdateCourseMutation();

    const {
        isLoading: getCourseIsLoading,
        data: getCourseData,
        refetch
    } = useGetCourseByIdQuery(courseId, { refetchOnMountOrArgChange: true });

    // console.log("Get course data: ", getCourseData?.data);
   
    
    const course = getCourseData?.data;
    // console.log(course?.courseThumbnail?.url);


    useEffect(() => {
        if (course) {
            setInput({
                courseTitle: course.courseTitle,
                subTitle: course.subTitle,
                description: course.description,
                category: course.category,
                courseLevel: course.courseLevel,
                coursePrice: course.coursePrice,
                courseThumbnail: course.courseThumbnail?.url
            });
        }


    }, [course])

    const [publishCourse, { }] = usePublishCourseMutation();

    const togglePublishHandler = async (action) => {
        try {
            const response = await publishCourse({ courseId, query: action })
            if (response) {
                refetch();
                toast.success(response?.data?.message)
            }
            // console.log("Response from toggle: ", response);
        } catch (error) {
            toast.error(error?.data?.message || "errrrrrrr")
        }

    }

    const [
        removeCourse, 
        {isLoading:removeCourseIsLoading, 
        isSuccess:removeCourseIsSuccess, 
        error:removeCourseError, 
        data:removeCourseData}
    ] = useRemoveCourseMutation();

    const removeCourseHandler = async() => {
        await removeCourse(courseId);
        navigate("/admin/course");
    }
    
    useEffect(() => {
      if (removeCourseIsSuccess) {
        toast.success(removeCourseData?.messsage || "successfully removed bhai");
      }

      if (removeCourseError) {
        toast.error(removeCourse.message || "error bhai");
      }
    }, [removeCourseIsSuccess, removeCourseError])

    const getData = async () => {

        const formData = new FormData();
        formData.append("courseTitle", input.courseTitle);
        formData.append("subTitle", input.subTitle);
        formData.append("description", input.description);
        formData.append("category", input.category);
        formData.append("courseLevel", input.courseLevel);
        formData.append("coursePrice", input.coursePrice);
        formData.append("courseThumbnail", input.courseThumbnail);
        // console.log("Form data -> course tab: ", formData);

        await updateCourse({ formData, courseId });

    }

    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "crouse update");
        }

        if (error) {
            toast.error(error.message || "something went wrong!!");
        }

    }, [isSuccess, error])

    if (getCourseIsLoading) return <Loader2 className='h-4 w-4 animate-spin' />
    
    
    return (

        <Card>
            <CardHeader className="flex flex-row justify-between ">
                <div>
                    <CardTitle>Baic Course Information</CardTitle>
                    <CardDescription>
                        Make changes to your course here. Click save when you are done.
                    </CardDescription>
                </div>
                <div className='flex gap-2 '>
                    <Button variant="outline" disabled={getCourseData?.data.lectures_id.length === 0}  onClick={() => togglePublishHandler(getCourseData?.data.isPublished ? "false" : "true")}>
                        {
                            getCourseData?.data?.isPublished ? "Unpublished" : "Publish"
                        }
                    </Button>
                    <Button disabled={removeCourseIsLoading} onClick={removeCourseHandler}>
                        {
                            removeCourseIsLoading ? <>
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Please wait
                            </> : "Remove Course"
                        }
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-4 mt-5'>
                    <div>
                        <Label htmlFor="courseTitle">Course Title</Label>
                        <Input
                            id="courseTitle"
                            type="text"
                            placeholder="Ex. Full stack developer"
                            name="courseTitle"
                            value={input.courseTitle}
                            onChange={changeEventHandler}
                        />
                    </div>
                    <div>
                        <Label htmlFor="subTitle">Subtitle</Label>
                        <Input
                            id="subTitle"
                            name="subTitle"
                            type="text"
                            placeholder="Ex. Become a Full stack developer."
                            value={input.subTitle}
                            onChange={changeEventHandler}
                        />
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <RichTextEditor input={input} setInput={setInput} />
                    </div>
                    <div className='flex items-center gap-5'>
                        <div>
                            <Label>Category</Label>
                            <Select onValueChange={selectCategory} value={input.category}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="Next JS">Next JS</SelectItem>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                        <SelectItem value="Frontend Development">Frontend Development</SelectItem>
                                        <SelectItem value="Backend Development">Backend Development</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Leadership">Leadership</SelectItem>
                                        <SelectItem value="Fullstack Development">Fullstack Development</SelectItem>
                                        <SelectItem value="MERN Stack Development">MERN Stack Development</SelectItem>
                                        <SelectItem value="Javascript">Javascript</SelectItem>
                                        <SelectItem value="Python">Python</SelectItem>
                                        <SelectItem value="Yoga">Yoga</SelectItem>
                                        <SelectItem value="Docker">Docker</SelectItem>
                                        <SelectItem value="MongoDB">MongoDB</SelectItem>
                                        <SelectItem value="HTML">HTML</SelectItem>
                                        <SelectItem value="SQL">SQL</SelectItem>
                                        <SelectItem value="NoSQL">NoSQL</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Course Level</Label>
                            <Select value={input.courseLevel} onValueChange={(value) => setInput({ ...input, courseLevel: value })} >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a course level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Course Level</SelectLabel>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advance">Advance</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Price in (INR)</Label>
                            <Input
                                type="number"
                                name="coursePrice"
                                value={input.coursePrice}
                                onChange={changeEventHandler}
                                placeholder="100"
                                className="w-fit"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Course thumbnail</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            className="w-fit"
                            onChange={selectThumbnail}
                        />
                        {
                            input.courseThumbnail && !thumbnailPreview && (
                                <img src={input.courseThumbnail} alt="current Thumbnail" className='w-40 my-2 h-auto' />
                            )
                        }
                        {
                            thumbnailPreview && (
                                <img src={thumbnailPreview} alt="course thumbnail" className='w-40 my-2 h-auto' />
                            )
                        }
                    </div>
                    <div>
                        <Button variant="outline" onClick={() => navigate("/admin/course")}>Cancel</Button>
                        <Button disabled={isLoading} onClick={getData}>
                            {
                                isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait
                                    </>
                                ) : "Save"
                            }
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CourseTab