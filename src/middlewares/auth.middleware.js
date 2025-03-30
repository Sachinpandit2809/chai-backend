import { asyncHandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
 const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
/* 
     //for mobile application and postman 
      // for sending the header Authorization  use following 
      // header:{
      // Authorization: Bearer token
      // } this is generally used in postman and mobile app development
    //authorization : Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2U2NjM1OTEzZGQyZTJhYTRhYzc3NmEiLCJ1c2VybmFtZSI6InQiLCJlbWFpbCI6InRAZ21haWwuY29tIiwiZnVsbG5hbWUiOiJ0IiwiaWF0IjoxNzQzMTU1MTEyLCJleHAiOjE3NDMyNDE1MTJ9.r1EgPQaGWd2nHXF3sH_nA0V36ACKUBT9Skg4zxpRRpw
const token  = req.headers["authorization"]?.replace("Bearer ","");
console.log(`print header token => --- ${token}`);
console.log(`print cookies token => --- ${req.cookies.accessToken }`);
*/

     const token = req.cookies.accessToken || req.headers["authorization"]?.replace("Bearer ","");
      
     if (!token) {
     //   return res.status(401).json({ message: "Unauthorized" });
       throw new ApiError(401,"Unauthorized request")
     }
     const decodeToken  = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )
     const user =     await User.findById(decodeToken?._id).select("-password -refreshToken")
     if(!user){
         // TODO discuss about frontend
         throw new ApiError(401,"Invalid Access token")
     }
     req.user = user;
     next();
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access token")
   }
});

export { verifyJWT };
