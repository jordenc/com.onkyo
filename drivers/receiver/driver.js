"use strict";

var net = require('net');
var tempIP = '';
var tempName = '';
//var client;
var devices = {};
var result = [];

module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {

    Homey.log ('Changed settings: ' + JSON.stringify(device_data) + ' / ' + JSON.stringify(newSettingsObj) + ' / old = ' + JSON.stringify(oldSettingsObj));
    
    try {
      changedKeysArr.forEach(function (key) {
        devices[device_data.id].settings[key] = newSettingsObj[key]
      })
      callback(null, true)
    } catch (error) {
      callback(error)
    }

};

module.exports.init = function(devices_data, callback) {
    
    devices_data.forEach(function initdevice(device) {
	    
	    Homey.log('add device: ' + JSON.stringify(device));
	    
	    devices[device.id] = device;
	    
	    module.exports.getSettings(device, function(err, settings){
		    devices[device.id].settings = settings;
		});
		
	});
	
	Homey.log("Onkyo app - init done");
	
	
	callback (null, true);
};

module.exports.deleted = function( device_data ) {
    
    Homey.log('deleted: ' + JSON.stringify(device_data));
    
    devices[device_data.id] = [];
	
};

// CAPABILITIES
module.exports.capabilities = {
    onoff: {

        get: function( device_data, callback ){

			Homey.log('Getting device_status of ' + devices[device_data.id].settings.ipaddress);
            sendCommand ('!1PWRQSTN', devices[device_data.id].settings.ipaddress, callback, '!1PWR01');
            
        },

        set: function( device_data, turnon, callback ) {
	        
	        Homey.log('Setting device_status of ' + devices[device_data.id].settings.ipaddress + ' to ' + turnon);

			if (turnon) {
				
				sendCommand ('!1PWR01', devices[device_data.id].settings.ipaddress, callback, '!1PWR01');
				
			} else {
				
				sendCommand ('!1PWR00', devices[device_data.id].settings.ipaddress, callback, '!1PWR00');
				
			}

        }
    },
    volume_set: {

        get: function( device_data, callback ){

			Homey.log('Getting volume of ' + devices[device_data.id].settings.ipaddress);
            sendCommand ('!1MVLQSTN', devices[device_data.id].settings.ipaddress, function (hex) {
	         
	         	Homey.log('[HEX]' + hex +'[/HEX]');
	         	var volume = parseInt(hex, 16);
	         	volume = Math.round(volume / 60 * 100);
	         	volume = volume / 100;
	         	Homey.log('[VOLUME] ' + volume);
	         	callback (null, volume);
	            
	        }, 'return');
            
        },

        set: function( device_data, volume, callback ) {
	        
	        Homey.log('Setting volume of ' + devices[device_data.id].settings.ipaddress + ' to ' + volume);
	        
	        volume = Math.round(volume * 60);
	        var hexVolume = volume.toString(16).toUpperCase();
	
			if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
			
			Homey.log ('target volume in HEX=' + hexVolume);
			sendCommand ('!1MVL' + hexVolume, devices[device_data.id].settings.ipaddress, callback, '!1MVL' + hexVolume);
			
        }
    }
}

// END CAPABILITIES

var allPossibleInputs = [
		{	inputName: '!1SLI10',
	 		friendlyName: "BluRay/DVD player"
		},
		{	inputName: '!1SLI00',
	 		friendlyName: "VCR/DVR"
		},
		{	inputName: '!1SLI01',
	 		friendlyName: "Cable/Sat TV"
		},
		{	inputName: '!1SLI05',
	 		friendlyName: "PC"
		},
		{	inputName: '!1SLI02',
	 		friendlyName: "Game"
		},
		{	inputName: '!1SLI03',
			friendlyName: "Aux"
		},
		{	inputName: '!1SLI23',
			friendlyName: "TV/CD"
		},
		{	inputName: '!1SLI22',
	 		friendlyName: "Phono"
		},
		{	inputName: '!1SLI24',
	 		friendlyName: "Tuner"
		},
		{	inputName: '!1SLI2B',
	 		friendlyName: "Net"
		},
		{	inputName: '!1SLI29',
	 		friendlyName: "USB"
		}
];
		
