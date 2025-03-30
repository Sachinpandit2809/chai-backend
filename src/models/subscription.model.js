import mongoose ,{ Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriber:{
            type:Schema.Types.ObjectId, // one who is subscriobing 
            ref:"User"
        },
        channel:{
            type:Schema.Types.ObjectId, // one to whom 'subscriber is subscriobing 
            ref:"User"
        },

    },
    {
        timestamps:true
    }

);

export const Subscription = mongoose.model("Subscription",subscriptionSchema)
