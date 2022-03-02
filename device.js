import axios from "axios";

export const device = {


    getDeviceConfig: function (uuid, deviceUUID, callback) {
        if (!uuid) callback(undefined); //TODO why?
        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({ uuid: deviceUUID }).then(res => {
            if (res.config != null) {
                callback(res.config)
            } else {
                callback(undefined);

            }
        })
    },

    checkUserDeviceAccessPermission: function (useruuid, deviceuuid) {
        return new Promise(function (resolve, reject) {
            const account = global.database.collection("account");
            account.findOne({ uuid: useruuid }).then(res => {

                if (res != null && res.devices != null && res.devices.indexOf(deviceuuid) !== -1) {
                    resolve(true);
                } else {
                    axios("http://account:3000/api/v1/account/isUserAdmin?uuid=" + useruuid).then(parsed => {
                        resolve(parsed.data.isAdmin);
                    });
                }

            })
        });

    },



    updateDeviceConfig: function (deviceuuid, key, value) {
        return new Promise(function (resolve, reject) {
            const deviceData = global.database.collection("deviceData");
            deviceData.update({ uuid: deviceuuid }, { $push: { config: { key: value } } }).then(() => { resolve(); })
        })

    },

    deleteDeviceConnection: function (useruuid, deviceuuid, callback) {

        const account = global.database.collection("account");
        const deviceData = global.database.collection("deviceData");
        const promiseAccount = account.update({ uuid: useruuid }, { $pull: { devices: deviceuuid } });
        const promiseDeviceDelete = deviceData.deleteOne({ uuid: deviceuuid });
        const promises = [promiseAccount, promiseDeviceDelete];
        Promise.all(promises).then(() => {

            callback(true);
        })

    },


    listAll: function (callback) {

        const device = global.database.collection("device");
        const cursor = device.find();
        cursor.toArray().then(array => {
            console.log(array);
            callback(array);
        })


    },


    deleteAPIKey: function (deviceuuid, callback) {


        const session = global.database.collection("session");
        session.deleteOne({ usedBy: deviceuuid }).then(() => {
            callback();
        })


    },

    getDeviceUUID: function (apiKey, callback) {

        const session = global.database.collection("session");
        session.findOne({ uuid: apiKey }).then(result => {
            if (result !== null && result.usedBy != null) {
                callback(result.usedBy);
            } else {
                callback(undefined);

            }
        })

    },

    getOnlineState: function (deviceuuid, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({ uuid: deviceuuid }).then(result => {
            if (result != null && result.online != null) {
                callback(result.online);
            }
        })

    },
    //TODO untested
    setOnlineState: function (state, deviceuuid, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.updateOne({ uuid: deviceuuid }, { $set: { online: state } }).then(() => {
            callback();
        })

    },

    getDeviceTypFromDevice: function (deviceuuid, callback) {
        const deviceData = global.database.collection("deviceData");
        const device = global.database.collection("device");
        deviceData.findOne({ uuid: deviceuuid }).then(deviceResult => {
            if (deviceResult != null && deviceResult.deviceUUID != null) {
                device.findOne({ UUID: deviceResult.deviceUUID }).then(deviceType => {
                    callback(deviceType);
                })
            }
        })

    },


    getUserSpecificDeviceInfo: function (useruuid, device, callback) {

        this.checkUserDeviceAccessPermission(useruuid, device).then((access) => {
            if (access) {
                const deviceData = global.database.collection("deviceData");
                deviceData.findOne({ uuid: device }).then(deviceResult => {
                    if (deviceResult != null) {
                        callback({
                            content: deviceResult,

                        });
                    } else {
                        callback({
                            error: true,
                            errorMessage: "Device does not exist!"
                        });
                    }
                })
            } else {
                callback({
                    error: true,
                    errorMessage: "No Access!"
                });
            }
        })


    },

    changeDeviceName: function (deviceUUID, newName, callback) {
        const deviceData = global.database.collection("deviceData");
        deviceData.updateOne({ uuid: deviceUUID }, { $set: { name: newName } }).then(() => { callback(true) })
    },


    listSpecificDevice: function (useruuid, device, callback) {

        const deviceData = global.database.collection("deviceData");
        const account = global.database.collection("account");
        account.findOne({ uuid: useruuid }).then(account => {
            if (account != null) {
                const ownedDevices = account.devices;
                if (ownedDevices != null) {
                    const cursor = deviceData.find({ uuid: { $in: ownedDevices }, deviceUUID: device });
                    cursor.toArray().then(deviceArray => {
                        callback(deviceArray)
                    })
                } else {
                    callback([])
                }


            }
        })

    },
    //@deprecated
    updateStatusInfo: function (device, key, value, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({ uuid: device }).then(deviceResult => {
            if (deviceResult != null && deviceResult.statusInfo != null) {
                const deviceStatusInfo = deviceResult.statusInfo;
                deviceStatusInfo[key] = value;
                deviceData.updateOne({ uuid: device }, { $set: { statusInfo: deviceStatusInfo } }).then(() => {
                    callback();
                })
            }
        })
    },

    //@deprecated
    getStatusInfo: function (device) {
        return new Promise((resolve, reject) => {
            const deviceData = global.database.collection("deviceData");
            deviceData.findOne({ uuid: device }).then((deviceResult) => {
                if (deviceResult != null && deviceResult.statusInfo != null) {
                    resolve(deviceResult.statusInfo);
                } else {
                    resolve("");
                }
            })

        });
    },

    /****
     * 
     * 
     * status: [
     * 
     * {
     *      UUID: "",
     *      variables: [
     *          {
     *            UUID: "",
     *           value: ""
     * 
     * 
     *            }
     * 
     *          ]
     * 
     * 
     * 
     * }
     * 
     * 
     * ]
     * 
     *      create module or variables if not exist
     * 
     * 
     * 
     */

    updateStatus: function (device, module, variable, value) {
        return new Promise(resolve => {
            const deviceData = global.database.collection("deviceData");


            deviceData.findOne({ uuid: device }).then(deviceResult => {


                if (deviceResult != null && deviceResult.status != null) {
                    const deviceStatus = deviceResult.status;
                    let foundModule = false;
                    let foundVariable = false;
                    for (let i = 0; i < deviceStatus.length; i++) {
                        if (deviceStatus[i].UUID === module) {
                            foundModule = true;
                            for (let j = 0; j < deviceStatus[i].variables.length; j++) {
                                if (deviceStatus[i].variables[j].UUID === variable) {
                                    foundVariable = true;
                                    deviceStatus[i].variables[j].value = value;
                                    break;
                                }
                            }
                            if (!foundVariable) {
                                deviceStatus[i].variables.push({
                                    UUID: variable,
                                    value: value
                                })
                            }
                            break;
                        }
                    }
                    if (!foundModule) {
                        deviceStatus.push({
                            UUID: module,
                            variables: [
                                {
                                    UUID: variable,
                                    value: value
                                }
                            ]
                        })
                    }
                    deviceData.updateOne({ uuid: device }, { $set: { status: deviceStatus } }).then(() => {
                        resolve();
                    })
                }

            });

        })
    },


    //get complete status of device
    //if a value is not set, get default value from device type
    //simply add missing values to status
    //device type is needed to get default values
    //device type comes from the database and its uuid is stored in deviceUUID
    //merge them together
    /*

        example device type from device type (device uuid stored in deviceData`s deviceUUID): "statusModules":[{"UUID":"e7665479-b649-4730-a4d4-8e0fa21272df","name":"Akku","variables":[{"UUID":"9fa79bf9-15f3-4055-b494-b391e3cb4502","name":"Spannung","type":"string","defaultValue":0},{"UUID":"a1bff9b9-c658-4779-a912-563f1a6431d6","name":"Zellspannung","type":"string","defaultValue":0},{"UUID":"2d4bad0a-6583-40e8-ba22-2a70c934a130","name":"Zellspannung2","type":"string","defaultValue":0},{"UUID":"e9105abd-921f-4ae6-a0bd-858155bdecab","name":"Zellspannung3","type":"string","defaultValue":0}]}]
        example device:    "status": [{
        "UUID": "fd847120-e3f8-4896-84e8-c93fa49517b7",
        "variables": [{
            "UUID": "6e35c494-b7d0-4eb3-9c22-69a7d5313bf4",
            "value": "1234"
        }]
    }]  
    */

    getStatus: function (device) {
        return new Promise(resolve => {

            const deviceData = global.database.collection("deviceData");
            const deviceType = global.database.collection("device");

            deviceData.findOne({ uuid: device }).then(deviceResult => {
                deviceType.findOne({ UUID: deviceResult.deviceUUID }).then(deviceTypeResult => {
                    if (deviceTypeResult != null && deviceTypeResult.statusModules != null&& deviceResult.status != null) {
                        const deviceStatus = deviceResult.status;
                        const deviceTypeStatus = deviceTypeResult.statusModules;
                        let status = [];
                        for (let i = 0; i < deviceTypeStatus.length; i++) {
                            let found = false;
                            for (let j = 0; j < deviceStatus.length; j++) {
                                if (deviceTypeStatus[i].UUID === deviceStatus[j].UUID) {
                                    found = true;
                                    status.push(deviceStatus[j]);
                                    break;
                                }
                            }
                            if (!found) {
                                status.push({
                                    UUID: deviceTypeStatus[i].UUID,
                                    variables: []
                                })
                            }
                        }


                        console.log(status);

                        //add missing variables to status
                        for (let i = 0; i < status.length; i++) {
                            for (let j = 0; j < deviceTypeStatus[i].variables.length; j++) {
                                let found = false;
                                for (let k = 0; k < status[i].variables.length; k++) {
                                    if (deviceTypeStatus[i].variables[j].UUID === status[i].variables[k].UUID) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    status[i].variables.push({
                                        UUID: deviceTypeStatus[i].variables[j].UUID,
                                        value: deviceTypeStatus[i].variables[j].defaultValue
                                    })
                                }
                            }
                        }


                        resolve(status);
                    } else {
                        console.log(deviceResult);

                        resolve([]);
                    }
                }
                )



            })
        });

    },


    getSettings: function (device) {
        return new Promise(resolve => {

            const deviceData = global.database.collection("deviceData");
            const deviceType = global.database.collection("device");

            deviceData.findOne({ uuid: device }).then(deviceResult => {
                deviceType.findOne({ UUID: deviceResult.deviceUUID }).then(deviceTypeResult => {
                    if (deviceTypeResult != null && deviceTypeResult.settingsModules != null && deviceResult.settings != null) {
                        const deviceSettings = deviceResult.settings;
                        const deviceTypeSettings = deviceTypeResult.settingsModules;
                        let settings = [];
                        for (let i = 0; i < deviceTypeSettings.length; i++) {
                            let found = false;
                            for (let j = 0; j < deviceSettings.length; j++) {
                                if (deviceTypeSettings[i].UUID === deviceSettings[j].UUID) {
                                    found = true;
                                    settings.push(deviceSettings[j]);
                                    break;
                                }
                            }
                            if (!found) {
                                settings.push({
                                    UUID: deviceTypeSettings[i].UUID,
                                    variables: []
                                })
                            }
                        }


                        console.log(settings);

                        //add missing variables to status
                        for (let i = 0; i < settings.length; i++) {
                            for (let j = 0; j < deviceTypeSettings[i].variables.length; j++) {
                                let found = false;
                                for (let k = 0; k < settings[i].variables.length; k++) {
                                    if (deviceTypeSettings[i].variables[j].UUID === settings[i].variables[k].UUID) {
                                        found = true;
                                        break;
                                    }
                                }

                                if (!found) {
                                    settings[i].variables.push({
                                        UUID: deviceTypeSettings[i].variables[j].UUID,
                                        value: deviceTypeSettings[i].variables[j].defaultValue
                                    })
                                }
                            }
                        }


                        resolve(settings);
                    } else {
                        console.log(deviceResult);

                        resolve([]);
                    }
                }
                )



            })
        });

    },

    updateSettings: function (device, module, variable, value) {
        return new Promise(resolve => {
            const deviceData = global.database.collection("deviceData");


            deviceData.findOne({ uuid: device }).then(deviceResult => {


                if (deviceResult != null && deviceResult.settings != null) {
                    const deviceSettings = deviceResult.settings;
                    let foundModule = false;
                    let foundVariable = false;
                    for (let i = 0; i < deviceSettings.length; i++) {
                        if (deviceSettings[i].UUID === module) {
                            foundModule = true;
                            for (let j = 0; j < deviceSettings[i].variables.length; j++) {
                                if (deviceSettings[i].variables[j].UUID === variable) {
                                    foundVariable = true;
                                    deviceSettings[i].variables[j].value = value;
                                    break;
                                }
                            }
                            if (!foundVariable) {
                                deviceSettings[i].variables.push({
                                    UUID: variable,
                                    value: value
                                })
                            }
                            break;
                        }
                    }
                    if (!foundModule) {
                        deviceSettings.push({
                            UUID: module,
                            variables: [
                                {
                                    UUID: variable,
                                    value: value
                                }
                            ]
                        })
                    }
                    deviceData.updateOne({ uuid: device }, { $set: { status: deviceSettings } }).then(() => {
                        resolve();
                    })
                }

            });

        })
    },


    getDeviceStatusModules: function (deviceType) {
        return new Promise(resolve => {
            const deviceTypeData = global.database.collection("device");
            deviceTypeData.findOne({ UUID: deviceType }).then(deviceTypeResult => {
                if (deviceTypeResult != null && deviceTypeResult.statusModules != null) {
                    resolve(deviceTypeResult.statusModules);
                } else {
                    resolve([]);
                }
            })

        });

    },


    getDeviceSettingsModules: function (deviceType) {
        return new Promise(resolve => {
            const deviceTypeData = global.database.collection("device");
            deviceTypeData.findOne({ UUID: deviceType }).then(deviceTypeResult => {
                if (deviceTypeResult != null && deviceTypeResult.settingsModules != null) {
                    resolve(deviceTypeResult.settingsModules);
                } else {
                    resolve([]);
                }
            })

        });

    }


};




