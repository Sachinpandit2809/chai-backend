import express from 'express';
import {asyncHandler} from "../utils/async_handler.js";
import {ApiError} from "../utils/api_error.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/api_response.js";


const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log("ending");

  // get user data from front-end
  // validation - not empty
  // check if user already exists : username ,email
  // check for images check for avatar
  // upload them to cloudinary avatar
  // create user object - create entry in DB
  // remove password and refresh token fields from response
  // check for user creation 
  // return response

  // code here
 const {username,fullname,email,password} = req.body;
  if(
   // fullname === "" || username === "" || email === "" || password === ""
    [fullname,username,email,password].some((field)=>field?.trim()==="")
 // it checks if any of the fields is empty
  ) {
    throw new ApiError(400,"All fields are required");
  }
  // additional line not required
  console.log(req.files);
  const existedUser = await User.findOne({$or:[{ username },{ email }]});

  if(existedUser){
    throw new ApiError(409,"User with email already exists");
  }
  const avatarLocalPath =  req.files?.avatar[0].path;
  // const coverImageLocalPath = req.files?.coverImage[0].path;
  let coverImageLocalPath ;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    coverImageLocalPath = req.files.coverImage[0].path; // proper convient way to write this code
  }
  if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar){
    throw new ApiError(400,"Avatar upload failed , Avatar file is required"); 
  }
 const user = await User.create({
    username:username.toLowerCase(),
    fullname,
    email,
    password,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
  })
  // heres the code to remove password and refresh token from the response 
  // use double comma  amd write "-fieldname space -fieldname" to remove multiple fields
  const createdUser =  await  User.findById(user._id).select(
    "-password -refreshToken"
  );
  if(!createdUser){
    throw new ApiError(500,"somrthing went wrong while creating user ");
  }
  // returning the response

  return  res.status(201).json(new ApiResponse(201,createdUser,"User register succesfully"));

  // write body code here
    //  console.log(req.body);
});
export {registerUser};