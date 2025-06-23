const cloudinary = require("cloudinary").v2;
const fs = require("fs");


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinay = async (localFilePath, folder = "") => {
    try {
        if (!localFilePath) return null;

        // upload the file on the cloudinary
        const response = await cloudinary.uploader.upload(
            localFilePath,
            { resource_type: "auto", folder: folder || undefined }
        )

        //file has been uploaded successfully, then remove file from local 
        console.log("File is uploaded on cloudinary", response.url)
        console.log("✅ File is uploaded on Cloudinary:", response.secure_url);
        fs.unlinkSync(localFilePath)

        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}


const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return;

        // Cloudinary image URLs follow a structure like:
        // https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<folder>/<public_id>.<ext>
        // So we extract the public_id by removing domain, version, and extension

        const parts = imageUrl.split("/");
        const filenameWithExt = parts.pop();
        const publicId = filenameWithExt.split(".")[0];

        const folder = parts.slice(parts.indexOf("upload") + 1).join("/");
        const fullPublicId = folder ? `${folder}/${publicId}` : publicId;

        const result = await cloudinary.uploader.destroy(fullPublicId);
        console.log("✅ Old image deleted:", result);
        return result;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return null;
    }
};


module.exports = { uploadOnCloudinay, deleteFromCloudinary };