var uuid = require('uuid');
const axios = require('axios');

var device = {


    getDeviceConfig: function (uuid, deviceUUID, callback) {
        if (!uuid) callback(undefined); //TODO why?
        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({uuid:deviceUUID}).then(res=>{
            if(res.config!=null){
                callback(res.config)
            }else{
                callback(undefined);

            }
        })
    },

    checkUserDeviceAccessPermission: function (useruuid, deviceuuid) {
        return new Promise(function (resolve, reject) {
            const account = global.database.collection("account");
            account.findOne({uuid:useruuid}).then(res=>{

                    if(res!=null&&res.devices!=null&&res.devices.indexOf(deviceuuid)!==-1){
                        resolve(true);
                    }else{
                        axios("http://account:3000/api/v1/account/isUserAdmin?uuid="+useruuid).then(parsed => {
                            resolve(parsed.data.isAdmin);
                        });
                    }

            })
        });

    },





    updateDeviceConfig: function (deviceuuid, key, value) {
        return new Promise(function (resolve, reject) {
            const deviceData = global.database.collection("deviceData");
            deviceData.update({uuid:deviceuuid},{$push:{config: {key: value}}}).then(()=> {resolve();})
        })

    },

    deleteDeviceConnection: function (useruuid,deviceuuid, callback) {

        const account = global.database.collection("account");
        const deviceData = global.database.collection("deviceData");
       const promiseAccount = account.update({uuid: useruuid},{$pull: {devices:  deviceuuid}});
        const promiseDeviceDelete = deviceData.deleteOne({uuid: deviceuuid});
        const promises = [promiseAccount,promiseDeviceDelete];
        Promise.all(promises).then(()=>{

            callback(true);
        })

    },


    listAll: function (callback) {

        const device = global.database.collection("device");
        const cursor = device.find();
        cursor.toArray().then(array=> {
            console.log(array);
            callback(array);
        })


    },


    deleteAPIKey: function (deviceuuid, callback) {


        const session = global.database.collection("session");
        session.deleteOne({usedBy:deviceuuid}).then(()=>{
            callback();
        })


    },

    getDeviceUUID: function (apiKey, callback) {

        const session = global.database.collection("session");
        session.findOne({uuid:apiKey}).then(result => {
            if(result!==null&&result.usedBy!=null) {
                callback(result.usedBy);
            } else{
                callback(undefined);

            }
        })

    },

    getOnlineState: function (deviceuuid, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({uuid:deviceuuid}).then(result => {
            if(result!=null&&result.online!=null) {
                callback(result.online);
            }
        })

    },
    //TODO untested
    setOnlineState: function (state, deviceuuid, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.updateOne({uuid:deviceuuid},{$set:{online:state}}).then(()=>{
           callback();
        })

    },

    getDeviceTypFromDevice: function (deviceuuid, callback) {
        const deviceData = global.database.collection("deviceData");
        const device = global.database.collection("device");
        deviceData.findOne({uuid:deviceuuid}).then(deviceResult=>{
            if(deviceResult!=null&&deviceResult.deviceUUID!=null) {
                device.findOne({UUID: deviceResult.deviceUUID}).then(deviceType=>{
                    callback(deviceType);
                })
            }
        })

    },


    getUserSpecificDeviceInfo: function (useruuid, device, callback) {

        this.checkUserDeviceAccessPermission(useruuid,device).then((access)=>{
            if(access) {
                const deviceData = global.database.collection("deviceData");
                deviceData.findOne({uuid:device}).then(deviceResult=>{
                    if(deviceResult!=null) {
                        callback({
                            content: deviceResult,

                        });
                    }else{
                        callback({
                            error: true,
                            errorMessage: "Device does not exist!"
                        });
                    }
                })
            }else{
                callback({
                    error: true,
                    errorMessage: "No Access!"
                });
            }
        })


    },

    changeDeviceName: function (deviceUUID, newName, callback) {
        const deviceData = global.database.collection("deviceData");
        deviceData.updateOne({uuid: deviceUUID},{$set: {name: newName}}).then(()=>{callback(true)})
    },


    listSpecificDevice: function (useruuid, device, callback) {

        const deviceData = global.database.collection("deviceData");
        const account = global.database.collection("account");
        account.findOne({uuid: useruuid}).then(account => {
            if(account!=null) {
                const ownedDevices = account.devices;
                if(ownedDevices!=null) {
                    const cursor =  deviceData.find({uuid: {$in: ownedDevices}, deviceUUID: device});
                    cursor.toArray().then(deviceArray=>{
                        callback(deviceArray)
                    })
                }else{
                    callback([])
                }


            }
        })

    },
    //TODO untested
    updateStatusInfo: function (device, key, value, callback) {

        const deviceData = global.database.collection("deviceData");
        deviceData.findOne({uuid:device}).then(deviceResult=>{
            if(deviceResult!=null&&deviceResult.statusInfo!=null) {
                const deviceStatusInfo = deviceResult.statusInfo;
                deviceStatusInfo[key] = value;
                deviceData.updateOne({uuid:device},{$set:{statusInfo:deviceStatusInfo}}).then(()=>{
                    callback();
                })
            }
        })
    },

    getStatusInfo: function (device) {
        return new Promise((resolve, reject) => {
            const deviceData = global.database.collection("deviceData");
            deviceData.findOne({uuid: device}).then((deviceResult)=>{
                if(deviceResult!=null&&deviceResult.statusInfo!=null) {
                    resolve(deviceResult.statusInfo);
                }
            })

        });
    }


};


module.exports = device;


