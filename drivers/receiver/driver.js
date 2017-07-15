"use strict";

var net = require('net');
var tempIP = '';
var tempName = '';
var cmdclient = {};
var devices = {};
var result = [];
var callbacklog = {};

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

function startsocket(settings) {
	
	Homey.log ('lets start polling ... ' + JSON.stringify (settings));
	
	cmdclient[settings.ipaddress] = new net.Socket();
	cmdclient[settings.ipaddress].connect(60128, settings.ipaddress);
	
	cmdclient[settings.ipaddress].on('error', function(err){
	    Homey.log("Error: "+err.message);
	    //callback (err.message, false);
	});
	
	cmdclient[settings.ipaddress].on('data', function(data) {
	
		if (typeof data !== 'undefined') {
			//cleanup command response from Onkyo
			var test = data.toString();
			test = test.split('!');
			test = JSON.stringify(test[1]);
			
			if (typeof test !== 'undefined') {
				test = test.split("\\u");
				test = test[0].substring(1);
				Homey.log('DATA: ' + test);
			}
			
			//Filter out 1NLSC-P requests
			if (test != '1NLSC-P' && test != '') {
				
				Homey.log('[callbacklog] ' + JSON.stringify(callbacklog));
				
				if (typeof test !== 'undefined' && typeof callbacklog[settings.ipaddress] !== 'undefined' && typeof callbacklog[settings.ipaddress][test.substring(0,4)] == 'function') {
					
					Homey.log('CALL THE BACK FOR ' + test);
					
					callbacklog[settings.ipaddress][test.substring(0,4)](test);
					
					callbacklog[settings.ipaddress][test.substring(0,4)]= [];
					
				} else {
					
					Homey.log('DONT CALL ' + test + ' / ' + callbacklog);
					
					if (typeof test !== 'undefined') {
					
						var triggertest = test.substring (0,4);
						
						if (triggertest == '1MVL') {
							
							var hex = test.substr (4,2);
							var volume = parseInt(hex, 16);
							Homey.log('vol='+volume);
							Homey.manager('flow').triggerDevice('volumeChanged', {
								volume: volume
							}, {device: settings.device_id});
							
						} else if (triggertest == '1PWR') {
							
							if (test == '1PWR01') {
								Homey.log('trigger ON for ' + settings.device_id);
								Homey.manager('flow').triggerDevice('receiverOn', {device: settings.device_id});
							} else {
								Homey.log('trigger OFF for ' + settings.device_id);
								Homey.manager('flow').triggerDevice('receiverOff', {device: settings.device_id});
							}
							
						} else if (triggertest == '1SLI') {
							
							allPossibleInputs.forEach( function(input) {
								
								if (input.inputName == '!' + test) {
									
									Homey.log ('SELECTED = ' + input.friendlyName);
									Homey.manager('flow').triggerDevice('inputChanged', {input: input.friendlyName}, {device: settings.device_id});
								
								}
								
							});
						}
					
					}
					
				}
				
			}
		
		}
						
	});

}

module.exports.init = function(devices_data, callback) {
    
    devices_data.forEach(function initdevice(device) {
	    
	    Homey.log('add device: ' + JSON.stringify(device));
	    
	    devices[device.id] = device;
	    
	    
	    module.exports.getSettings(device, function(err, settings){
		    devices[device.id].settings = settings;
		    
		    startsocket (settings, device.id);	
			callbacklog[settings.ipaddress] = {};
	
		});
		
	});
	
	Homey.log("Onkyo app - init done");
	
	callback (null, true);
};

module.exports.deleted = function( device_data ) {
    
    Homey.log('deleted: ' + JSON.stringify(device_data));
    
    /*cmdclient[devices[device_data.id].settings.ipaddress].close();*/
    
    devices[device_data.id] = [];
	
};