var allPossibleListenmodes = [
		{	modeName: '!1LMD00',
	 		friendlyName: "Stereo"
		},
		{	modeName: '!1LMD00',
	 		friendlyName: "Direct"
		},
		{	modeName: '!1LMD02',
	 		friendlyName: "Surround"
		},
		{	modeName: '!1LMD03',
	 		friendlyName: "Film"
		},
		{	modeName: '!1LMD04',
	 		friendlyName: "THX"
		},
		{	modeName: '!1LMD05',
			friendlyName: "Action"
		},
		{	modeName: '!1LMD06',
			friendlyName: "Musical"
		},
		{	modeName: '!1LMD07',
	 		friendlyName: "Mono movie"
		},
		{	modeName: '!1LMD08',
	 		friendlyName: "Orchestra"
		},
		{	modeName: '!1LMD09',
	 		friendlyName: "Unplugged"
		},
		{	modeName: '!1LMD09',
	 		friendlyName: "Studio/Mix"
		},
		{	modeName: '!1LMD0B',
	 		friendlyName: "TV Logic"
		},
		{	modeName: '!1LMD0C',
	 		friendlyName: "All channels stereo"
		},
		{	modeName: '!1LMD0D',
	 		friendlyName: "Theater-dimensional"
		},
		{	modeName: '!1LMD0E',
	 		friendlyName: "Enhanced"
		},
		{	modeName: '!1LMD0F',
	 		friendlyName: "Mono"
		},
		{	modeName: '!1LMD11',
	 		friendlyName: "Pure audio"
		},
		{	modeName: '!1LMD12',
	 		friendlyName: "Multiplex"
		},
		{	modeName: '!1LMD13',
	 		friendlyName: "Full mono"
		},
		{	modeName: '!1LMD14',
	 		friendlyName: "Dolby Virtual"
		},
		{	modeName: '!1LMD15',
	 		friendlyName: "DTS Surround Sensation"
		},
		{	modeName: '!1LMD16',
	 		friendlyName: "Audyssey DSX"
		},
		{	modeName: '!1LMD1F',
	 		friendlyName: "Whole House Mode"
		},
		{	modeName: '!1LMD40',
	 		friendlyName: "5.1ch Surround"
		},
		{	modeName: '!1LMD41',
	 		friendlyName: "Dolby EX/DTS ES"
		},
		{	modeName: '!1LMD42',
	 		friendlyName: "THX Cinema"
		},
		{	modeName: '!1LMD43',
	 		friendlyName: "THX Surround EX"
		},
		{	modeName: '!1LMD44',
	 		friendlyName: "THX Music"
		},
		{	modeName: '!1LMD45',
	 		friendlyName: "THX Games"
		},
		{	modeName: '!1LMD50',
	 		friendlyName: "THX U2/S2/I/S Cinema/Cinema2"
		},
		{	modeName: '!1LMD51',
	 		friendlyName: "THX MusicMode,THX U2/S2/I/S Music"
		},
		{	modeName: '!1LMD52',
	 		friendlyName: "THX Games Mode,THX U2/S2/I/S Games"
		},
		{	modeName: '!1LMD80',
	 		friendlyName: "PLII/PLIIx Movie"
		},
		{	modeName: '!1LMD81',
	 		friendlyName: "PLII/PLIIx Music"
		},
		{	modeName: '!1LMD82',
	 		friendlyName: "Neo:6 Cinema/Neo:X Cinema"
		},
		{	modeName: '!1LMD83',
	 		friendlyName: "Neo:6 Music/Neo:X Music"
		},
		{	modeName: '!1LMD84',
	 		friendlyName: "PLII/PLIIx THX Cinema"
		},
		{	modeName: '!1LMD85',
	 		friendlyName: "Neo:6/Neo:X THX Cinema"
		},
		{	modeName: '!1LMD86',
	 		friendlyName: "PLII/PLIIx Game"
		},
		{	modeName: '!1LMD88',
	 		friendlyName: "Neural THX/Neural Surround"
		},
		{	modeName: '!1LMD89',
	 		friendlyName: "PLII/PLIIx THX Games"
		},
		{	modeName: '!1LMD8A',
	 		friendlyName: "Neo:6/Neo:X THX Games"
		},
		{	modeName: '!1LMD8B',
	 		friendlyName: "PLII/PLIIx THX Music"
		},
		{	modeName: '!1LMD8C',
	 		friendlyName: "Neo:6/Neo:X THX Music"
		},
		{	modeName: '!1LMD8D',
	 		friendlyName: "Neural THX Cinema"
		},
		{	modeName: '!1LMD8E',
	 		friendlyName: "Neural THX Music"
		},
		{	modeName: '!1LMD8F',
	 		friendlyName: "Neural THX Games"
		},
		{	modeName: '!1LMD90',
	 		friendlyName: "PLIIz Height"
		},
		{	modeName: '!1LMD91',
	 		friendlyName: "Neo:6 Cinema DTS Surround Sensation"
		},
		{	modeName: '!1LMD92',
	 		friendlyName: "Neo:6 Music DTS Surround Sensation"
		},
		{	modeName: '!1LMD93',
	 		friendlyName: "Neural Digital Music"
		},
		{	modeName: '!1LMD94',
	 		friendlyName: "PLIIz Height + THX Cinema"
		},
		{	modeName: '!1LMD95',
	 		friendlyName: "PLIIz Height + THX Music"
		},
		{	modeName: '!1LMD96',
	 		friendlyName: "PLIIz Height + THX Games"
		},
		{	modeName: '!1LMD97',
	 		friendlyName: "PLIIz Height + THX U2/S2 Cinema"
		},
		{	modeName: '!1LMD98',
	 		friendlyName: "PLIIz Height + THX U2/S2 Music"
		},
		{	modeName: '!1LMD99',
	 		friendlyName: "PLIIz Height + THX U2/S2 Games"
		},
		{	modeName: '!1LMD9A',
	 		friendlyName: "Neo:X Game"
		},
		{	modeName: '!1LMDA0',
	 		friendlyName: "PLIIx/PLII Movie + Audyssey DSX"
		},
		{	modeName: '!1LMDA1',
	 		friendlyName: "PLIIx/PLII Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA2',
	 		friendlyName: "PLIIx/PLII Game + Audyssey DSX"
		},
		{	modeName: '!1LMDA3',
	 		friendlyName: "Neo:6 Cinema + Audyssey DSX"
		},
		{	modeName: '!1LMDA4',
	 		friendlyName: "Neo:6 Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA5',
	 		friendlyName: "Neural Surround + Audyssey DSX"
		},
		{	modeName: '!1LMDA6',
	 		friendlyName: "Neural Digital Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA7',
	 		friendlyName: "Dolby EX + Audyssey DSX"
		}
];

