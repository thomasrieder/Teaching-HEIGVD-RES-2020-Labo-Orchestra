// Sending a message to all nodes on the local network

var dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');


var s = dgram.createSocket('udp4');


console.log("INSTRUMENT: "+process.argv[2]);


var protocol = {

    PROTOCOL_PORT: 2205,
    PROTOCOL_MULTICAST_ADDRESS: '224.0.0.12'

}

var musician = {
    uuid: uuidv4(),
    instrument: "piano" //get it from docker
}


message = new Buffer.from(JSON.stringify(musician));	


setInterval(() => {

    s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
        console.log("Sending via port " + s.address().port);
    });
    
}, 1000);

s.on('message', function(msg, source) {
    
    console.log(JSON.parse(msg));
    
});