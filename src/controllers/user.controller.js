import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiresponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "ok",
  // });

  const { fullName, email, password, userName } = req.body;

  // if (fullName || email || password || userName === "") {
  //   console.log("must be here ");
  // }
  if (
    [fullName, password, email, userName].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "all field are compulsory");
  }
  const existedUSer = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUSer) {
    throw new apiError(409, "user already exist");
  }

  //the [0] with avatar is must
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "avatar must required");
  }

  const avatarCloudPath = await uploadFileOnCloudinary(avatarLocalPath);
  const coverImageCloudPath = await uploadFileOnCloudinary(coverImageLocalPath);

  if (!avatarCloudPath) {
    throw new apiError(409, "avatar must required");
  }

  const user = await User.create({
    fullName,
    avatar: avatarCloudPath.url,
    coverImage: coverImageCloudPath?.url || "",
    email,
    userName: userName.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong in registration "); //remember this one thing that when ever we make any function using database it must be await otherwise it give wrong response like i make created user first it giver wrong response a circular array but with await it give corrected response
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user register succesfully"));
});

export { registerUser };

//step for user registeration
// 1. get info from front end which is fetch using post or comes in req.body ✅
// 2. validate the data if required field is empty show the error✅
// 3. check user already exist using email , username✅
// 4. check files is comming correct avatar
// 5. upload to cloudinary
// 6. check if response come from cloudinary
// 7. create user object in db
// 8. if create successfully snd response to user
// 9. remove password and refresh token
// 10. return res
