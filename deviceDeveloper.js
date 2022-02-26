import {device} from "./device.js";
import {v4 as uuidV4} from "uuid";

export const deviceDeveloper = {

    getDevices: function (accountUUID) {
        return new Promise((resolve, reject) => {
          const deviceDatabase = global.database.collection('device');
            const cursor = deviceDatabase.find({developer:{$elemMatch: {accountUUID}}})
            cursor.toArray().then(devices=>{
                resolve(devices);
            }).catch(err=>{
                reject(err);
            })

        });
    },

    createDevice: function(developerUUID,name) {

        return new Promise((resolve,reject) => {
            const deviceDatabase = global.database.collection('device');
            let newDeviceUUID = uuidV4();
            const newDevice = {

                UUID: newDeviceUUID,
                name: name,
                statusModules: [],
                settingsModules: [],
                description: "",
                data: {},
                developers: [developerUUID]

            }

            deviceDatabase.insertOne(newDevice).then(()=>{
                resolve(newDeviceUUID);
            });


        });

    },


    /***
     *
     * @param name
     * @param device
     * @param settings true if settingsModule, false for statusModule
     * @returns {Promise<unknown>}
     */
    addModule: function (name,device,settings) {

        return new Promise((resolve,reject) => {
            const deviceDatabase = global.database.collection('device');
            let newModuleUUID = uuidV4();
            const newModule = {

                UUID: newModuleUUID,
                name: name,
                variables: []
            }
            if(settings) {
                deviceDatabase.updateOne({UUID: device},{$push: {settingsModules:newModule}}).then(()=>{
                    resolve(newModuleUUID);
                });
            } else{
                deviceDatabase.updateOne({UUID: device},{$push: {statusModules:newModule}}).then(()=>{
                    resolve(newModuleUUID);
                });
            }



        });


    }


}