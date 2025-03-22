import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // for searching fields
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
           
        }, 
        fullname:{
            type: String,
            required: true,          
            trim: true,
            index: true           
        },
        avatar:{
            type: String,// cloudinary url
            required: true,
            // default: "https://res.cloudinary.com/dkkgmzpqd/image/upload/v1632465390/avatar/default-avatar.png"
        },
        coverImage:{
            type: String,// cloudinary url
            // required: true,
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken:{
            type: String,
        }
    },{timestamps: true});

// hashing the password before saving 

userSchema.pre("save",async function(next){
    // this check the password field is not modified
    if(!this.isModified("password")) return next();
        // if modified then hash the password
    this.password = await bcrypt.hash(this.password,10)
    next();

});
// check if the password is correct
userSchema.methods.isPasswordCorrect = async function(password){
return   await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })}

userSchema.methods.generateRefreshToken = function(){
    jwt.sign({
        _id:this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}





const User = mongoose.model("User", userSchema);

export { User };