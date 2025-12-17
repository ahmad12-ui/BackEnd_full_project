import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileOnCloudinary = async (localFilePath) => {
  try {
    console.log("file", localFilePath);

    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("file uploaded successfully");
    console.log("cloudinary response :", response);
    console.log("cloudinary response url :", response.url);
    fs.unlink(localFilePath, (err) => {
      console.log(err);
    });
    // fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlink(localFilePath, (err) => {
      console.log(err);
    });
    console.log("error in uploading at cloud ", error);
    return null;
  }
};

export { uploadFileOnCloudinary };
