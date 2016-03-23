"use strict";

var net = require('net');
var tempIP = '';
var client;

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
		{
			inputName: '!1SLI24',
	 		friendlyName: "Tuner"
		},
		{	inputName: '!1SLI2B',
	 		friendlyName: "Net"
		},
		{	inputName: '!1SLI29',
	 		friendlyName: "USB"
		}
		/*,
		{	inputName: '!SLI00',
	 		friendlyName: "STRM BOX"
		},
		{	inputName: '!SLI00',
	 		friendlyName: "Bluetooth"
		}*/
];

module.exports.pair = function (socket) {
	// socket is a direct channel to the front-end

	// this method is run when Homey.emit('list_devices') is run on the front-end
	// which happens when you use the template `list_devices`
	socket.on('list_devices', function (data, callback) {

		Homey.log("Onkyo receiver app - list_devices tempIP is " + tempIP);
		
		var devices = [{
			data: {
				id			: tempIP,
				ipaddress 	: tempIP
			}
		}];

		callback (null, devices);

	});

	// this is called when the user presses save settings button in start.html
	socket.on('get_devices', function (data, callback) {

		// Set passed pair settings in variables
		tempIP = data.ipaddress;
		Homey.log ( "Onkyo receiver app - got get_devices from front-end, tempIP =" + tempIP );

		// assume IP is OK and continue
		socket.emit ('continue', null);

	});

	socket.on('disconnect', function(){
		Homey.log("Onkyo receiver app - User aborted pairing, or pairing is finished");
	})
}

// flow action handlers

Homey.manager('flow').on('action.powerOn', function( callback, args ){
	sendCommand ('!1PWR01', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.powerOff', function( callback, args ){
	sendCommand ('!1PWR00', args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.changeInput', function( callback, args ){
	sendCommand (args.input.inputName, args.device.ipaddress);
	callback(null, true); 
});

Homey.manager('flow').on('action.changeInput.input.autocomplete', function( callback, value ) {
	var inputSearchString = value.query;
	var items = searchForInputsByValue( inputSearchString );
	callback(null, items);
});

Homey.manager('flow').on('action.mute', function( callback, args ){
	sendCommand ('!1AMT01', args.device.ipaddress);
	callback( null, true ); 
});

Homey.manager('flow').on('action.unMute', function( callback, args ){
	sendCommand ('!1AMT00', args.device.ipaddress);
	callback (null, true); 
});

Homey.manager('flow').on('action.setVolume', function( callback, args ){
	var targetVolume = args.volume;
	
	if (targetVolume > 100) {
		
		Homey.log ('Target Volume (' + targetVolume + ') is too high (> 100)');
		
		callback (null, true);
		
	}
	
	Homey.log ('target volume=' + targetVolume);
	var hexVolume = targetVolume.toString(16).toUpperCase();
	
	if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
	
	Homey.log ('target volume in HEX=' + hexVolume);
	sendCommand ('!1MVL' + hexVolume, args.device.ipaddress);
	callback (null, true); 
});

Homey.manager('flow').on('action.volumeDown', function (callback, args) {
	sendCommand ('!1MVLDOWN', args.device.ipaddress);
	callback(null, true);	
});
Homey.manager('flow').on('action.volumeUp', function (callback, args) {
	sendCommand ('!1MVLUP', args.device.ipaddress);
	callback (null, true);	
});

Homey.manager('flow').on('action.setPreset', function (callback, args) {
	
	var preset = args.preset;
	
	Homey.log ('Set Preset to=' + preset);
	var hexPreset = preset.toString(16).toUpperCase();
	
	if (hexPreset.length < 2) hexPreset = '0' + hexPreset;
	
	sendCommand ('!1PRS' + hexPreset, args.device.ipaddress);
	callback (null, true);	
});

// CONDITIONS

Homey.manager('flow').on('condition.receiverOn', function( callback, args ){
	sendCommand ('!1PWRQSTN', args.device.ipaddress, callback, '!1PWR01');
	//callback (null, true); 
});


Homey.manager('flow').on('condition.receiverOff', function( callback, args ){
	sendCommand ('!1PWRQSTN', args.device.ipaddress, callback, '!1PWR00');
	//callback (null, true); 
});

Homey.manager('flow').on('condition.muted', function( callback, args ){
	sendCommand ('!1AMTQSTN', args.device.ipaddress, callback, '!1AMT01');
});

Homey.manager('flow').on('condition.notmuted', function( callback, args ){
	sendCommand ('!1AMTQSTN', args.device.ipaddress, callback, '!1AMT00');
});
//

function sendCommand (cmd, hostIP, callback, substring) {

	Homey.log ("Onkyo receiver app - sending " + cmd + " to " + hostIP);
		
	client = new net.Socket();
	
	//if we require an answer, listen for an answer
	if (substring) {
		
		client.on('data', function(data) {
			Homey.log('Received: ' + data);
			client.destroy();
			
			var test = data.toString();
			
			Homey.log ('checking if ' + data + ' contains ' + substring);
			
			if (test.indexOf(substring) >= 0) {
				
				Homey.log ('callback true');
				callback (null, true);
				
			} else {
				
				Homey.log ('callback false');
				callback (null, false);
				
			}
			
		});
	
	}
	
	client.connect(60128, hostIP, function() {
	
		var cmdLength=cmd.length+1; 
		var code=String.fromCharCode(cmdLength);
		var line="ISCP\x00\x00\x00\x10\x00\x00\x00"+code+"\x01\x00\x00\x00"+cmd+"\x0D";
			
		client.write(line);
			
	});			

}

/**
 * When a device is renamed in Homey, make sure the actual
 * label of the device is changed as well
 * @param device_data
 * @param new_name
 */
module.exports.renamed = function (device_data, new_name) {

	// Check for valid new name
	if (typeof device_data === "object" && typeof new_name === "string" && new_name !== '') {

		Homey.log ('new name: ' + new_name);
		Homey.log ('device_data: ' + device_data.id + ' / ' + device_data.ipaddress);
		/*
		// Parse new label and truncate at 32 bytes
		var label = Cutter.truncateToBinarySize(new_name, 32);

		// Get light targeted
		var light = getLight(device_data.id);
		var temp_light = getLight(device_data.id, temp_lights);

		// Store new name internally
		if (light) light.name = label;
		if (temp_light) temp_light.name = label;

		if (light) light.data.client.setLabel(label);
		*/
	}
};


function searchForInputsByValue ( value ) {
	var possibleInputs = allPossibleInputs;
	var tempItems = [];
	for (var i = 0; i < possibleInputs.length; i++) {
		var tempInput = possibleInputs[i];
		if ( tempInput.friendlyName.indexOf(value) >= 0 ) {
			tempItems.push({ icon: "", name: tempInput.friendlyName, inputName: tempInput.inputName });
		}
	}
	return tempItems;
}