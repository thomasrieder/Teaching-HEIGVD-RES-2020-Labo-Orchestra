// Sending a message to all nodes on the local network

var dgram = require('dgram');
const { v4: uuidv4 } = require('uuid');
var s = dgram.createSocket('udp4');
const protocol = require('./protocol');


console.log("INSTRUMENT: "+process.argv[2]);

//define protocol
// const protocol = {
//     PROTOCOL_PORT: 2205,
//     PROTOCOL_MULTICAST_ADDRESS: '224.0.0.12'
// }


class Musician {

    constructor(_instrument) {

        let infos = {
            uuid: uuidv4(),
            instrument: _instrument
        };

        let payload = JSON.stringify(infos);
        
        this.message = new Buffer.from(payload);
    }

    play() {

        this.interval = setInterval(() => {
            this.sendToAuditor();
        }, 1000);
    }

    sendToAuditor() {

        //send musician to multicast address
        s.send(this.message, 0, this.message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
            console.log("Sending via port " + s.address().port);
        }); 
    }
}

var musician = new Musician(process.argv[2]);

musician.play();


//listen server response with all other musicians
s.on('message', function(msg, source) {
    
    console.log(JSON.parse(msg));
});