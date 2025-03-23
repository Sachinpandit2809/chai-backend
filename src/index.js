// require("dotenv").config({path: './.env'});
import dotenv from "dotenv";
import express from "express";
import dbConnect from "./db/db_connect.js";
dotenv.config({path: './.env'});
import {app} from "./app.js";


dbConnect().then(()=>{
    app.on("error", (error) => {
        console.error("App not able to connect ",error);
        throw error;
      });
    app.listen(process.env.PORT, () => {
        console.log(`App is running on ${process.env.PORT}`);
      });
}).catch(error=>console.error("MONGO_DB_CONNECTION_FAILED  ",error));














/*
;(async()=>{
    try {
    await    mongoose.connect(`${process.env.MONGODB_REMOTE_URI}/${DB_NAME}`,)
      app.on("error", (error) => {
        console.error("App not able to connect ",error);
        throw error;
      });
        app.listen(process.env.PORT, () => {
            console.log(`App is running on 4{process.env.PORT}`);  });
    } catch (error) {
        console.error("Error connecting to mongodb  ",error);
        throw error;
    }
})

*/