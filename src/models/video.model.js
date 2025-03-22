import mongoose  from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema  = new mongoose.Schema(
    {
        videoFile:{
            type: String,//cloidinary url
            required: [true, "Video file is required"],
        },
        thumbnail:{
            type: String,
            required: [true, "Thumbnail is required"],
        },
        title:{
            type: String,
            required: [true, "Title is required"],
            // trim: true,
            index: true
        },
        description:{
            type: String,
            required: [true, "Description is required"],
            // trim: true,
        },
        duration:{
            type: Number,
            required: [true, "Duration is required"],
        },
        views:{
            type: Number,
            default: 0,
        },
        isPublished:{
            type: Boolean,
            default: true,
        },
        owner:{
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"],
        }

    },
    {timestamps: true});
    videoSchema.plugin(mongooseAggregatePaginate);
     
export const Video = mongoose.model("Video", videoSchema);