// CAPABILITIES
module.exports.capabilities = {
    onoff: {

        get: function( device_data, callback ){

			if (typeof devices[device_data.id] === "undefined") {
				
				callback (null, false);
				
			} else {
			
				Homey.log('Getting device_status of ' + devices[device_data.id].settings.ipaddress);
	            sendCommand ('!1PWRQSTN', devices[device_data.id].settings.ipaddress, function (result) {
		            
		            if (result == '1PWR01') callback (null, true); else callback (null, false);
		            
		        }, '1PWR');
            
            }
        },

        set: function( device_data, turnon, callback ) {
	        
	        Homey.log('Setting device_status of ' + devices[device_data.id].settings.ipaddress + ' to ' + turnon);

			if (turnon) {
				
				sendCommand ('!1PWR01', devices[device_data.id].settings.ipaddress, function (result) {
				
					if (result == '1PWR01') callback (null, true); else callback (null, false);
					
				}, '1PWR');
				
			} else {
				
				sendCommand ('!1PWR00', devices[device_data.id].settings.ipaddress, function (result) {
				
					if (result == '1PWR00') callback (null, true); else callback (null, false);	
					
				}, '1PWR');
				
			}

        }
    },
    volume_set: {

        get: function( device_data, callback ){

			Homey.log('Getting volume of ' + devices[device_data.id].settings.ipaddress);
            sendCommand ('!1MVLQSTN', devices[device_data.id].settings.ipaddress, function (hex) {
	         
	         	var maxVolume = 80;
	         	
	         	var hex = hex.replace('1MVL','');
	         	Homey.log('[HEX]' + hex +'[/HEX]');
	         	var volume = parseInt(hex, 16);
	         	volume = Math.round(volume / maxVolume * 100);
	         	volume = volume / 100;
	         	Homey.log('[VOLUME] ' + volume);
	         	callback (null, volume);
	            
	        }, '1MVL');
            
        },

        set: function( device_data, volume, callback ) {
	        
	        Homey.log('Setting volume of ' + devices[device_data.id].settings.ipaddress + ' to ' + volume);
	        
	        var maxVolume = 80;
	        
	        volume = Math.round(volume * maxVolume);
	        var hexVolume = volume.toString(16).toUpperCase();
	
			if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
			
			Homey.log ('target volume in HEX=' + hexVolume);
			sendCommand ('!1MVL' + hexVolume, devices[device_data.id].settings.ipaddress, function (result) {
				
				if (result == '1MVL' + hexVolume) callback (null, true); else callback (null, false);
				
			}, '1MVL');
			
        }
    },
    changeInput: {
	    get: function (device_data, callback) {
		    
		    Homey.log('get Input');
		    
		    sendCommand ('!1SLIQSTN', devices[device_data.id].settings.ipaddress, function (input) {
	         	var channel = '!' + input;
	         	Homey.log('RETURNED input = ' + channel);
	         	//module.exports.realtime(device_data.id, 'changeInput', channel)
	         	callback (null, channel);
	            
	        }, '1SLI');
		    
	    },
	    
	    set: function (device_data, input, callback) {
		    
		    Homey.log ('set input: ' + JSON.stringify (input));
		    
		    sendCommand (input, devices[device_data.id].settings.ipaddress, function (result) {
	
				Homey.log('result: ' + result + ' VS ' + input.substring(1));
				//if (result === input.substring(1)) Homey.log('equal'); else Homey.log('NOT equal');	
				if (result === input.substring(1)) callback (null, true); else callback (null, false);	
		
			}, input.substring(1));
	
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
		{	inputName: '!1SLI11',
			friendlyName: "STRM BOX"
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
			friendlyName: "CD"
		},
		{	inputName: '!1SLI22',
	 		friendlyName: "Phono"
		},
		{	inputName: '!1SLI12',
			friendlyName: "TV"
		},
		{	inputName: '!1SLI24',
	 		friendlyName: "Tuner"
		},
		{	inputName: '!1SLI2B',
	 		friendlyName: "Net"
		},
		{	inputName: '!1SLI29',
	 		friendlyName: "USB"
		},
		{	inputName: '1SLI2E',
	 		friendlyName: "BLUETOOTH"
		},
		
		{	inputName: '!1SLZ10',
	 		friendlyName: "Zone 2 BluRay/DVD player"
		},
		{	inputName: '!1SLZ00',
	 		friendlyName: "Zone 2 VCR/DVR"
		},
		{	inputName: '!1SLZ01',
	 		friendlyName: "Zone 2 Cable/Sat TV"
		},
		{	inputName: '!1SLZ11',
			friendlyName: "Zone 2 STRM BOX"
		},
		{	inputName: '!1SLZ05',
	 		friendlyName: "Zone 2 PC"
		},
		{	inputName: '!1SLZ02',
	 		friendlyName: "Zone 2 Game"
		},
		{	inputName: '!1SLZ03',
			friendlyName: "Zone 2 Aux"
		},
		{	inputName: '!1SLZ23',
			friendlyName: "Zone 2 CD"
		},
		{	inputName: '!1SLZ22',
	 		friendlyName: "Zone 2 Phono"
		},
		{	inputName: '!1SLZ12',
			friendlyName: "Zone 2 TV"
		},
		{	inputName: '!1SLZ24',
	 		friendlyName: "Zone 2 Tuner"
		},
		{	inputName: '!1SLZ2B',
	 		friendlyName: "Zone 2 Net"
		},
		{	inputName: '!1SLZ29',
	 		friendlyName: "Zone 2 USB"
		},
		{	inputName: '1SLZ2E',
	 		friendlyName: "Zone 2 BLUETOOTH"
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
		},
		
		{	modeName: '!1LMZ00',
	 		friendlyName: "Zone 2 Stereo"
		},
		{	modeName: '!1LMZ00',
	 		friendlyName: "Zone 2 Direct"
		},
		{	modeName: '!1LMZ02',
	 		friendlyName: "Zone 2 Surround"
		},
		{	modeName: '!1LMZ03',
	 		friendlyName: "Zone 2 Film"
		},
		{	modeName: '!1LMZ04',
	 		friendlyName: "Zone 2 THX"
		},
		{	modeName: '!1LMZ05',
			friendlyName: "Zone 2 Action"
		},
		{	modeName: '!1LMZ06',
			friendlyName: "Zone 2 Musical"
		},
		{	modeName: '!1LMZ07',
	 		friendlyName: "Zone 2 Mono movie"
		},
		{	modeName: '!1LMZ08',
	 		friendlyName: "Zone 2 Orchestra"
		},
		{	modeName: '!1LMZ09',
	 		friendlyName: "Zone 2 Unplugged"
		},
		{	modeName: '!1LMZ09',
	 		friendlyName: "Zone 2 Studio/Mix"
		},
		{	modeName: '!1LMZ0B',
	 		friendlyName: "Zone 2 TV Logic"
		},
		{	modeName: '!1LMZ0C',
	 		friendlyName: "Zone 2 All channels stereo"
		},
		{	modeName: '!1LMZ0D',
	 		friendlyName: "Zone 2 Theater-dimensional"
		},
		{	modeName: '!1LMZ0E',
	 		friendlyName: "Zone 2 Enhanced"
		},
		{	modeName: '!1LMZ0F',
	 		friendlyName: "Zone 2 Mono"
		},
		{	modeName: '!1LMZ11',
	 		friendlyName: "Zone 2 Pure audio"
		},
		{	modeName: '!1LMZ12',
	 		friendlyName: "Zone 2 Multiplex"
		},
		{	modeName: '!1LMZ13',
	 		friendlyName: "Zone 2 Full mono"
		},
		{	modeName: '!1LMZ14',
	 		friendlyName: "Zone 2 Dolby Virtual"
		},
		{	modeName: '!1LMZ15',
	 		friendlyName: "Zone 2 DTS Surround Sensation"
		},
		{	modeName: '!1LMZ16',
	 		friendlyName: "Zone 2 Audyssey DSX"
		},
		{	modeName: '!1LMZ1F',
	 		friendlyName: "Zone 2 Whole House Mode"
		},
		{	modeName: '!1LMZ40',
	 		friendlyName: "Zone 2 5.1ch Surround"
		},
		{	modeName: '!1LMZ41',
	 		friendlyName: "Zone 2 Dolby EX/DTS ES"
		},
		{	modeName: '!1LMZ42',
	 		friendlyName: "Zone 2 THX Cinema"
		},
		{	modeName: '!1LMZ43',
	 		friendlyName: "Zone 2 THX Surround EX"
		},
		{	modeName: '!1LMZ44',
	 		friendlyName: "Zone 2 THX Music"
		},
		{	modeName: '!1LMZ45',
	 		friendlyName: "Zone 2 THX Games"
		},
		{	modeName: '!1LMZ50',
	 		friendlyName: "Zone 2 THX U2/S2/I/S Cinema/Cinema2"
		},
		{	modeName: '!1LMZ51',
	 		friendlyName: "Zone 2 THX MusicMode,THX U2/S2/I/S Music"
		},
		{	modeName: '!1LMZ52',
	 		friendlyName: "Zone 2 THX Games Mode,THX U2/S2/I/S Games"
		},
		{	modeName: '!1LMZ80',
	 		friendlyName: "Zone 2 PLII/PLIIx Movie"
		},
		{	modeName: '!1LMZ81',
	 		friendlyName: "Zone 2 PLII/PLIIx Music"
		},
		{	modeName: '!1LMZ82',
	 		friendlyName: "Zone 2 Neo:6 Cinema/Neo:X Cinema"
		},
		{	modeName: '!1LMZ83',
	 		friendlyName: "Zone 2 Neo:6 Music/Neo:X Music"
		},
		{	modeName: '!1LMZ84',
	 		friendlyName: "Zone 2 PLII/PLIIx THX Cinema"
		},
		{	modeName: '!1LMZ85',
	 		friendlyName: "Zone 2 Neo:6/Neo:X THX Cinema"
		},
		{	modeName: '!1LMZ86',
	 		friendlyName: "Zone 2 PLII/PLIIx Game"
		},
		{	modeName: '!1LMZ88',
	 		friendlyName: "Zone 2 Neural THX/Neural Surround"
		},
		{	modeName: '!1LMZ89',
	 		friendlyName: "Zone 2 PLII/PLIIx THX Games"
		},
		{	modeName: '!1LMZ8A',
	 		friendlyName: "Zone 2 Neo:6/Neo:X THX Games"
		},
		{	modeName: '!1LMZ8B',
	 		friendlyName: "Zone 2 PLII/PLIIx THX Music"
		},
		{	modeName: '!1LMZ8C',
	 		friendlyName: "Zone 2 Neo:6/Neo:X THX Music"
		},
		{	modeName: '!1LMZ8D',
	 		friendlyName: "Zone 2 Neural THX Cinema"
		},
		{	modeName: '!1LMZ8E',
	 		friendlyName: "Zone 2 Neural THX Music"
		},
		{	modeName: '!1LMZ8F',
	 		friendlyName: "Zone 2 Neural THX Games"
		},
		{	modeName: '!1LMZ90',
	 		friendlyName: "Zone 2 PLIIz Height"
		},
		{	modeName: '!1LMZ91',
	 		friendlyName: "Zone 2 Neo:6 Cinema DTS Surround Sensation"
		},
		{	modeName: '!1LMZ92',
	 		friendlyName: "Zone 2 Neo:6 Music DTS Surround Sensation"
		},
		{	modeName: '!1LMZ93',
	 		friendlyName: "Zone 2 Neural Digital Music"
		},
		{	modeName: '!1LMZ94',
	 		friendlyName: "Zone 2 PLIIz Height + THX Cinema"
		},
		{	modeName: '!1LMZ95',
	 		friendlyName: "Zone 2 PLIIz Height + THX Music"
		},
		{	modeName: '!1LMZ96',
	 		friendlyName: "Zone 2 PLIIz Height + THX Games"
		},
		{	modeName: '!1LMZ97',
	 		friendlyName: "Zone 2 PLIIz Height + THX U2/S2 Cinema"
		},
		{	modeName: '!1LMZ98',
	 		friendlyName: "Zone 2 PLIIz Height + THX U2/S2 Music"
		},
		{	modeName: '!1LMZ99',
	 		friendlyName: "Zone 2 PLIIz Height + THX U2/S2 Games"
		},
		{	modeName: '!1LMZ9A',
	 		friendlyName: "Zone 2 Neo:X Game"
		},
		{	modeName: '!1LMZA0',
	 		friendlyName: "Zone 2 PLIIx/PLII Movie + Audyssey DSX"
		},
		{	modeName: '!1LMZA1',
	 		friendlyName: "Zone 2 PLIIx/PLII Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA2',
	 		friendlyName: "Zone 2 PLIIx/PLII Game + Audyssey DSX"
		},
		{	modeName: '!1LMZA3',
	 		friendlyName: "Zone 2 Neo:6 Cinema + Audyssey DSX"
		},
		{	modeName: '!1LMZA4',
	 		friendlyName: "Zone 2 Neo:6 Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA5',
	 		friendlyName: "Zone 2 Neural Surround + Audyssey DSX"
		},
		{	modeName: '!1LMZA6',
	 		friendlyName: "Zone 2 Neural Digital Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA7',
	 		friendlyName: "Zone 2 Dolby EX + Audyssey DSX"
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
            }
        }
        
        callbacklog[device.settings.ipaddress] = [];
        
        startsocket({ipaddress: device.settings.ipaddress, device_id: device.data.id});
        
        Homey.log('devices=' + JSON.stringify(devices));		
		
	});
	
	socket.on('add_device', function (device, callback) {
    	Homey.log('pairing: device added', device);
    	
		devices[device.data.id] = {
        	id: device.data.id,
			name: device.name,
			settings: {
				ipaddress: device.settings.ipaddress
            }
        }
        
        startsocket ({ipaddress: device.settings.ipaddress, device_id: device.data.id});	
        
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
                	}

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

Homey.on('unload', function(){
	//client.destroy();
});

// flow action handlers
Homey.manager('flow').on('action.powerOn', function (callback, args) {
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZPW01', devices[args.device.id].settings.ipaddress, function (result) {
			
			if (result == '1ZPW01') callback (null, true); else callback (null, false);
			
		}, '1ZPW');
		
	} else {
		
		sendCommand ('!1PWR01', devices[args.device.id].settings.ipaddress, function (result) {
		
			if (result == '1PWR01') callback (null, true); else callback (null, false);
			
		}, '1PWR');
		
	}
	
});

