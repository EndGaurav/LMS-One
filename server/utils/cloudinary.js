import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import fs from "fs";


dotenv.config({
    path: "./.env"
})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        // console.log("Cloudinary upload response: ",response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // console.log("Could not upload on cloudinary: ",error);
        
        fs.unlinkSync(localFilePath);
        return null;
    }
}


const optimizedUrl = async(public_id) => {
    try {
        const optimizedResponse = await cloudinary.url(public_id, {
            fetch_format: 'auto',
            quality: 'auto'
        });

        return optimizedResponse;

    } catch (error) {
        // console.log("Optimized url error: ", error);
    }
}

const autoCropUrl = async(public_id) => {
    const response = cloudinary.url(public_id, {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });

    return response;
}

const deleteOnCloudinary = async(publicId, resource_type="image") => {
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: `${resource_type}`
        });

        // console.log("deleted on cloudinary: ", response);
    } catch (error) {
        // console.log("delete error: ",error);
        return null;
    }
}


export {uploadOnCloudinary, optimizedUrl, deleteOnCloudinary, autoCropUrl};