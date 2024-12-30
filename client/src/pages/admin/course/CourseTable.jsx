import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { useGetCreatorCoursesQuery } from '@/features/api/courseApi';
import {  Edit } from 'lucide-react';
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';



const CourseTable = () => {

  const navigate = useNavigate();
  const {error, isSuccess, isLoading, data} = useGetCreatorCoursesQuery();

  if(isLoading) return <h1>Loading...</h1>
  
  
  return (
    <div>
      <Button onClick={() => navigate("create")}> Create a new course </Button>
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.data.map((course) => (
            <TableRow key={course._id}>
              <TableCell>{course?.coursePrice || "NA"}</TableCell>
              <TableCell className="font-medium">{course.courseTitle}</TableCell>
              <TableCell> <Badge>{course?.isPublished ? "Published" : "Draft"}</Badge> </TableCell>
              <TableCell className="text-right">
                <Button size='sm' variant="ghost" onClick={() => navigate(`${course._id}`)}><Edit /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CourseTable