Homey.manager('flow').on('action.powerOff', function (callback, args) {
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZPW00', devices[args.device.id].settings.ipaddress, function (result) {
			
			if (result == '1ZPW00') callback (null, true); else callback (null, false);
			
		}, '1ZPW');
		
	} else {
		
		sendCommand ('!1PWR00', devices[args.device.id].settings.ipaddress, function (result) {
			
			if (result == '1PWR00') callback (null, true); else callback (null, false);
			
		}, '1PWR');
		
	}
	
});


Homey.manager('flow').on('action.changeInput', function (callback, args) {
	sendCommand (args.input.inputName, devices[args.device.id].settings.ipaddress, function (result) {
	
		if (result == args.input.inputName.substring (1)) callback (null, true); else callback (null, false);	
		
	}, args.input.inputName.substring(1,5));
});

Homey.manager('flow').on('action.changeInput.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValue( inputSearchString );
	callback(null, items);
});

Homey.manager('flow').on('action.changeListenmode', function (callback, args) {
	sendCommand (args.listenmode.modeName, devices[args.device.id].settings.ipaddress, function (result) {
		
		if (result == args.listenmode.modeName.substring (1)) callback (null, true); else callback (null, false);	
		
	}, args.listenmode.modeName.substring(1,5));
});

Homey.manager('flow').on('action.changeListenmode.listenmode.autocomplete', function (callback, value) {
	var modeSearchString = value.query;
	var items = searchForListenmodesByValue(modeSearchString);
	callback(null, items);
});

