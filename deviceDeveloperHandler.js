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


    //TODO check if user has developer permission for this device
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
                    if(req.body.moduleName!=null&&23>(req.body.moduleName.toString().length)&&3<(req.body.moduleName.toString().length)&&req.body.deviceUUID) {

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

    app.post("/api/v1/device/developer/registerSettingsModuleVariable",(req,res)=>{

        session.transformSecurelySessionToUserUUID(req,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=>{
                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }
                    //todo check type
                    if(req.body.variableName!=null&&23>(req.body.variableName.toString().length)&&3<(req.body.variableName.toString().length)&&req.body.deviceUUID&&req.body.type&&req.body.moduleUUID) {
                        deviceDeveloper.addVariable(req.body.variableName.toString(),req.body.type.toString(),req.body.deviceUUID.toString(),req.body.moduleUUID.toString(),true,req.body.defaultValue!=null?req.body.defaultValue:0).then(varUUID=>{
                            res.json({success: true,variableUUID: varUUID});
                        });
                    }else{
                        res.status(400).json({error: "No valid inputs!", errorcode: "002"});

                    }

                });

            }

        });

        })

    app.post("/api/v1/device/developer/registerStatusModuleVariable",(req,res)=>{

        session.transformSecurelySessionToUserUUID(req,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=>{
                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }
                    //todo check type
                    if(req.body.variableName!=null&&23>(req.body.variableName.toString().length)&&3<(req.body.variableName.toString().length)&&req.body.deviceUUID&&req.body.type&&req.body.moduleUUID) {
                        deviceDeveloper.addVariable(req.body.variableName.toString(),req.body.type.toString(),req.body.deviceUUID.toString(),req.body.moduleUUID.toString(),false,req.body.defaultValue!=null?req.body.defaultValue:0).then(varUUID=>{
                            res.json({success: true,variableUUID: varUUID});
                        });
                    }else{
                        res.status(400).json({error: "No valid inputs!", errorcode: "002"});

                    }

                });

            }

        });

    })


    app.post("/api/v1/device/developer/registerSettingModule",(req,res)=>{
        session.transformSecurelySessionToUserUUID(req,req).then(accountUUID=>{

            if(accountUUID!=null) {

                session.isUserDeveloper(accountUUID).then(isDev=> {

                    if(!isDev) {
                        res.json({error: "Your account is not a developer account", errorcode: "021"});
                        return;
                    }
                    if(req.body.moduleName!=null&&23>(req.body.moduleName.toString().length)&&3<(req.body.moduleName.toString().length)&&req.body.deviceUUID) {

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