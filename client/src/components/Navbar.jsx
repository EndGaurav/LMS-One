import { BookOpen, CreditCard, EditIcon, LogOut, Menu, School, Settings, User } from 'lucide-react';
import React, { useEffect } from 'react'
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import DarkMode from '.././DarkMode.jsx';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './ui/sheet';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Link, useNavigate } from "react-router-dom";
import { useLoadUserQuery, useLogoutUserMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { usePublishCourseMutation } from '@/features/api/courseApi';

function Navbar() {

    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const {data:publishedCourseData, isSuccess:publishedCourseIsSuccess, error} = usePublishCourseMutation();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();


    // console.log("Published course error: ", error);
    // console.log("Published course data: ", publishedCourseData);
    

    const logoutHandler = async () => {
        await logoutUser();
    }

    
    useEffect(() => {

        if (isSuccess) {
            toast.success(data.data.message || "User logout successfully");
            navigate("/login");
        }

    }, [data, isSuccess])

    return (
        <div className='h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-10'>
            {/* For Desktop */}
            <div className='max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full'>
                <div className='flex items-center gap-2'>
                    <School size={"30"} />
                    <h1 className="hidden md:block font-extrabold text-2xl"><Link to="/">E-Learning</Link></h1>
                </div>
                <div className='flex items-center justify-center gap-8'>
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar>
                                    <AvatarImage src={user?.photoUrl?.url || "https://github.com/shadcn.png"} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <BookOpen />
                                        <span> <Link to={"my-learning"}>My learning</Link> </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <EditIcon />
                                        <span><Link to={"profile"}>Edit profile</Link></span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logoutHandler}>
                                        <LogOut />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>

                                {
                                    user?.role === "instructor" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            
                                                <DropdownMenuItem>
                                                    <Link to="/admin/dashboard">
                                                    Dashboard
                                                    </Link>
                                                </DropdownMenuItem>
                                            
                                        </>
                                    )
                                }
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
                            <Button variant="outline" onClick={() => navigate("/login")}>Signup</Button>
                        </div>
                    )
                    }
                    <DarkMode />
                </div>

            </div>

            {/* MobileDevice */}
            <div className='flex md:hidden items-center justify-between px-4 h-full'>
                <h1 className='font-extrabold text-2xl'><Link to="/">E-Learning</Link></h1>
                <MobileDevice logoutHandler={logoutHandler} user={user} />

            </div>
        </div>
    )
}

export default Navbar;

const MobileDevice = ({ logoutHandler, user }) => {
    const navigate = useNavigate();
    const role = "instructor"
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="rounded-full bg-gray-200 hover:bg-gray-200" variant="outline">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent className='flex flex-col'>
                <SheetHeader className="flex flex-row items-center justify-between mt-4">
                    <SheetTitle><Link to="/">E-Learning</Link></SheetTitle>
                    <DarkMode />
                </SheetHeader>
                <Separator className='mr-2' />
                <nav className='flex flex-col space-y-4'>
                    <Link to="/my-learning">My Learning</Link>
                    <Link to="/profile">Edit Profile</Link>
                    <p onClick={logoutHandler} className='cursor-pointer'>Log out</p>
                </nav>
                {
                    role === "instructor" && (
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button 
                                type="submit"
                                onClick={() => navigate("/admin/dashboard")}
                                >
                                Dashboard
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    )
                }
            </SheetContent>
        </Sheet>
    )
}