Homey.manager('flow').on('action.mute', function (callback, args){
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZMT01', devices[args.device.id].settings.ipaddress, function (result) {
			
			if (result == '1ZMT01') callback (null, true); else callback (null, false);
			
		}, '1ZMT');
		
	} else {
		
		sendCommand ('!1AMT01', devices[args.device.id].settings.ipaddress, function (result) {
		
			if (result == '1AMT01') callback (null, true); else callback (null, false);
			
		}, '1AMT');
		
	}
});

Homey.manager('flow').on('action.unMute', function (callback, args){
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZMT00', devices[args.device.id].settings.ipaddress, function (result) {
			
			if (result == '1ZMT00') callback (null, true); else callback (null, false);
			
		}, '1ZMT');
		
	} else {
		
		sendCommand ('!1AMT00', devices[args.device.id].settings.ipaddress, function(result) {
		
			if (result == '1AMT00') callback (null, true); else callback (null, false);
			
		}, '1AMT');
		
	}
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
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZVL' + hexVolume, devices[args.device.id].settings.ipaddress, function (result) {
		
			if (result == '1ZVL' + hexVolume) callback (null, true); else callback (null, false);
			
		}, '1ZVL');
		
	} else {
		
		sendCommand ('!1MVL' + hexVolume, devices[args.device.id].settings.ipaddress, function (result) {
		
			if (result == '1MVL' + hexVolume) callback (null, true); else callback (null, false);
			
		}, '1MVL');
		
	}
});

