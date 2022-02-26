import {app} from "./deviceServer.js";
import {session} from "sessionlib/session.js";
import {deviceDeveloper} from "./deviceDeveloper.js";

export function initDeviceDeveloperPath() {


    app.get("/api/v1/device/developer/getDeveloperDevices",(req,res)=>{
        session.transformSecurelySessionToUserUUID(res,req).then(account =>{

            if(account!=null) {


                deviceDeveloper.getDevices(account).then(devices=>{

                    res.json({
                        success:true,
                        devices:devices
                    });

                })

            }

        })


    })

    app.post("/api/v1/device/developer/createDevice",(req,res)=>{
        session.transformSecurelySessionToUserUUID(res,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=>{

                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }

                    if(req.body.deviceName!=null&&(req.body.deviceName.toString().length)>3&&req.body.deviceName.toString().length<23) {
                        deviceDeveloper.createDevice(accountUUID,req.body.deviceName.toString()).then(uuid=>{
                            res.json({success: true,deviceUUID: uuid});
                        })
                    }else{
                        res.status(400).json({error: "No valid inputs!", errorcode: "002"});
                    }
                })





            }


        })


    })

    app.post("/api/v1/device/developer/registerStatusModule",(req,res)=>{
        session.transformSecurelySessionToUserUUID(req,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=> {

                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }
                    if(req.body.moduleName!=null&&23<(req.body.moduleName.toString().length)>3&&req.body.deviceUUID) {

                        deviceDeveloper.addModule(req.body.moduleName.toString(),req.body.deviceUUID.toString(),false).then(moduleUUID=>{
                            res.json({success: true,moduleUUID: moduleUUID});
                        })

                    }else{
                        res.status(400).json({error: "No valid inputs!", errorcode: "002"});

                    }


                });


            }


        })
    })


    app.post("/api/v1/device/developer/registerSettingModule",(req,res)=>{
        session.transformSecurelySessionToUserUUID(req,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=> {

                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }
                    if(req.body.moduleName!=null&&23<(req.body.moduleName.toString().length)>3&&req.body.deviceUUID) {

                        deviceDeveloper.addModule(req.body.moduleName.toString(),req.body.deviceUUID.toString(),true).then(moduleUUID=>{
                            res.json({success: true,moduleUUID: moduleUUID});
                        })

                    }else{
                        res.status(400).json({error: "No valid inputs!", errorcode: "002"});

                    }


                });


            }


        })
    })



}