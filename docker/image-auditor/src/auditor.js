// Listening for broadcasted messages on the local network

var dgram = require('dgram');
var s = dgram.createSocket('udp4');

// s.bind(2205, function() {
//   console.log("Listening for broadcasted ads");
// });

var protocol = {

    PROTOCOL_PORT: 2205,
    PROTOCOL_MULTICAST_ADDRESS: '224.0.0.12'
}

var instrumentSound = {
    "piano": "ti-ta-ti",
    "trumpet": "pouet",
    "flute": "trulu",
    "violin": "gzi-gzi",
    "drum": "boum-boum"
}

var connections = [];
var lastRequest = [];

setInterval(checkLoseConnection, 1000);


s.bind(protocol.PROTOCOL_PORT, function() {

    console.log("Joining multicast group: "+protocol.PROTOCOL_MULTICAST_ADDRESS);
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// This call back is invoked when a new datagram has arrived.
s.on('message', function(msg, source) {
    //console.log("New message: "+msg);
    
    var obj = JSON.parse(msg);

    console.log(instrumentSound[obj['instrument']]);

    //if is not in the array 
    if(!isInArray(obj['uuid'])) {
    
        //add the new musician
        updateConnection(obj);

        //Send current musicians connected
        var currentMusicians = JSON.stringify(connections);

        s.send(currentMusicians, 0, currentMusicians.length, source.port, source.address, function(err, bytes) {
            
        });
    } else {

        //save last requet timestamp for each musicians
        for(var i = 0; i < lastRequest.length; i++) {

            if(lastRequest[i]['uuid'] == obj['uuid']) {
                lastRequest[i]['last'] = Date.now();
                break;
            }
        }
    }

	//console.log("Ad has arrived: '" + msg + "'. Source address: " + source.address + ", source port: " + source.port);
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

    for(var i = 0; i < lastRequest.length; i++){

        
        //console.log(Date.now() + " - "+Date.parse(connections[i]['activeSince']));

        if(Date.now() - lastRequest[i]['last'] > 5000) {

            console.log("Lost connection with: " + lastRequest[i]['uuid'] + " for inactivity");
            
            removeByUuid(lastRequest[i]['uuid']);
            lastRequest.splice(i, 1);

            console.log(connections);
            
        }
        
    }
}

function removeByUuid(uuid){

    for(var i = 0; i < connections.length; i++) {
        
        if(connections[i]['uuid'] == uuid) {
            connections.splice(i, 1);
        }
    }
}