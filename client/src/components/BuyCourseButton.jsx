import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { useCreateCheckoutSessionsMutation } from '@/features/api/purchaseApi.js'
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BuyCourseButton = ({ courseId }) => {    
    const [createCheckoutSessions, { isLoading, isSuccess, isError, data, error }] = useCreateCheckoutSessionsMutation();

    const purchaseCourseHandler = async () => {
        await createCheckoutSessions(courseId)
    }

    console.log("checkout data: ",data);
    
    useEffect(() => {
      if (isSuccess) {
        if (data?.data?.url) {
            window.location.href = data?.data?.url;
        }else {
            toast.error(error?.message || "checkout");
        }
      }

      if (isError) {
        toast.error(error?.data?.message || "Failed to create checkout session");
      }
    
      
    }, [isSuccess, error, data, isError])
    
    return (

        <Button
            disabled={isLoading}
            onClick={purchaseCourseHandler}
            className="w-full"
        >
            {
                isLoading ? (<><Loader2 className='mr-2 w-4 h-4 animate-spin' />Please wait</>) : "Purchase Course"
            }
            
        </Button>
    )
}

export default BuyCourseButton