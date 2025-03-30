import express from 'express';
import {asyncHandler} from "../utils/async_handler.js";
import {ApiError} from "../utils/api_error.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/api_response.js";
import jwt from "jsonwebtoken";


const generateAccessTokenAndRefreshToken  = async (userId)=>{
  try {
    // finding user using userId 
    // generating access token and refresh token {access token for short term && refresh token for long term}
    // saving refresh token in DB
  const user =   await User.findById(userId);
  const accesToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  // console.log(`refresh token ${refreshToken}`);
  // console.log(`access token ${accesToken}`);


  await user.save({validateBeforeSave:false});
  return {accesToken,refreshToken};

  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating access token and refresh token",error);
  }
}

// USER REGISTRATION 
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

const loginUser = asyncHandler(async (req,res)=> {
  
  // req body -> data
  // username || email
  // password check
  // acces tocken refress token
  // send cookie
  // send response
  const {username,email,password} = req.body;
console.log(email,username,password);
  if( !(username || email)  ) {
    throw new ApiError(400,"username or email is required");
  }
  const user = await User.findOne({$or:[{username,},{email}]});
  if(!user){
    throw new ApiError(401,"User not found");
  }
 const isPasswordValid =  await user.isPasswordMatch(password);
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials wrong password");
  }
 const {accesToken, refreshToken} = await  generateAccessTokenAndRefreshToken(user._id);
 const loggedInUser = await  User.findById(user._id).select("-password -refreshToken");
// security steps from server side
// cokkie can;t be modified from client side
// httpOnly:true -> cookie can be accessed from http only
 const options = {
  httpOnly : true,
  secure:true
 }
 return res
            .status(200)
            .cookie("accessToken",accesToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json(new ApiResponse(200,
              {
                // the reason of sending this both tokens is to use them in the front end
                // may be the front end will use it for mobile
                user: loggedInUser,accesToken,refreshToken
              },
              "User logged in successfully"));
  // code here
});
// LOGOUT USER
const logOutUser = asyncHandler(async (req,res)=>{
 await  User.findByIdAndUpdate(req.user._id,
       {$set:{
        refreshToken: undefined
       }},
     {  new :true}
   ) 
   const options = {
    httpOnly:true,
    secure:true
   }
    return res
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .status(200)
            .json(new ApiResponse(200,{},"User logged out successfully"));


})

const refreshAccessToken = asyncHandler(async (req,res)=>{
  const  incomingRefreshToken  =  req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
      throw new ApiError(401,"unauthorized request")
  }
  try {
    const decodedToken  =  jwt.verify(
      incomingRefreshToken,process.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id);
    if(!user){
      throw new ApiError(401,"Invalid refresh token unauthorised request");
    }
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used");
  
    }
    const options = {
      httpOnly:true,
      secure:true
    }

    {newAccessToken,newRefreshToken} await generateAccessTokenAndRefreshToken(user._id)
      return res
              .status(200)
              .cookie("accessToken",newAccessToken , options)
              .cookie("refreshToken",newRefreshToken, options)
              .json(
                new ApiResponse(
                  200,
                 { accesToken, refreshToken:newRefreshToken},
                 "Access token refreshed"
  
                )
              )
  } catch (error) {
    throw new ApiError(401,error?.message || "unAuthorize access"

    )
  }
  })


export {registerUser, loginUser , logOutUser,refreshAccessToken };