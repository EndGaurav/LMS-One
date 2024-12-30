import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Course from './Course'
import { useLoadUserQuery, useUpdateUserMutation } from '@/features/api/authApi.js'
import { toast } from 'sonner'

const Profile = () => {

    // state variable.
    const [name, setName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");


    // getting current user profile.
    const {data, isLoading, refetch} = useLoadUserQuery();
    

    useEffect(() => {
      refetch();
    
    }, [])
    
    // console.log("GET CURRENT USER DATA: ", data?.data);
   
    
    // updating current user account and getting that data also. 
    const [updateUser, 
        {data: updateUserData, 
        isLoading: updateUserIsLoading, 
        error: updateUserError,
        isSuccess,
        isError
    }] = useUpdateUserMutation();

    const onChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if(file) setProfilePhoto(file);
    }

    const updateUserHandler = async() => {
        // whenever we sent file from client we send that in FormData();
        // keep it in mind
        const formData = new FormData();
        formData.append("name", name);
        formData.append("profilePhoto", profilePhoto);
       
        await updateUser(formData);
    }

    useEffect(() => {
      if (isSuccess) {
        refetch();
        toast.success(updateUserData.message || "Profile updated successfully");
      }

      if (isError) {
        toast.error(updateUserError.message || "Profile updation failed");
      }
    
    }, [updateUserData, updateUserError, isSuccess, isError])
    
    return (
        <div className='max-w-4xl mx-auto px-4 my-8'>
            <h1 className='font-bold text-2xl text-center md:text-left'>Profile</h1>
            <div className='flex flex-col md:flex-row items-center md:items-start gap-8 my-5'>
                <div className='flex flex-col items-center'>
                    <Avatar className='h-24 w-24 md:h-32 md:w-32 mb-4 '>
                        <AvatarImage src={data?.data?.photoUrl?.url || "https://github.com/shadcn.png"} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <div className='mb-2'>
                        <h1 className='font-semibold text-gray-900 dark:text-gray-100 ml-2 '>
                            Username:
                            <span className='font-normal text-gray-700 dark:text-gray-300 ml-2'>{data?.data?.name}</span>
                        </h1>
                    </div>
                    <div className='mb-2'>
                        <h1 className='font-semibold text-gray-900 dark:text-gray-100 ml-2 '>
                            Email:
                            <span className='font-normal text-gray-700 dark:text-gray-300 ml-2'>{data?.data?.email}</span>
                        </h1>
                    </div>
                    <div className='mb-2'>
                        <h1 className='font-semibold text-gray-900 dark:text-gray-100 ml-2 '>
                            Role:
                            <span className='font-normal text-gray-700 dark:text-gray-300 ml-2'>{data?.data?.role.toUpperCase()}</span>
                        </h1>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size='sm' className='mt-2'>Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you are done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='grid gap-4 py-4'>
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label>Name</Label>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className='grid grid-cols-4 items-center gap-4'>
                                    <Label>Profile photo</Label>
                                    <Input
                                        type="file"
                                        placeholder="Enter your name"
                                        className="col-span-3"
                                        name="profilePhoto"
                                        onChange={onChangeHandler}
                                        accept="image/*"
                                    /> 
                                </div>
                            </div>
                            <DialogFooter>
                                <Button disabled={updateUserIsLoading} onClick={updateUserHandler}>
                                    {
                                        updateUserIsLoading ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                                            </>
                                        ) : 
                                            "Save changes"
                                        
                                    }
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div>
                <h1 className='font-medium text-lg'>Courses you are enrolled in.</h1>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5'>
                        {
                            data?.data?.enrolledCourses.length === 0 ? "You have not enrolled yet in any course." : (
                                data?.data?.enrolledCourses.map((course) => <Course key={course?._id} course={course} creatorDetails={data?.data} />)
                            )
                        }
                </div>
            </div>
        </div>
    )
}

export default Profile