module.exports.pair = function (socket) {
	
	socket.on('start', function(data, callback) {

        // fire the callback (you can only do this once)
        // ( err, result )
        callback( null, 'Started!' );
		
		var net = require('net');
		var self, eiscp, send_queue,
	    dgram = require('dgram'),
	    util = require('util'),
	    events = require('events'),
	    config = { port: 60128, reconnect: true, reconnect_sleep: 5, modelsets: [], send_delay: 500, verify_commands: true };
	    
	    module.exports = self = new events.EventEmitter();
			
		Homey.log('__DISCOVERY STARTED__');
	    /*
	      discover([options, ] callback)
	      Sends broadcast and waits for response callback called when number of devices or timeout reached
	      option.devices    - stop listening after this amount of devices have answered (default: 1)
	      option.timeout    - time in seconds to wait for devices to respond (default: 10)
	      option.address    - broadcast address to send magic packet to (default: 255.255.255.255)
	      option.port       - receiver port should always be 60128 this is just available if you need it
	    */
	    var callback, timeout_timer,
	        options = {},
	        client = dgram.createSocket('udp4'),
	        argv = Array.prototype.slice.call(arguments),
	        argc = argv.length;
	
	    if (argc === 1 && typeof argv[0] === 'function') {
	        callback = argv[0];
	    } else if (argc === 2 && typeof argv[1] === 'function') {
	        options = argv[0];
	        callback = argv[1];
	    } else {
	        return;
	    }
	
	    options.devices = options.devices || 1;
	    options.timeout = options.timeout || 10;
	    options.address = options.address || '255.255.255.255';
	    options.port = options.port || 60128;
	
	    function close() {
		    Homey.log('__DISCOVERY ENDED__');
	        client.close();
	        callback (null, result);
	        socket.emit('done', result);
	    }
	
	    client
		.on('error', function (err) {
	        
	        Homey.log(util.format("Server error on %s:%s - %s", options.address, options.port, err));
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
	            if(typeof devices[data[3].slice(0, 12)] === 'undefined' || typeof devices[data[3].slice(0, 12)].settings === 'undefined') {
		            result.push({
		                host:     rinfo.address,
		                port:     data[1],
		                model:    data[0],
		                mac:      data[3].slice(0, 12), // There's lots of null chars after MAC so we slice them off
		                areacode: data[2]
		            });
		            
		            Homey.log(util.format("Received discovery packet from %s:%s (%j)", rinfo.address, rinfo.port, result));
	            
					socket.emit ('fill', result);
					
					if (result.length >= options.devices) {
		                clearTimeout(timeout_timer);
		                close();
		                
		                callback (null, result);
		                
		            }
	            
	            } else {
				
					Homey.log('device with MAC-address ' + data[3].slice(0, 12) + ' already exists on the system');		            
		            
	            }

				

	        } else {
	            Homey.log(util.format("Received data from %s:%s - %j", rinfo.address, rinfo.port, message));
	        }
	    })
		.on('listening', function () {
	        client.setBroadcast(true);
	        var buffer = eiscp_packet('!xECNQSTN');
	        
	        Homey.log(util.format("Sent broadcast discovery packet to %s:%s", options.address, options.port));
	        client.send(buffer, 0, buffer.length, options.port, options.address);
	        timeout_timer = setTimeout(close, options.timeout * 1000);
	    })
	    .bind(0);
	});
	
	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {
		
		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		tempName = data.name;
		Homey.log ( "Onkyo receiver app - got get_devices from front-end, tempIP = " + tempIP + " & name = " + tempName );
		
		// assume IP is OK and continue
		socket.emit ('continue', null);

	});
	
	socket.on('manual_add', function (device) {
		
		Homey.log('manual pairing: device added', device);
    	
		devices[device.data.id] = {
        	id: device.data.id,
			name: device.name,
			settings: {
				ipaddress: device.settings.ipaddress
            },
            capabilities: [
	        	'onoff',
	        	'volume_set'
	        ]
        }
        
        Homey.log('devices=' + JSON.stringify(devices));		
		
	});
	
	socket.on('add_device', function (device, callback) {
    	Homey.log('pairing: device added', device);
    	
		devices[device.data.id] = {
        	id: device.data.id,
			name: device.name,
			settings: {
				ipaddress: device.settings.ipaddress
            },
            capabilities: [
	        	'onoff',
	        	'volume_set'
	        ]
        }
        
        Homey.log('devices=' + JSON.stringify(devices));
		
		callback(null);
    
    });
    
    socket.on('list_devices', function( data, callback ){
        
        var new_devices = [];
        Homey.log ('list_devices got ' + JSON.stringify(result));

		result.forEach(function initdevice(device) {
	    
	    	new_devices = [
                {
                    name: device.model,
                    data: {
                        id: device.mac
                    },
                    settings: {
                    	"ipaddress": device.host
                	},
                	capabilities: [
						'onoff',
						'volume_set'
					]

                }
            ]
        });
		
		Homey.log('new_devices = ' + JSON.stringify(new_devices));
        
        callback(null, new_devices);

    });

	socket.on('disconnect', function(){
		Homey.log("Onkyo receiver app - User aborted pairing, or pairing is finished");
	});
}	
	
