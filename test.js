// see https://gist.github.com/natevw/5789019 for pins

var NRF24 = require("./index"),
    spiDev = "/dev/spidev0.0",
    cePin = 24, irqPin = 25,            //var ce = require("./gpio").connect(cePin)
    pipes = [0xF0F0F0F0E1, 0xF0F0F0F0D2];


var stream = require('stream'),
    util = require('util');

function TimeStream(ms) {
    stream.Readable.call(this);
}
util.inherits(TimeStream, stream.Readable);
TimeStream.prototype._read = function () {
    this.push(new Date().toISOString());
};

function CountStream(ms) {
    stream.Readable.call(this);
    this._n = 0;
}
util.inherits(CountStream, stream.Readable);
CountStream.prototype._read = function () {
    var b = new Buffer(4);
    b.writeUInt32BE(this._n++, 0);
    this.push(b);
};



var nrf = NRF24.connect(spiDev, cePin, irqPin);
nrf._debug = true;
nrf.channel(0x4c).transmitPower('PA_MAX').dataRate('1Mbps').crcBytes(2).autoRetransmit({count:15, delay:500}).begin(function () {
/*
    var tx = nrf.openPipe('tx', pipes[0], {autoAck:true});
    tx.on('ready', function () {
        nrf._debug = false;
        nrf.printDetails(function () {
            nrf._debug = true;
            //(new TimeStream).pipe(tx);
            (new CountStream).pipe(tx);
            return;
            
            var num = 0;
            setInterval(function () {
                tx.write(Buffer([0,0,0,num++]));
            }, 5e3);
        });
    });
    tx.on('error', function (e) {
        console.warn("TX error", e);
        // original will have unpipe, start another!
        (new CountStream).pipe(tx);
    });
*/
    var rx = nrf.openPipe('rx', pipes[0]);
    rx.on('data', function (d) {
        console.log("Got data", d);
    });
});
