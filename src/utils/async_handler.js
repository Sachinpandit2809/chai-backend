//  const asyncHandler = (fn) =>async(err,req,res,next)=> {
//     try {
//         await fn(err,req,res,next);
        
//     } catch (error) {
//         res.status(err.code||500).json({
//             success:false,
//             message:err.message||"Internal Server Error"});
//     }
//  };


const asyncHandler = (requestHandler)=>{
    (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((error)=> next(error));
    }
}
export {asyncHandler};