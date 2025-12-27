import { v2 as cloudinary } from "cloudinary";
import { apiError } from "./apiError.js";

export const removeFileFromCloudinary = async (prevPath) => {
  const url = prevPath;
  console.log(url);
  const parts = url.split("/"); // this will return an array

  const fileName = parts.pop().split(".")[0]; // this will also return array but [0] is used to that's why it return first element
  const public_id = `${fileName}`;

  const response = await cloudinary.uploader.destroy(public_id);
  console.log(response);

  if (!response) {
    throw new apiError(500, "public Id is missing for pervious path ");
  }
};
// avatar public id 'qohqnaaduuegbbh0ipra'
// cover Image public id b288dcb835489af7bbaae8e440b78403