Homey.manager('flow').on('action.volumeDown', function (callback, args) {
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZVLDOWN', devices[args.device.id].settings.ipaddress, function (result) {
			
			callback (null, true);
			
		}, '1ZVL');
		
	} else {
		
		sendCommand ('!1MVLDOWN', devices[args.device.id].settings.ipaddress, function (result) {
		
			callback (null, true);
					
		}, '1MVL');
		
	}
});
Homey.manager('flow').on('action.volumeUp', function (callback, args) {
	
	if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
		
		sendCommand ('!1ZVLDOWN', devices[args.device.id].settings.ipaddress, function (result) {
			
			callback (null, true);
			
		}, '1ZVL');
		
	} else {
		
		sendCommand ('!1MVLUP', devices[args.device.id].settings.ipaddress, function (result) {
		
			callback (null, true);
				
		}, '1MVL');
		
	}
});

Homey.manager('flow').on('action.setPreset', function (callback, args) {
	
	var preset = args.preset;
	
	Homey.log ('Set Preset to=' + preset);
	var hexPreset = preset.toString(16).toUpperCase();
	
	if (hexPreset.length < 2) hexPreset = '0' + hexPreset;
	
	sendCommand ('!1PRS' + hexPreset, devices[args.device.id].settings.ipaddress, function (result) {
	
		if (result == '1PRS' + hexPreset) callback (null, true); else callback (null, false);	
		
	}, '1PRS');
});