// flow action handlers
Homey.manager('flow').on('action.powerOn', function (callback, args) {
	sendCommand ('!1PWR01', devices[args.device.id].settings.ipaddress, callback, '!1PWR01');
});

Homey.manager('flow').on('action.powerOff', function (callback, args) {
	sendCommand ('!1PWR00', devices[args.device.id].settings.ipaddress, callback, '!1PWR00');
});

Homey.manager('flow').on('action.changeInput', function (callback, args) {
	sendCommand (args.input.inputName, devices[args.device.id].settings.ipaddress, callback, args.input.inputName);
});

Homey.manager('flow').on('action.changeInput.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValue( inputSearchString );
	callback(null, items);
});

Homey.manager('flow').on('action.changeListenmode', function (callback, args) {
	sendCommand (args.listenmode.modeName, devices[args.device.id].settings.ipaddress, callback, args.listenmode.modeName);
});

Homey.manager('flow').on('action.changeListenmode.listenmode.autocomplete', function (callback, value) {
	var modeSearchString = value.query;
	var items = searchForListenmodesByValue(modeSearchString);
	callback(null, items);
});

Homey.manager('flow').on('action.mute', function (callback, args){
	sendCommand ('!1AMT01', devices[args.device.id].settings.ipaddress, callback, '!1AMT01');
});

Homey.manager('flow').on('action.unMute', function (callback, args){
	sendCommand ('!1AMT00', devices[args.device.id].settings.ipaddress, callback, '!1AMT00');
});

Homey.manager('flow').on('action.setVolume', function (callback, args){
	var targetVolume = args.volume;
	
	if (targetVolume > 100) {
		
		Homey.log ('Target Volume (' + targetVolume + ') is too high (> 100)');
		callback ('Target Volume (' + targetVolume + ') is too high (> 100)', false);
		
	}
	
	Homey.log ('target volume=' + targetVolume);
	var hexVolume = targetVolume.toString(16).toUpperCase();
	
	if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
	
	Homey.log ('target volume in HEX=' + hexVolume);
	sendCommand ('!1MVL' + hexVolume, devices[args.device.id].settings.ipaddress, callback, '!1MVL' + hexVolume);
});

