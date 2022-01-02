import {app} from "./deviceServer.js";
import {session} from "sessionlib/session.js";
import {uuidV4} from "mongodb/src/utils.js";
import {deviceDeveloper} from "./deviceDeveloper.js";

export function initDeviceDeveloperPath() {

    app.get("/api/v1/device/developer/getDeveloperDevices",(req,res)=>{
        session.transformSecurelySessionToUserUUID(res,req).then(account =>{

            if(account!=null) {


                deviceDeveloper.createDevice(account).then(devices=>{

                    res.json({
                        success:true,
                        devices:devices
                    });

                })

            }

        })


    })




}