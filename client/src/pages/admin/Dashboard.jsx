import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetAllPurchasedCourseQuery } from '@/features/api/purchaseApi'
import React from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const Dashboard = () => {

  const { data, isSuccess, isLoading, isError } = useGetAllPurchasedCourseQuery();

  if (isLoading) return <h1>loading....</h1>
  if (isError) return <h1 className='text-red-600'>Failed to get purchased course....</h1>

  const { data: purchased } = data || [];
  console.log("dashboard data: ", data?.data);

  const courseData = purchased.map((course) => ({
    name: course?.course_details.courseTitle,
    price: course?.course_details?.coursePrice
  }))

  console.log("courseData: ", courseData);

  const totalRevenue = purchased.reduce((acc, data) => acc + (Number(data.amount) || 0), 0)
  const totalSales = purchased?.length || 0;

  return (
    <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-3xl font-bold text-blue-600'>{totalSales || "N/A"}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-3xl font-bold text-blue-600'>{totalRevenue || "N/A"}</p>
        </CardContent>
      </Card>

      {/* Course Prices Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          {courseData.length > 0 ? (
            <CardTitle className="text-xl font-semibold text-gray-700">
            Course prices
          </CardTitle>
          ) : (<CardTitle className="text-xl font-semibold text-gray-700">
            Course Status
          </CardTitle>)
          }
        </CardHeader>
        <CardContent>
          {/* charts */}
          {
            courseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    angle={-20} // Rotated labels for better visibility
                    textAnchor="end"
                    interval={0} // Display all labels
                  />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value, name) => [`₹${value}`, name]} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#4a90e2" // Changed color to a different shade of blue
                    strokeWidth={3}
                    dot={{ stroke: "#4a90e2", strokeWidth: 2 }} // Same color for the dot
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (

              <h1>No course has been purchased yet!</h1>

            )
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard