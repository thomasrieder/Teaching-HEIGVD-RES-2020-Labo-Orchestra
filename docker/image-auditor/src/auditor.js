// Listening for broadcasted messages on the local network

var dgram       = require('dgram');
var s           = dgram.createSocket('udp4');
const protocol  = require('./protocol');
const net       = require('net');

var instrumentSound = {
    "piano": "ti-ta-ti",
    "trumpet": "pouet",
    "flute": "trulu",
    "violin": "gzi-gzi",
    "drum": "boum-boum"
}

//contains all current connection
var connections = [];

//contains last request time for each connection
var lastRequest = [];


//************ for TCP connections ************
const server = net.createServer((c) => {
    
    c.write(JSON.stringify(connections));
    c.pipe(c);
    c.destroy();

});

server.listen(protocol.PROTOCOL_PORT, () => {

});
//*********************************************

setInterval(checkLoseConnection, 1000);


s.bind(protocol.PROTOCOL_PORT, function() {

    console.log("Joining multicast group: "+protocol.PROTOCOL_MULTICAST_ADDRESS);
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// This call back is invoked when a new datagram has arrived.
s.on('message', function(msg, source) {

    //console.log("New message: "+msg);
    
    //parse msg to json array (js object)
    let obj = JSON.parse(msg);

    //play sound
    console.log(instrumentSound[obj['instrument']]);
    

    //if is not in the array 
    if(!isInArray(obj['uuid'])) {

        //Send current musicians connected
        let currentMusicians = JSON.stringify(connections);

        s.send(currentMusicians, 0, currentMusicians.length, source.port, source.address, function(err, bytes) {
            
            console.log("Send other musicians to new musician");    
        });

        //add the new musician
        updateConnection(obj);


    } else {

        //save last requet timestamp for each musicians
        for(var i = 0; i < lastRequest.length; i++) {

            if(lastRequest[i]['uuid'] == obj['uuid']) {
                lastRequest[i]['last'] = Date.now();
                break;
            }
        }
    }
});



function updateConnection(musician) {


    //add active date to the new musician
    var date = new Date();
    musician['activeSince'] = date.toISOString();

    //push new musician
    connections.push(musician);

    //save first request timestamp
    lastRequest.push({
        'uuid': musician['uuid'],
        'last': Date.now()
    });
    

    console.log(connections);
}

function isInArray(uuid) {

    var inArray = 0;
    
    //search if uuid is already in array
    for(var i = 0; i < connections.length; i++) {

        if(connections[i]['uuid'] == uuid) {

            inArray = 1;
            break;
        }
    }

    return inArray;
}

function checkLoseConnection() {

    //for each last request
    for(var i = 0; i < lastRequest.length; i++){

        //if last requets is older than 5s
        if(Date.now() - lastRequest[i]['last'] > 5000) {

            console.log("Lost connection with: " + lastRequest[i]['uuid'] + " for inactivity");
            
            //remove connection by uuid
            removeByUuid(lastRequest[i]['uuid']);

            //remove last request entry
            lastRequest.splice(i, 1);

            console.log(connections);
            
        }
        
    }
}

function removeByUuid(uuid){

    for(var i = 0; i < connections.length; i++) {
        
        if(connections[i]['uuid'] == uuid) {

            connections.splice(i, 1);
            break;
        }
    }
}