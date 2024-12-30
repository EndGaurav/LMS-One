import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useLoginUserMutation, useRegisterUserMutation } from "@/features/api/authApi.js"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { toast } from "sonner"

const Login = () => {
  // 8Z30gtQ03LMh6x10

  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "", role: "" });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const [
    registerUser,
    { data: registerData, isLoading: registerIsLoading, error: registerError, isSuccess: registerIsSuccess }
  ] = useRegisterUserMutation();
  const [
    loginUser,
    { data: loginData, isLoading: loginIsLoading, error: loginError, isSuccess: loginIsSuccess }
  ] = useLoginUserMutation();

  // console.log("Login error: ", loginError);
  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;

    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  }
  // console.log("Register User: ", registerUser);
  // console.log("Login User: ", loginUser);

  // console.log("Register data: ", registerData);
  // console.log("Login data: ", loginData);

  useEffect(() => {
    if (registerIsSuccess && registerData) {
      toast.success(registerData.message || "User signup successfully");
    }

    if (registerError) {
      toast.error(registerError?.data?.message || "User signup failed");
    }

    if (loginIsSuccess && loginData) {
      toast.success(loginData.message || "User login successfully");
      navigate("/");

    }

    if (loginError) {
      toast.error(loginError?.data?.message || "User login failed");
    }
  }, [registerIsSuccess, registerData, registerError, loginIsSuccess, loginData, loginError]);

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData);

  }

  const handleRoleChange = (value) => {
    console.log("Radio: ", value);
    setSignupInput({ ...signupInput, role: value })
  }

  return (
    <div className="flex items-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Make changes to your account here. Click save when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeInputHandler(e, "signup")}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div><h1>Please must choose one of the following option <span className="text-red-600">*</span></h1></div>
              <RadioGroup value={signupInput.role} onValueChange={handleRoleChange} className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instructor" id="instructor" />
                  <Label htmlFor="instructor">Instructor</Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleRegistration("signup")}
                disabled={registerIsLoading}>
                {
                  registerIsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : "Signup"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeInputHandler(e, "login")}
                  placeholder="Enter your password"
                  required
                />
              </div>

            </CardContent>
            <CardFooter>
              <Button onClick={() => handleRegistration("login")} disabled={loginIsLoading} className="dark:bg-[#141414] dark:text-white">
                {loginIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                  </>
                ) : "Login"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}


export default Login;