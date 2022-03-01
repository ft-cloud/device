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

    isUserDev: function(userUUID,deviceUUID) {

        return new Promise(resolve => {
            const deviceDatabase = global.database.collection('device');
            deviceDatabase.findOne({UUID:deviceUUID}).then(device=>{
                    resolve(device.developers.includes(userUUID))
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
     * @param type
     * @param deviceUUID
     * @param module
     * @param isSettings
     * @param defaultValue
     * @returns {Promise<unknown>}
     */

    addVariable: function (name,type,deviceUUID,module,isSettings,defaultValue = 0) {
        return new Promise(resolve=>{
            const deviceDatabase = global.database.collection('device');
            let variableUUID = uuidV4();
            const variable = {
                UUID: variableUUID,
                name: name,
                type: type,
                defaultValue: defaultValue
            }
            if(isSettings){
                let object = {};
                object["settingsModules.$[module].variables"] = variable;

                deviceDatabase.updateOne({UUID:deviceUUID},{$push: object},{arrayFilters:  [{"module.UUID":module}]}).then(()=>{
                    resolve(variableUUID);
                })

            }else{
                let object = {};
                object["statusModules.$[module].variables"] = variable;

                deviceDatabase.updateOne({UUID:deviceUUID},{$push: object},{arrayFilters:  [{"module.UUID":module}]}).then(()=>{
                    resolve(variableUUID);
                })

            }

        })
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


    },

    /***
     * 
     * Delete a module from uuid
     * 
     */
        removeModule: function (moduleUUID,deviceUUID,isSettings) {
        return new Promise((resolve,reject) => {
            const deviceDatabase = global.database.collection('device');
            let object = {};
            if(isSettings) {
                object["settingsModules.$[module].UUID"] = moduleUUID;
            } else{
                object["statusModules.$[module].UUID"] = moduleUUID;
            }

            deviceDatabase.updateOne({UUID:deviceUUID},{$pull: object},{arrayFilters:  [{"module.UUID":moduleUUID}]}).then(()=>{
                resolve();
            });

        });
    },

    /***
     * 
     * Delete a variable from uuid
     * 
     */

    removeVariable: function (variableUUID,moduleUUID,deviceUUID,isSettings) {
        return new Promise((resolve,reject) => {
            const deviceDatabase = global.database.collection('device');
            let object = {};
            if(isSettings) {
                object["settingsModules.$[module].variables.$[variable].UUID"] = variableUUID;
            } else{
                object["statusModules.$[module].variables.$[variable].UUID"] = variableUUID;
            }

            deviceDatabase.updateOne({UUID:deviceUUID},{$pull: object},{arrayFilters:  [{"module.UUID":moduleUUID},{"variable.UUID":variableUUID}]}).then(()=>{
                resolve();
            });

        });
    }

}