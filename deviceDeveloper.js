export const deviceDeveloper = {

    createDevice: function (accountUUID) {
        return new Promise((resolve, reject) => {
          const deviceDatabase = global.database.collection('device');
            const cursor = deviceDatabase.find({developer:accountUUID})
            cursor.toArray().then(devices=>{
                resolve(devices);
            }).catch(err=>{
                reject(err);
            })

        });
    },


}