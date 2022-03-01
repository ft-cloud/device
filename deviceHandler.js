import {app} from "./deviceServer.js";

import {session} from "sessionlib/session.js";

import {device} from "./device.js";

export function initDevicePaths() {


    app.get('/api/v1/device/listAvailable', (req, res) => {

        if (req.query.session!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);

                    device.listAll((devices) => {
                        if (devices) {
                            res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                        } else {
                            res.send(`{"success":false}`);
                        }
                    });


                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });


    app.get('/api/v1/device/listSpecificUserDevice', (req, res) => {

        if (req.query.session!=null && req.query.device!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.listSpecificDevice(uuid, req.query.device.toString(), (devices) => {
                                if (devices) {
                                    res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                                } else {
                                    res.send(`{"success":false}`);
                                }
                            });

                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });


    app.get('/api/v1/device/getUserSpecificDeviceInfo', (req, res) => {

        if (req.query.session!=null && req.query.device!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.getUserSpecificDeviceInfo(uuid, req.query.device.toString(), (devices) => {

                                if(devices.error) {
                                    res.send(JSON.stringify(devices));
                                }else{
                                    res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                                }

                            });

                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });


    app.post('/api/v1/device/changeDeviceName', (req, res) => {

        if (req.body.session!=null && req.body.device!=null && req.body.newName!=null) {
            if(req.body.newName.toString().length<4&&req.body.newName.toString().length>49) {
                res.send(`{"success":false,"error":"String too long"}`);
                return;
            }
            session.validateSession(req.body.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.body.session);
                    session.getUserUUID(req.body.session.toString(), (uuid) => {
                        if (uuid) {

                            device.getUserSpecificDeviceInfo(uuid, req.body.device.toString(), (devices) => {

                                if(devices.error) {
                                    res.send(JSON.stringify(devices));
                                }else{
                                    device.changeDeviceName(req.body.device,req.body.newName,(result) => {
                                        if(result) {
                                            res.send(`{"success":true}`)
                                        }else{
                                            res.send(`{"success":false}`)

                                        }
                                    });


                                }

                            });

                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });




    app.get('/api/v1/device/getDeviceConfig', (req, res) => {

        if (req.query.session!=null && req.query.device!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.device).then((result) => {

                                if (result) {

                                    device.getDeviceConfig(uuid, req.query.device.toString(), (devices) => {
                                        if (devices) {
                                            res.send(`{"success":true,"data":${JSON.stringify(devices)}}`);
                                        } else {
                                            res.send(`{"success":false}`);
                                        }
                                    });
                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');
                                }

                            });


                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });


    app.get('/api/v1/device/changeStatusInfo', (req, res) => {

        if (req.query.session!=null && req.query.device!=null && req.query.infokey!=null && req.query.value!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.geliveDeviceConnectiontUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.device).then((result) => {

                                if (result) {
                                    device.updateStatusInfo(req.query.device, req.query.infokey, req.query.value, () => {
                                        res.send(`{"success":true}`);

                                    });

                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

                                }

                            });


                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });

    app.get('/api/v1/device/getStatusInfo', (req, res) => {

        if (req.query.session!=null && req.query.deviceuuid!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid, req.query.deviceuuid).then((result) => {

                                if (result) {
                                    device.getStatusInfo(req.query.deviceuuid).then(r => {
                                        res.send(`{"success":true,"data":${JSON.stringify(r)}}`);

                                    })



                                } else {
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

                                }

                            });


                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');

                        }

                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
        }

    });




    //TODO FIX MICROSERVICE LIVE TCP CONNECTION DEVICE DELETE BUG
    app.get('/api/v1/device/deleteDevice', (req, res) => {

        if (req.query.session!=null && req.query.deviceuuid!=null) {
            session.validateSession(req.query.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.query.session);
                    session.getUserUUID(req.query.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid,req.query.deviceuuid).then((result)=> {
                                if(result) {

                                    device.deleteDeviceConnection(uuid,req.query.deviceuuid, (result) => {
                                        if (result) {
                                            device.deleteAPIKey(req.query.deviceuuid, () => {

                                             //   console.log("hätte klappen müssen")
                                               // if(TCPLiveConnection.liveDevices[req.query.deviceuuid]!==undefined) {
                                               //     TCPLiveConnection.deleteDevice(TCPLiveConnection.liveDevices[req.query.deviceuuid]);
                                              //  }

                                                try {
                                                   // if (liveDeviceConnection.get(req.query.deviceuuid)) { //<- Deprecated
                                                    //    liveDeviceConnection.get(req.query.deviceuuid).close();
                                                     //   liveDeviceConnection.delete(req.query.deviceuuid);
                                                   // }


                                                } catch (e) {
                                                }

                                                res.send('{\"success\":\"true\"}');
                                            });
                                        } else {
                                            res.send('{\"error\":\"No write Permission\",\"errorcode\":\"009\"}');
                                        }
                                    });


                                }else{
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');
                                }
                            })



                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');
                        }
                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');

        }
    });


    app.post('/api/v1/device/saveConfig', (req, res) => {

        if (req.body.session!=null && req.body.deviceuuid!=null && req.body.param!=null && req.body.value!=null) {
            session.validateSession(req.body.session.toString(), (isValid) => {
                if (isValid) {
                    session.reactivateSession(req.body.session);
                    session.getUserUUID(req.body.session.toString(), (uuid) => {
                        if (uuid) {

                            device.checkUserDeviceAccessPermission(uuid,req.body.deviceuuid).then((result) => {

                                if(result) {
                                    console.log(req.body.param)
                                    console.log(req.body.value)
                                    device.updateDeviceConfig(req.body.deviceuuid, req.body.param,req.body.value).then(value => {
                                       // if (liveDeviceConnection.has(req.body.deviceuuid)) {
                                        //    liveDeviceConnection.get(req.body.deviceuuid).send(packWSContent("configChange", `${req.body.params}`));
                                       // }
                                        res.send('{\"success\":\"Updated Settings\"}');

                                    });
                                }else{
                                    res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');

                                }


                            });





                        } else {
                            res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');
                        }
                    });

                } else {
                    res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                }
            });
        } else {
            res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');

        }
    });


    //get status
    //get status of device if set in module
    //if not set in module, get default value from device
    app.get('/api/v1/device/getStatus', (req, res) => {
            
            if (req.query.session!=null && req.query.deviceuuid!=null) {
                session.validateSession(req.query.session.toString(), (isValid) => {
                    if (isValid) {
                        session.reactivateSession(req.query.session);
                        session.getUserUUID(req.query.session.toString(), (uuid) => {
                            if (uuid) {
    
                                device.checkUserDeviceAccessPermission(uuid,req.query.deviceuuid).then((result) => {
    
                                    if(result) {
                                        device.getStatus(req.query.deviceuuid).then(r => {
                                            res.send(`{"success":true,"data":${JSON.stringify(r)}}`);
    
                                        })
    
                                    }else{
                                        res.send('{\"error\":\"No device permission!\",\"errorcode\":\"011\"}');
    
                                    }

                                
                                });

                            } else {
                                res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');
                            }
                        });

                    } else {
                        res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');

                    }
                });
            } else {
                res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');

            }
        });

        //get status module for device from device type
        app.get('/api/v1/device/getStatusModules', (req, res) => {
                
                if (req.query.session!=null && req.query.deviceTypeUUID!=null) {
                    session.validateSession(req.query.session.toString(), (isValid) => {
                        if (isValid) {
                            session.reactivateSession(req.query.session);
                            session.getUserUUID(req.query.session.toString(), (uuid) => {
                                if (uuid) {
        
        
                                            device.getDeviceStatusModules(req.query.deviceTypeUUID).then(r => {
                                                res.send(`{"success":true,"data":${JSON.stringify(r)}}`);
        
                                            })
        
                                      
                                    
    
                                } else {
                                    res.send('{\"error\":\"No valid account!\",\"errorcode\":\"006\"}');
                                }
                            });
    
                        } else {
                            res.send('{\"error\":\"No valid session!\",\"errorcode\":\"006\"}');
    
                        }
                    });
                } else {
                    res.send('{\"error\":\"No valid inputs!\",\"errorcode\":\"002\"}');
    
                }
            });








}