// CONDITIONS
Homey.manager('flow').on('condition.receiverOn', function (callback, args) {
	
	Homey.log('callback = ' + callback);
	sendCommand ('!1PWRQSTN', devices[args.device.id].settings.ipaddress, function(result) {

		if (result == '1PWR01') callback (null, true); else callback (null, false);
		
	}, '1PWR');
});

Homey.manager('flow').on('condition.muted', function (callback, args) {
	sendCommand ('!1AMTQSTN', devices[args.device.id].settings.ipaddress, function(result) {

		if (result == '1AMT01') callback (null, true); else callback (null, false);
		
	}, '1AMT');
});

Homey.manager('flow').on('condition.inputselected', function (callback, args) {
	sendCommand ('!1SLIQSTN', devices[args.device.id].settings.ipaddress, function (result) {
		
		if (result == args.input.inputName.substring(1)) callback (null, true); else callback (null, false);
		
		}, args.input.inputName.substr(1, 4));
});

Homey.manager('flow').on('condition.inputselected.input.autocomplete', function (callback, value) {
	var inputSearchString = value.query;
	var items = searchForInputsByValue( inputSearchString );
	callback(null, items);
});
//

function sendCommand (cmd, hostIP, callback, substring) {

	Homey.log('======================================================');
	Homey.log ("Onkyo receiver app - sending " + cmd + " to " + hostIP);
	
	//create a 'backlog' of callbacks. Required because the Onkyo sometimes responds in a different order
	Homey.log('[CBLOG] ' + substring + ' = ' + callback);
	
	if (typeof callbacklog[hostIP] === "undefined") callbacklog[hostIP] = [];
	callbacklog[hostIP][substring] = callback;
	
	if (typeof cmdclient[hostIP] !== 'undefined') {
		
		cmdclient[hostIP].write(eiscp_packet(cmd));
	
	} else {
		
		Homey.log ('cmdclient[' + hostIP + '] is undefined, trying to restart socket');
		
		startsocket({ipaddress: hostIP});
		
		if (typeof cmdclient[hostIP] !== 'undefined') cmdclient[hostIP].write(eiscp_packet(cmd));
	
	}
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