Homey.manager('flow').on('action.volumeDown', function (callback, args) {
	sendCommand ('!1MVLDOWN', devices[args.device.id].settings.ipaddress, callback, '!1MVLDOWN');
});
Homey.manager('flow').on('action.volumeUp', function (callback, args) {
	sendCommand ('!1MVLUP', devices[args.device.id].settings.ipaddress, callback, '!1MVLUP');
});

Homey.manager('flow').on('action.setPreset', function (callback, args) {
	
	var preset = args.preset;
	
	Homey.log ('Set Preset to=' + preset);
	var hexPreset = preset.toString(16).toUpperCase();
	
	if (hexPreset.length < 2) hexPreset = '0' + hexPreset;
	
	sendCommand ('!1PRS' + hexPreset, devices[args.device.id].settings.ipaddress, callback, '!1PRS' + hexPreset);
});

// CONDITIONS
Homey.manager('flow').on('condition.receiverOn', function (callback, args) {
	sendCommand ('!1PWRQSTN', devices[args.device.id].settings.ipaddress, callback, '!1PWR01');
});

Homey.manager('flow').on('condition.muted', function (callback, args) {
	sendCommand ('!1AMTQSTN', devices[args.device.id].settings.ipaddress, callback, '!1AMT01');
});

Homey.manager('flow').on('condition.inputselected', function (callback, args) {
	sendCommand ('!1SLIQSTN', devices[args.device.id].settings.ipaddress, callback, args.input.inputName);
});

Homey.manager('flow').on('condition.inputselected.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValue( inputSearchString );
	callback(null, items);
});
//

function sendCommand (cmd, hostIP, callback, substring) {

	Homey.log ("Onkyo receiver app - sending " + cmd + " to " + hostIP);
	
	var client = new net.Socket();
	
	//if we require an answer, listen for an answer
	if (substring) {
		
		client.on('data', function(data) {
			
			var test = data.toString();
			
			if (test.indexOf('!1NLSC-P') < 0) {
				
				Homey.log ('[' + substring + '] checking if ' + data + ' contains ' + substring);
				
				if (substring == 'return' && test.indexOf('!1MVL') >= 0) {
					
					var vol = test.split('!1MVL');
					callback(vol[1].substring(0,2));
					client.destroy();
					
				} else if (substring != 'return') {
					
					if (test.indexOf(substring) >= 0) {
						
						client.destroy();
						Homey.log ('[' + substring + ' ] callback true');
						callback (null, true);
						
					} else {
						
						client.destroy();
						Homey.log ('[' + substring + ' ] callback false');
						callback (null, false);
						
					}
					
				}
				
			} else {
				
				Homey.log('[DUMP]' + test);
			}
			
		});
	
	}
	
	client.on('error', function(err){
	    Homey.log("Error: "+err.message);
	    callback (err.message, false);
	})
	
	client.connect(60128, hostIP, function() {
	
		var line = eiscp_packet(cmd);
			
		client.write(line);
			
	});			

}


function eiscp_packet (cmd) {
	
	var cmdLength=cmd.length+1; 
	var code=String.fromCharCode(cmdLength);
	var line="ISCP\x00\x00\x00\x10\x00\x00\x00"+code+"\x01\x00\x00\x00"+cmd+"\x0D";
	
	return line;
}

function eiscp_packet_extract(packet) {
    return packet.toString('ascii', 18, packet.length - 3);
}

function searchForListenmodesByValue ( value ) {
	var possibleListenmodes = allPossibleListenmodes;
	var tempItems = [];
	for (var i = 0; i < possibleListenmodes.length; i++) {
		var tempMode = possibleListenmodes[i];
		if ( tempMode.friendlyName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ) {
			tempItems.push({ icon: "", name: tempMode.friendlyName, modeName: tempMode.modeName });
		}
	}
	return tempItems;
}

function searchForInputsByValue ( value ) {
	var possibleInputs = allPossibleInputs;
	var tempItems = [];
	for (var i = 0; i < possibleInputs.length; i++) {
		var tempInput = possibleInputs[i];
		if ( tempInput.friendlyName.toLowerCase().indexOf(value.toLowerCase()) >= 0 ) {
			tempItems.push({ icon: "", name: tempInput.friendlyName, inputName: tempInput.inputName });
		}
	}
	return tempItems;
}