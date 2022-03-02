import express from "express";

import https from "https";

import fs from "fs";

import express_ws from "express-ws";

import cookieParser from "cookie-parser";

import {MongoClient} from "mongodb";

import cors from "cors";

import {initDevicePaths} from "./deviceHandler.js";
import {initDeviceDeveloperPath} from "./deviceDeveloperHandler.js";
import {initDeviceLiveConnection} from "./LiveConnection/DeviceLiveConnection.js";

export const app = express();


const uri = `mongodb://root:${process.env.MYSQL_ROOT_PASSWORD}@mongo:27017/?authSource=admin&readPreference=primary&directConnection=true&ssl=false`
const client = new MongoClient(uri);

client.connect().then(()=> {
    global.database = client.db("cloud");

})
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.disable('x-powered-by');

express_ws(app);


app.use(cors());
app.get("/api/v1/device",(req, res) => {
    res.send(JSON.stringify({microService:"Device"}))
})


app.listen(3000, () => {
    console.log(`Device app listening at http://localhost:3000`);
});

initDevicePaths();

initDeviceDeveloperPath();

initDeviceLiveConnection();

app.use(function (err,req,res,next){
    if (res.headersSent) {
        return next(err);
    }
    res.status(500);
    res.send('Something went wrong')
})

app.use(function (req, res) {
    res.status(404).send('Something went wrong! Microservice: Device');
});
