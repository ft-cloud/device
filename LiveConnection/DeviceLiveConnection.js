import Net from "net";


import {session} from "sessionlib/session.js";

import {device} from "../device.js";

const port = 8846;

/*
-3 param error
-2 auth faild
-1 timeout
0 - ready waiting for auth
1 - auth success


 */

export function initDeviceLiveConnection() {


    const server = new Net.Server();
    server.listen(port, function () {
        console.log(`Server listening for device connection requests on socket localhost:${port}`);
    });

    server.on('connection', (socket) => {
        socket.lastMessage = Date.now();

        socket.write(JSON.stringify({status: 0})+"\n");
        console.log("New Connection")


        socket.on('data', function (chunk) {
            if(socket.auth) {
                socket.lastMessage = Date.now();
            }
            handleMessage(chunk, socket);
        });

        socket.on('error',()=>{
            terminateConnection(socket);
        })

        socket.on('close', function () {
            console.log('Connection closed');
            terminateConnection(socket)
        });

        function checkConnection() {
            if ((Date.now() - socket.lastMessage) >= 5000) {
                socket.write(JSON.stringify({status: -1})+"\n");
                console.log("closed due timeout")
                clearInterval(socket.interval);
                terminateConnection(socket);
            }
        }



        socket.interval = setInterval(checkConnection, 5000);

    });




}

function handleMessage(message, socket) {
    console.log(message.toString());
    let parsedMessage;
    try {
        parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
    } catch (e) {
        console.log(e);
      return;
    }


    methods.handler.forEach(function (method) {
        if(method.canHandle(parsedMessage)) {
            method.handle(parsedMessage, socket);
        }
    });




}

const statusUpdateHandler = {
    canHandle: function (message) {
        return message.type === "status";
    },
    handle: function (message,socket) {

        //No authentication
        if(socket.deviceUUID==null) {
            socket.write(JSON.stringify({status: -2})+"\n");
            terminateConnection(socket);
            return;
        }

        if(message.module!=null&&message.variable!=null&&message.value!=null) {
            device.updateStatus(socket.deviceUUID,message.module,message.variable,message.value);
            socket.write(JSON.stringify({status: 1})+"\n");
        }else{
            socket.write(JSON.stringify({status: -3})+"\n");
        }
    }

}


const authHandler = {

    canHandle: function(message) {
        return message.type === "auth";
    },
    handle: function (message, socket) {
       if(message.apiKey!=null) {
                device.getDeviceUUID(message.apiKey,(result)=>{
                if(result!=null) {
                    socket.write(JSON.stringify({status: 1})+"\n");
                    socket.auth = true;
                    socket.deviceUUID = result;
                    device.setOnlineState(true,socket.deviceUUID,()=>{
                        console.log("device online");

                    });

                }else{
                    socket.write(JSON.stringify({status: -2})+"\n");
                    terminateConnection(socket);
                }
            });
       }else {
           socket.write(JSON.stringify({status: -2})+"\n");
           terminateConnection(socket);
       }
    }

}

const pingHandler = {
    canHandle: function(message) {
        return message.type === "ping";
    },
    handle: function (message, socket) {
        if(socket.auth) {
            socket.write(JSON.stringify({status: 1})+"\n");
        }else{
            socket.write(JSON.stringify({status: 0})+"\n");
        }
    }
}

let methods = {
    handler: [authHandler,pingHandler,statusUpdateHandler]
}


function terminateConnection(socket) {

    if(socket.auth) {
        device.setOnlineState(false,socket.deviceUUID,()=>{
            console.log("Device offline");
        });
    }

    socket.destroy();

}