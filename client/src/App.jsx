import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import { Button } from './components/ui/button'
import Login from './pages/Login.jsx'
import HeroSection from './pages/student/HeroSection.jsx'
import MainLayout from './Layout/MainLayout.jsx'
import Courses from './pages/student/Courses.jsx'
import MyLearning from './pages/student/MyLearning.jsx'
import Profile from './pages/student/Profile.jsx'
import Sidebar from './pages/admin/Sidebar.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import CourseTable from './pages/admin/course/CourseTable.jsx'
import AddCourse from './pages/admin/course/AddCourse.jsx'
import EditCourse from './pages/admin/course/EditCourse'
import CreateLecture from './pages/admin/lecture/createLecture'
import EditLecture from './pages/admin/lecture/EditLecture'
import CourseDetails from './pages/student/CourseDetails.jsx'
import CourseProgress from './pages/student/CourseProgress.jsx'
import SearchPage from './pages/student/SearchPage'
import { AdminRoute, AuthenticatedUser, ProtectedRoutes } from './components/ProtectedRoutes'
import PurchaseCourseProtectedRoute from './components/PurchaseCourseProtectedRoute'
import { ThemeProvider } from './components/ThemeProvider.jsx'



const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          <>
            <HeroSection />
            <Courses />
          </>
        )
      },
      {
        path: "login",
        element: <AuthenticatedUser>
          <Login />
        </AuthenticatedUser>
      },
      {
        path: "my-learning",
        element: <ProtectedRoutes>
          <MyLearning />
        </ProtectedRoutes>
      },
      {
        path: "profile",
        element: <ProtectedRoutes>
          <Profile />
        </ProtectedRoutes>
      },
      {
        path: "course/search",
        element: <ProtectedRoutes>
          <SearchPage />
        </ProtectedRoutes>
      },
      {
        path: "course-details/:courseId",
        element: <ProtectedRoutes>
          <CourseDetails />
        </ProtectedRoutes>
      },
      {
        path: "course-progress/:courseId",
        element: <ProtectedRoutes>
          <PurchaseCourseProtectedRoute>
            <CourseProgress />
          </PurchaseCourseProtectedRoute>
        </ProtectedRoutes>
      },
      {
        path: "admin",
        element: <AdminRoute>
          <Sidebar />
        </AdminRoute>,
        children: [
          {
            path: "dashboard",
            element: <Dashboard />
          },
          {
            path: "course",
            element: <CourseTable />
          },
          {
            path: "course/create",
            element: <AddCourse />
          },
          {
            path: "course/:courseId",
            element: <EditCourse />
          },
          {
            path: "course/:courseId/lecture",
            element: <CreateLecture />
          },
          {
            path: "course/:courseId/lecture/:lectureId",
            element: <EditLecture />
          }
        ]
      }
    ]
  }
])
function App() {

  return (
    <>
      <main>
        <ThemeProvider>
        <RouterProvider router={appRouter} />
        </ThemeProvider>
      </main>
    </>
  )
}

export default App
