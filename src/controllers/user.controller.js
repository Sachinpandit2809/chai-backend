import express from 'express';
import {asyncHandler} from "../utils/async_handler.js";

const registerUser = asyncHandler(async (req, res) => {
  // code here
  res.status(200).json({ message: 'User registered successfully' });
});
export {registerUser};