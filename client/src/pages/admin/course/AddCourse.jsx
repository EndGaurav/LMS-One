import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCourseMutation } from '@/features/api/courseApi'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const AddCourse = () => {

  const [courseTitle, setCourseTitle] = useState("");
  const [category, setCategory] = useState("");

  const [createCourse, {isLoading, error, isSuccess, data}] = useCreateCourseMutation();
  const navigate = useNavigate();
  console.log("create course mutation data: ", data);
  

  const createCourseHandler = async () => {
    console.log("COURSE TITLE",courseTitle);
    console.log("COURSE CATEGORY",category);
    await createCourse({courseTitle, category})
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "course created");
      navigate("/admin/course")
    }
  }, [isSuccess, error])
  
  return (
    <div className='flex-1 mx-10'>
      <div className='mb-4'>
        <h1 className='font-bold text-xl'>Lets add course, add some baisc details about your new course.</h1>
        <p className='text-sm'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos rerum expedita soluta.</p>
      </div>
      <div className='space-y-4'>
        <div className=''>
          <Label>Title</Label>
          <Input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            name="courseTitle"
            placeholder="Your course name"
          />
        </div>
        <div className=''>
          <Label>Category</Label>
          <Select onValueChange={(value) => setCategory(value)} >
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
                <SelectItem value="Docker">Docker</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="HTML">HTML</SelectItem>
                <SelectItem value="SQL">SQL</SelectItem>
                <SelectItem value="NoSQL">NoSQL</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex gap-2 items-center'>
          <Button variant='outline' onClick={() => navigate("/admin/course")}>Cancel</Button>
          <Button disabled={isLoading} onClick={createCourseHandler}>
            {
              isLoading ? (
                <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />Please wait
                </>
              ) : "Create"
            }
          </Button>
        </div>
      </div>
    </div>
  ) 
}

export default AddCourse