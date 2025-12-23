import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async ({ user_id }) => {
  const user = await User.findById(user_id);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken,
    refreshToken,
  };
};

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
  console.log("files path ", req.files);

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

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;

  if ([userName, email, password].some((field) => field.trim() === "")) {
    throw new apiError(400, "all field must require");
  }
  const user = await User.findOne({ $or: [{ email }, { password }] });
  // console.log("userExist", user);

  if (!user) {
    throw new apiError(404, "incorrect userName or email");
  }

  const dbResponse = await user.ispassword(password);
  if (!dbResponse) {
    throw new apiError(404, "incorrect password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken({
      user_id: user._id,
    });
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("logged in user ", loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in success fully "
      )
    );
});

const logOut = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new apiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new apiError(401, "invalid refresh token");
  }

  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw apiError(401, "invalid refresh token ");
    }

    const user = await User.findById(decodedToken._id).select("-password ");

    if (!user) {
      throw new apiError(401, "invalid refresh token");
    }

    if (incomingToken !== user?.refreshToken) {
      throw new apiError(401, "refresh token is expired or used");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken({
        user_id: user._id,
      });

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken },
          "access token refresh successfully"
        )
      );
  } catch (error) {
    throw new apiError(401, error.message || "invalid refresh token");
  }
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
  console.log("req body", req.body);
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const validateOldPassword = await user.ispassword(oldPassword);

  if (!validateOldPassword) {
    throw new apiError(401, "wrong old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new apiResponse(200, user, "current user fetched successfully"));
});

const updateDetails = asyncHandler(async (req, res) => {
  const { newFullName, newEmail } = req.body;

  if (!newFullName && !newEmail) {
    throw new apiError(400, "At least one field is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email: newEmail,
        fullName: newFullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Details updated successfully"));
});

const updateFiles = asyncHandler(async (req, res) => {
  const { avatar, coverImage } = req.files;

  if (!avatar && !coverImage) {
    throw new apiError(400, "atleat one field must required");
  }
  let avatarLocalPath;
  if (avatar) {
    avatarLocalPath = avatar[0].path;
  }
  let coverImageLocalPath;
  if (coverImage) {
    coverImageLocalPath = coverImage[0].path;
  }
  let avatarCloudPath;
  if (avatarLocalPath !== undefined && avatarLocalPath !== null) {
    avatarCloudPath = await uploadFileOnCloudinary(avatarLocalPath);
  }
  let coverImageCloudPath;
  if (coverImageLocalPath !== undefined && coverImageLocalPath !== null) {
    coverImageCloudPath = await uploadFileOnCloudinary(coverImageLocalPath);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatarCloudPath?.url,
        coverImage: coverImageCloudPath?.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new apiResponse(200, user, "Files updated successfully"));
});

export {
  registerUser,
  loginUser,
  logOut,
  refreshAccessToken,
  changeCurrentUserPassword,
  getCurrentUser,
  updateDetails,
  updateFiles,
};

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
