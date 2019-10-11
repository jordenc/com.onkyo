"use strict";

const Homey = require('homey');
let devices = [];

class OnkyoDriver extends Homey.Driver {

	onInit() {

        this._TriggerinputChanged = new Homey.FlowCardTriggerDevice('inputChanged')
            .register()
            
        this._TriggervolumeChanged = new Homey.FlowCardTriggerDevice('volumeChanged')
            .register()
            
        this._TriggerreceiverOn = new Homey.FlowCardTriggerDevice('receiverOn')
            .register()
            
        this._TriggerreceiverOff = new Homey.FlowCardTriggerDevice('receiverOff')
            .register()
		
		this._TriggerreceiverMute = new Homey.FlowCardTriggerDevice('Mute')
           .register()
		   
		this._TriggerreceiverunMute = new Homey.FlowCardTriggerDevice('unMute')
           .register()

    }

    triggerinputChanged( device, tokens, state ) {
        this._TriggerinputChanged
            .trigger( device, tokens, state )
                .then( this.log )
                .catch( this.error )
    }
    
    triggervolumeChanged( device, tokens, state ) {
        this._TriggervolumeChanged
            .trigger( device, tokens, state )
                .then( this.log )
                .catch( this.error )
    }
    
    triggerreceiverOn( device, tokens, state ) {
        this._TriggerreceiverOn
            .trigger( device, tokens, state )
                .then( this.log )
                .catch( this.error )
    }
    
    triggerreceiverOff( device, tokens, state ) {
        this._TriggerreceiverOff
            .trigger( device, tokens, state )
                .then( this.log )
                .catch( this.error )
    }
	
	triggerreceiverMute( device, tokens, state ) {
        this._TriggerreceiverMute
            .trigger( device, tokens, state )
                .then( this.log )
                .catch( this.error )
	 }
	 
	triggerreceiverunMute( device, tokens, state ) {
         this._TriggerreceiverunMute
            .trigger( device, tokens, state )
				.then( this.log )
				.catch( this.error )
	 }
    	
	onPairListDevices( data, callback ){

		console.log('__DISCOVERY STARTED__');
	    /*
	      discover([options, ] callback)
	      Sends broadcast and waits for response callback called when number of devices or timeout reached
	      option.devices    - stop listening after this amount of devices have answered (default: 1)
	      option.timeout    - time in seconds to wait for devices to respond (default: 10)
	      option.address    - broadcast address to send magic packet to (default: 255.255.255.255)
	      option.port       - receiver port should always be 60128 this is just available if you need it
	    */
	    
	    var dgram = require('dgram'),
	    util = require('util');
	    
	    //var callback, timeout_timer, result,
	    var options = {},
	        client = dgram.createSocket('udp4'),
	        argv = Array.prototype.slice.call(arguments);
	
	    options.timeout = options.timeout || 5;
	    options.address = options.address || '255.255.255.255';
	    options.port = options.port || 60128;
	
	    function close() {
		    console.log('__DISCOVERY ENDED__');
	        client.close();
	        
	        //if (typeof result !== false) 
	        callback (null, devices); //else callback (null, null);
	    }
	
	    client
		.on('error', function (err) {
	        
	        console.log(util.format("Server error on %s:%s - %s", options.address, options.port, err));
	        client.close();
	        callback(err, null);
	    })
		.on('message', function (packet, rinfo) {
	        var message = eiscp_packet_extract(packet),
	            command = message.slice(0, 3),
	            data;
	        if (command === 'ECN') {
	            data = message.slice(3).split('/');
	            
	            //only add new devices
	            var device = {
		            name: data[0],
		            data: {
		                host:     rinfo.address,
		                port:     data[1],
		                model:    data[0],
		                mac:      data[3].slice(0, 12), // There's lots of null chars after MAC so we slice them off
		                areacode: data[2]
		            }
	            }
	            
	            console.log(util.format("Received discovery packet from %s:%s (%j)", rinfo.address, rinfo.port, device));
	            
	            devices.push(device);

	        } else {
	            console.log(util.format("Received data from %s:%s - %j", rinfo.address, rinfo.port, message));
	        }
	    })
		.on('listening', function () {
	        client.setBroadcast(true);
	        var buffer = eiscp_packet('!xECNQSTN');
	        
	        console.log(util.format("Sent ONKYO broadcast discovery packet to %s:%s", options.address, options.port));
	        client.send(buffer, 0, buffer.length, options.port, options.address);
	        var timeout_timer = setTimeout(close, options.timeout * 1000);
	        
	        var buffer2 = eiscp_packet('!pECNQSTN');
	        
	        console.log(util.format("Sent PIONEER broadcast discovery packet to %s:%s", options.address, options.port));
	        client.send(buffer2, 0, buffer2.length, options.port, options.address);
	        //timeout_timer = setTimeout(close, options.timeout * 1000);
	        
	    })
	    .bind(0);
	
	}
	
}	

module.exports = OnkyoDriver;


function eiscp_packet (cmd) {
	
	var cmdLength=cmd.length+1; 
	var code=String.fromCharCode(cmdLength);
	var line="ISCP\x00\x00\x00\x10\x00\x00\x00"+code+"\x01\x00\x00\x00"+cmd+"\x0D";
	
	return line;
}

function eiscp_packet_extract(packet) {
    return packet.toString('ascii', 18, packet.length - 3);
}