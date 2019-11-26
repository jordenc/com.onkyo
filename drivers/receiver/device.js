"use strict";

const Homey = require('homey');
var net = require('net');
var cmdclient = {};
var callbacklog = {};
var device_data;
var driver;
let device = this;

let allPossibleInputs = [
		{	id: '!1SLI10',
	 		name: "BluRay/DVD player"
		},
		{	id: '!1SLI00',
	 		name: "VCR/DVR"
		},
		{	id: '!1SLI01',
	 		name: "Cable/Sat TV"
		},
		{	id: '!1SLI11',
			name: "STRM BOX"
		},
		{	id: '!1SLI05',
	 		name: "PC"
		},
		{	id: '!1SLI02',
	 		name: "Game"
		},
		{	id: '!1SLI03',
			name: "Aux"
		},
		{	id: '!1SLI23',
			name: "CD"
		},
		{	id: '!1SLI20',
	 		name: "Tape"
		},
		{	id: '!1SLI22',
	 		name: "Phono"
		},
		{	id: '!1SLI12',
			name: "TV"
		},
		{	id: '!1SLI24',
	 		name: "Tuner"
		},
		{	id: '!1SLI2B',
	 		name: "Net"
		},
		{	id: '!1SLI29',
	 		name: "USB"
		},
		{	id: '1SLI2E',
	 		name: "BLUETOOTH"
		},
		{	id: '1SLI33',
	 		name: "DAB"
		},
		
		{	id: '!1SLZ10',
	 		name: "Zone 2 BluRay/DVD player"
		},
		{	id: '!1SLZ00',
	 		name: "Zone 2 VCR/DVR"
		},
		{	id: '!1SLZ01',
	 		name: "Zone 2 Cable/Sat TV"
		},
		{	id: '!1SLZ11',
			name: "Zone 2 STRM BOX"
		},
		{	id: '!1SLZ05',
	 		name: "Zone 2 PC"
		},
		{	id: '!1SLZ02',
	 		name: "Zone 2 Game"
		},
		{	id: '!1SLZ03',
			name: "Zone 2 Aux"
		},
		{	id: '!1SLZ23',
			name: "Zone 2 CD"
		},
		{	id: '!1SLZ20',
	 		name: "Zone 2 Tape"
		},
		{	id: '!1SLZ22',
	 		name: "Zone 2 Phono"
		},
		{	id: '!1SLZ12',
			name: "Zone 2 TV"
		},
		{	id: '!1SLZ24',
	 		name: "Zone 2 Tuner"
		},
		{	id: '!1SLZ2B',
	 		name: "Zone 2 Net"
		},
		{	id: '!1SLZ29',
	 		name: "Zone 2 USB"
		},
		{	id: '1SLZ2E',
	 		name: "Zone 2 BLUETOOTH"
		},
		{	id: '1SLZ33',
	 		name: "Zone 2 DAB"
		},
		
		{	id: '!1sl310',
	 		name: "Zone 3 BluRay/DVD player"
		},
		{	id: '!1sl300',
	 		name: "Zone 3 VCR/DVR"
		},
		{	id: '!1sl301',
	 		name: "Zone 3 Cable/Sat TV"
		},
		{	id: '!1sl311',
			name: "Zone 3 STRM BOX"
		},
		{	id: '!1sl305',
	 		name: "Zone 3 PC"
		},
		{	id: '!1sl302',
	 		name: "Zone 3 Game"
		},
		{	id: '!1sl303',
			name: "Zone 3 Aux"
		},
		{	id: '!1sl323',
			name: "Zone 3 CD"
		},
		{	id: '!1sl320',
	 		name: "Zone 3 Tape"
		},
		{	id: '!1sl322',
	 		name: "Zone 3 Phono"
		},
		{	id: '!1sl312',
			name: "Zone 3 TV"
		},
		{	id: '!1sl324',
	 		name: "Zone 3 Tuner"
		},
		{	id: '!1sl32B',
	 		name: "Zone 3 Net"
		},
		{	id: '!1sl329',
	 		name: "Zone 3 USB"
		},
		{	id: '1sl32E',
	 		name: "Zone 3 BLUETOOTH"
		},
		{	id: '1sl333',
	 		name: "Zone 3 DAB"
		}
];
		
let allPossibleListenmodes = [
		{	modeName: '!1LMD00',
	 		name: "Stereo"
		},
		{	modeName: '!1LMD00',
	 		name: "Direct"
		},
		{	modeName: '!1LMD02',
	 		name: "Surround"
		},
		{	modeName: '!1LMD03',
	 		name: "Film"
		},
		{	modeName: '!1LMD04',
	 		name: "THX"
		},
		{	modeName: '!1LMD05',
			name: "Action"
		},
		{	modeName: '!1LMD06',
			name: "Musical"
		},
		{	modeName: '!1LMD07',
	 		name: "Mono movie"
		},
		{	modeName: '!1LMD08',
	 		name: "Orchestra"
		},
		{	modeName: '!1LMD09',
	 		name: "Unplugged"
		},
		{	modeName: '!1LMD09',
	 		name: "Studio/Mix"
		},
		{	modeName: '!1LMD0B',
	 		name: "TV Logic"
		},
		{	modeName: '!1LMD0C',
	 		name: "All channels stereo"
		},
		{	modeName: '!1LMD0D',
	 		name: "Theater-dimensional"
		},
		{	modeName: '!1LMD0E',
	 		name: "Enhanced"
		},
		{	modeName: '!1LMD0F',
	 		name: "Mono"
		},
		{	modeName: '!1LMD11',
	 		name: "Pure audio"
		},
		{	modeName: '!1LMD12',
	 		name: "Multiplex"
		},
		{	modeName: '!1LMD13',
	 		name: "Full mono"
		},
		{	modeName: '!1LMD14',
	 		name: "Dolby Virtual"
		},
		{	modeName: '!1LMD15',
	 		name: "DTS Surround Sensation"
		},
		{	modeName: '!1LMD16',
	 		name: "Audyssey DSX"
		},
		{	modeName: '!1LMD1F',
	 		name: "Whole House Mode"
		},
		{	modeName: '!1LMD40',
	 		name: "5.1ch Surround"
		},
		{	modeName: '!1LMD41',
	 		name: "Dolby EX/DTS ES"
		},
		{	modeName: '!1LMD42',
	 		name: "THX Cinema"
		},
		{	modeName: '!1LMD43',
	 		name: "THX Surround EX"
		},
		{	modeName: '!1LMD44',
	 		name: "THX Music"
		},
		{	modeName: '!1LMD45',
	 		name: "THX Games"
		},
		{	modeName: '!1LMD50',
	 		name: "THX U2/S2/I/S Cinema/Cinema2"
		},
		{	modeName: '!1LMD51',
	 		name: "THX MusicMode,THX U2/S2/I/S Music"
		},
		{	modeName: '!1LMD52',
	 		name: "THX Games Mode,THX U2/S2/I/S Games"
		},
		{	modeName: '!1LMD80',
	 		name: "PLII/PLIIx Movie"
		},
		{	modeName: '!1LMD81',
	 		name: "PLII/PLIIx Music"
		},
		{	modeName: '!1LMD82',
	 		name: "Neo:6 Cinema/Neo:X Cinema"
		},
		{	modeName: '!1LMD83',
	 		name: "Neo:6 Music/Neo:X Music"
		},
		{	modeName: '!1LMD84',
	 		name: "PLII/PLIIx THX Cinema"
		},
		{	modeName: '!1LMD85',
	 		name: "Neo:6/Neo:X THX Cinema"
		},
		{	modeName: '!1LMD86',
	 		name: "PLII/PLIIx Game"
		},
		{	modeName: '!1LMD88',
	 		name: "Neural THX/Neural Surround"
		},
		{	modeName: '!1LMD89',
	 		name: "PLII/PLIIx THX Games"
		},
		{	modeName: '!1LMD8A',
	 		name: "Neo:6/Neo:X THX Games"
		},
		{	modeName: '!1LMD8B',
	 		name: "PLII/PLIIx THX Music"
		},
		{	modeName: '!1LMD8C',
	 		name: "Neo:6/Neo:X THX Music"
		},
		{	modeName: '!1LMD8D',
	 		name: "Neural THX Cinema"
		},
		{	modeName: '!1LMD8E',
	 		name: "Neural THX Music"
		},
		{	modeName: '!1LMD8F',
	 		name: "Neural THX Games"
		},
		{	modeName: '!1LMD90',
	 		name: "PLIIz Height"
		},
		{	modeName: '!1LMD91',
	 		name: "Neo:6 Cinema DTS Surround Sensation"
		},
		{	modeName: '!1LMD92',
	 		name: "Neo:6 Music DTS Surround Sensation"
		},
		{	modeName: '!1LMD93',
	 		name: "Neural Digital Music"
		},
		{	modeName: '!1LMD94',
	 		name: "PLIIz Height + THX Cinema"
		},
		{	modeName: '!1LMD95',
	 		name: "PLIIz Height + THX Music"
		},
		{	modeName: '!1LMD96',
	 		name: "PLIIz Height + THX Games"
		},
		{	modeName: '!1LMD97',
	 		name: "PLIIz Height + THX U2/S2 Cinema"
		},
		{	modeName: '!1LMD98',
	 		name: "PLIIz Height + THX U2/S2 Music"
		},
		{	modeName: '!1LMD99',
	 		name: "PLIIz Height + THX U2/S2 Games"
		},
		{	modeName: '!1LMD9A',
	 		name: "Neo:X Game"
		},
		{	modeName: '!1LMDA0',
	 		name: "PLIIx/PLII Movie + Audyssey DSX"
		},
		{	modeName: '!1LMDA1',
	 		name: "PLIIx/PLII Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA2',
	 		name: "PLIIx/PLII Game + Audyssey DSX"
		},
		{	modeName: '!1LMDA3',
	 		name: "Neo:6 Cinema + Audyssey DSX"
		},
		{	modeName: '!1LMDA4',
	 		name: "Neo:6 Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA5',
	 		name: "Neural Surround + Audyssey DSX"
		},
		{	modeName: '!1LMDA6',
	 		name: "Neural Digital Music + Audyssey DSX"
		},
		{	modeName: '!1LMDA7',
	 		name: "Dolby EX + Audyssey DSX"
		},
		
		{	modeName: '!1LMZ00',
	 		name: "Zone 2 Stereo"
		},
		{	modeName: '!1LMZ00',
	 		name: "Zone 2 Direct"
		},
		{	modeName: '!1LMZ02',
	 		name: "Zone 2 Surround"
		},
		{	modeName: '!1LMZ03',
	 		name: "Zone 2 Film"
		},
		{	modeName: '!1LMZ04',
	 		name: "Zone 2 THX"
		},
		{	modeName: '!1LMZ05',
			name: "Zone 2 Action"
		},
		{	modeName: '!1LMZ06',
			name: "Zone 2 Musical"
		},
		{	modeName: '!1LMZ07',
	 		name: "Zone 2 Mono movie"
		},
		{	modeName: '!1LMZ08',
	 		name: "Zone 2 Orchestra"
		},
		{	modeName: '!1LMZ09',
	 		name: "Zone 2 Unplugged"
		},
		{	modeName: '!1LMZ09',
	 		name: "Zone 2 Studio/Mix"
		},
		{	modeName: '!1LMZ0B',
	 		name: "Zone 2 TV Logic"
		},
		{	modeName: '!1LMZ0C',
	 		name: "Zone 2 All channels stereo"
		},
		{	modeName: '!1LMZ0D',
	 		name: "Zone 2 Theater-dimensional"
		},
		{	modeName: '!1LMZ0E',
	 		name: "Zone 2 Enhanced"
		},
		{	modeName: '!1LMZ0F',
	 		name: "Zone 2 Mono"
		},
		{	modeName: '!1LMZ11',
	 		name: "Zone 2 Pure audio"
		},
		{	modeName: '!1LMZ12',
	 		name: "Zone 2 Multiplex"
		},
		{	modeName: '!1LMZ13',
	 		name: "Zone 2 Full mono"
		},
		{	modeName: '!1LMZ14',
	 		name: "Zone 2 Dolby Virtual"
		},
		{	modeName: '!1LMZ15',
	 		name: "Zone 2 DTS Surround Sensation"
		},
		{	modeName: '!1LMZ16',
	 		name: "Zone 2 Audyssey DSX"
		},
		{	modeName: '!1LMZ1F',
	 		name: "Zone 2 Whole House Mode"
		},
		{	modeName: '!1LMZ40',
	 		name: "Zone 2 5.1ch Surround"
		},
		{	modeName: '!1LMZ41',
	 		name: "Zone 2 Dolby EX/DTS ES"
		},
		{	modeName: '!1LMZ42',
	 		name: "Zone 2 THX Cinema"
		},
		{	modeName: '!1LMZ43',
	 		name: "Zone 2 THX Surround EX"
		},
		{	modeName: '!1LMZ44',
	 		name: "Zone 2 THX Music"
		},
		{	modeName: '!1LMZ45',
	 		name: "Zone 2 THX Games"
		},
		{	modeName: '!1LMZ50',
	 		name: "Zone 2 THX U2/S2/I/S Cinema/Cinema2"
		},
		{	modeName: '!1LMZ51',
	 		name: "Zone 2 THX MusicMode,THX U2/S2/I/S Music"
		},
		{	modeName: '!1LMZ52',
	 		name: "Zone 2 THX Games Mode,THX U2/S2/I/S Games"
		},
		{	modeName: '!1LMZ80',
	 		name: "Zone 2 PLII/PLIIx Movie"
		},
		{	modeName: '!1LMZ81',
	 		name: "Zone 2 PLII/PLIIx Music"
		},
		{	modeName: '!1LMZ82',
	 		name: "Zone 2 Neo:6 Cinema/Neo:X Cinema"
		},
		{	modeName: '!1LMZ83',
	 		name: "Zone 2 Neo:6 Music/Neo:X Music"
		},
		{	modeName: '!1LMZ84',
	 		name: "Zone 2 PLII/PLIIx THX Cinema"
		},
		{	modeName: '!1LMZ85',
	 		name: "Zone 2 Neo:6/Neo:X THX Cinema"
		},
		{	modeName: '!1LMZ86',
	 		name: "Zone 2 PLII/PLIIx Game"
		},
		{	modeName: '!1LMZ88',
	 		name: "Zone 2 Neural THX/Neural Surround"
		},
		{	modeName: '!1LMZ89',
	 		name: "Zone 2 PLII/PLIIx THX Games"
		},
		{	modeName: '!1LMZ8A',
	 		name: "Zone 2 Neo:6/Neo:X THX Games"
		},
		{	modeName: '!1LMZ8B',
	 		name: "Zone 2 PLII/PLIIx THX Music"
		},
		{	modeName: '!1LMZ8C',
	 		name: "Zone 2 Neo:6/Neo:X THX Music"
		},
		{	modeName: '!1LMZ8D',
	 		name: "Zone 2 Neural THX Cinema"
		},
		{	modeName: '!1LMZ8E',
	 		name: "Zone 2 Neural THX Music"
		},
		{	modeName: '!1LMZ8F',
	 		name: "Zone 2 Neural THX Games"
		},
		{	modeName: '!1LMZ90',
	 		name: "Zone 2 PLIIz Height"
		},
		{	modeName: '!1LMZ91',
	 		name: "Zone 2 Neo:6 Cinema DTS Surround Sensation"
		},
		{	modeName: '!1LMZ92',
	 		name: "Zone 2 Neo:6 Music DTS Surround Sensation"
		},
		{	modeName: '!1LMZ93',
	 		name: "Zone 2 Neural Digital Music"
		},
		{	modeName: '!1LMZ94',
	 		name: "Zone 2 PLIIz Height + THX Cinema"
		},
		{	modeName: '!1LMZ95',
	 		name: "Zone 2 PLIIz Height + THX Music"
		},
		{	modeName: '!1LMZ96',
	 		name: "Zone 2 PLIIz Height + THX Games"
		},
		{	modeName: '!1LMZ97',
	 		name: "Zone 2 PLIIz Height + THX U2/S2 Cinema"
		},
		{	modeName: '!1LMZ98',
	 		name: "Zone 2 PLIIz Height + THX U2/S2 Music"
		},
		{	modeName: '!1LMZ99',
	 		name: "Zone 2 PLIIz Height + THX U2/S2 Games"
		},
		{	modeName: '!1LMZ9A',
	 		name: "Zone 2 Neo:X Game"
		},
		{	modeName: '!1LMZA0',
	 		name: "Zone 2 PLIIx/PLII Movie + Audyssey DSX"
		},
		{	modeName: '!1LMZA1',
	 		name: "Zone 2 PLIIx/PLII Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA2',
	 		name: "Zone 2 PLIIx/PLII Game + Audyssey DSX"
		},
		{	modeName: '!1LMZA3',
	 		name: "Zone 2 Neo:6 Cinema + Audyssey DSX"
		},
		{	modeName: '!1LMZA4',
	 		name: "Zone 2 Neo:6 Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA5',
	 		name: "Zone 2 Neural Surround + Audyssey DSX"
		},
		{	modeName: '!1LMZA6',
	 		name: "Zone 2 Neural Digital Music + Audyssey DSX"
		},
		{	modeName: '!1LMZA7',
	 		name: "Zone 2 Dolby EX + Audyssey DSX"
		},
		{	modeName: '!OSDENTER',
	 		name: "Enter"
		},
		{	modeName: '!OSDUP',
	 		name: "Up"
		},
		{	modeName: '!OSDDOWN',
	 		name: "Down"
		},
		{	modeName: '!OSDRIGHT',
	 		name: "Right"
		},
		{	modeName: '!OSDLEFT',
	 		name: "Left"
		},
		{	modeName: '!OSDEXIT',
	 		name: "Exit"
		},
		{	modeName: '!OSDHOME',
	 		name: "Home"
		}
		
];

class OnkyoDevice extends Homey.Device {

	onInit() {
        this.log('device init');
        this.log('name:', this.getName());
        this.log('class:', this.getClass());

        this.registerCapabilityListener('onoff', this.onCapabilityOn_off.bind(this))
        this.registerCapabilityListener('volume_set', this.onCapabilityvolumeset.bind(this))
        this.registerCapabilityListener('changeInput', this.onCapabilitychangeInput.bind(this))
		this.registerCapabilityListener('volume_mute', this.onCapabilitychangeMute.bind(this))
		this.registerCapabilityListener('volume_up', this.onCapabilitychangeUp.bind(this))
		this.registerCapabilityListener('volume_down', this.onCapabilitychangeDown.bind(this))
        
        
        device_data = this.getData();
        device = this;
        
        let settings = this.getSettings();
                
        driver = this.getDriver();
        
        this.setSettings({
		    host: device_data.host
		})
		.then( this.log )
		.catch( this.error )
        
        //Start connection:
        this.startsocket (device_data);
        
    }
    
    	
	//CAPABILITIES
	onCapabilityOn_off( turnon, value, callback ) {
        
        console.log('Setting device_status of ' + device_data.host + ' to ' + turnon);

		if (turnon) {
			
			sendCommand ('!1PWR01', device_data.host, function (result) {
			
				if (result == '1PWR01') callback (null, true); else callback (null, false);
				
			}, '1PWR');
			
		} else {
			
			sendCommand ('!1PWR00', device_data.host, function (result) {
			
				console.log ("returned result = " + JSON.stringify(result));
				if (result == '1PWR00') callback(null, true); else callback (null, false);
				
			}, '1PWR');
			
		}
			
    }

	onCapabilityvolumeset( volume, value, callback ) {
		
		volume = parseInt(volume);
				
		console.log('Setting volume of ' + device_data.host + ' to ' + volume);
	    
        var hexVolume = volume.toString(16).toUpperCase();

		if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
		
		console.log ('target volume in HEX=' + hexVolume);
		sendCommand ('!1MVL' + hexVolume, device_data.host, function (result) {
			
			if (result == '1MVL' + hexVolume) callback(null, true); else callback (null, false);
			
		}, '1MVL');
			
    }
    
    onCapabilitychangeInput( input, value, callback ) {

		console.log ('SET INPUT : ' + JSON.stringify (input));
		    
		    sendCommand (input, device_data.host, function (result) {
	
				console.log('result: ' + result + ' VS ' + input.substring(1));
				if (result === input.substring(1)) callback(null, true); else callback (null, false);
		
			}, input.substring(1));


    }
	
	
	onCapabilitychangeMute( mute, value, callback ) {
        
        console.log('Setting device_status of ' + device_data.host + ' to ' + mute);

		if (mute) {
			
			sendCommand ('!1AMT01', device_data.host, function (result) {
			
				if (result == '1AMT01') callback (null, true); else callback (null, false);
				
			}, '1AMT');
			
		} else {
			
			sendCommand ('!1AMT00', device_data.host, function (result) {
			
				console.log ("returned result = " + JSON.stringify(result));
				if (result == '1AMT00') callback(null, true); else callback (null, false);
				
			}, '1AMT00');
					
		}
			
    }
	
	onCapabilitychangeUp( volup, value, callback ) {
        
        console.log('Sending Volume+1');

				sendCommand ('!1MVLUP', device_data.host, function (result) {
			
				if (result == '1MVLUP') callback (null, true); else callback (null, false);
				
			}, '1MVL');
			
    }
	
	onCapabilitychangeDown( voldown, value, callback ) {
        
        console.log('Sending Volume-1');

			sendCommand ('!1MVLDOWN', device_data.host, function (result) {
			
			if (result == '1MVLDOWN') callback (null, true); else callback (null, false);
				
			}, '1MVL');
			
    }
	
	onAdded() {
        this.log('device added');
        var device_data = this.getData();
		this.startsocket (device_data);
        }
	
	onAdded() {
		
        this.log('device added');
        
        var device_data = this.getData();

		this.startsocket (device_data);
        
    }

    // this method is called when the Device is deleted
    onDeleted() {
	    
        this.log('device deleted');
		cmdclient[device_data.host].destroy();
		
    }
    
    onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
	    
	    cmdclient[device_data.host].destroy();
	    
	    try {
	      changedKeysArr.forEach(function (key) {
	        
	        device_data[key] = newSettingsObj[key];
	        
	        console.log ("setting " + key + " to " + newSettingsObj[key]);
	      
	      })
	      			
		  device.startsocket (device_data);
			
	      callback(null, true);
	    
	    } catch (error) {
	    
	    	  callback(error)
	    
	    }
    
	}
	
	startsocket(settings) {
	
		console.log ('lets start polling ... ' + JSON.stringify (settings));
		
		cmdclient[settings.host] = new net.Socket();
		cmdclient[settings.host].connect(60128, settings.host);
		
		cmdclient[settings.host].on('error', function(err){
		    console.log("[socket] Error: "+err.message);
		    //callback (err.message, false);
		});
		
		cmdclient[settings.host].on('close', function(err){
		    console.log("[socket] Closed: " + JSON.stringify (err));
		    //callback (err.message, false);
		});
		
		cmdclient[settings.host].on('end', function(err){
		    console.log("[socket] Ended: " + JSON.stringify (err));
		    //callback (err.message, false);
		});
		
		cmdclient[settings.host].on('data', function(data) {
			
			
		
			if (typeof data !== 'undefined') {
				//cleanup command response from Onkyo
				var test = data.toString();
				test = test.split('!');
				test = JSON.stringify(test[1]);
				
				console.log('Received RAW EISP STRING = '+ test);
				
				if (typeof test !== 'undefined') {
					test = test.split("\\u");
					test = test[0].substring(1);
					console.log('DATA: ' + test);
				}
				
				//Filter out 1NLSC-P requests
				if (test != '1NLSC-P' && test != '') {
					
					//console.log('[callbacklog] ' + JSON.stringify(callbacklog));
					
					if (typeof test !== 'undefined' && typeof callbacklog[settings.host] !== 'undefined' && typeof callbacklog[settings.host][test.substring(0,4)] == 'function') {
						
						console.log('CALL THE BACK FOR ' + test + ' / ' + test.substring(0,4));
						
						callbacklog[settings.host][test.substring(0,4)](test);
						
						callbacklog[settings.host][test.substring(0,4)]= [];
						
					} else {
						
						//console.log('DONT CALL ' + test + ' / ' + callbacklog);
						
						if (typeof test !== 'undefined') {
						
							var trigger = test.substring (0,4);
							
							if (trigger == '1MVL') {
								
								var hex = test.substr (4,2);
								var volume = parseInt(hex, 16);
								if (volume<10) volume = '0'+volume;
								console.log('VOLUME = '+volume);
								
								let tokens = {'volume_set': volume};
								let state = {};
								
								device.setCapabilityValue('volume_set', Number(volume));
	    								
						        driver.ready(() => {
						            driver.triggervolumeChanged( device, tokens, state );
						        });
								        
							} else if (trigger == '1PWR') {
								
								if (test == '1PWR01') {
									console.log('POWER = ON');
									device.setCapabilityValue('onoff', true);
									
							        let tokens = {};
									let state = {};
	        
									driver.ready(() => {
							            driver.triggerreceiverOn( device, tokens, state );
							        });
									
									//send commmand to receive the correct input
									sendCommand ('!1SLIQSTN', device_data.host);
									//send commmand to receive the correct volume
									sendCommand ('!1MVLQSTN', device_data.host);
	        
	        
								} else {
									console.log('POWER = OFF');
									device.setCapabilityValue('onoff', false);
									
							        let tokens = {};
									let state = {};
	        
									driver.ready(() => {
							            driver.triggerreceiverOff( device, tokens, state );
							        });
								}								
							} else if (trigger == '1NLT') {
								
								test = test.substring (0,4);
								
								if (test == '1NLT') {
									console.log('STREAMING MEDIA NET INPUT');
									//send commmand to check of reciver is on/off
									sendCommand ('!1PWRQSTN', device_data.host);
																	}
								} else if (trigger == '1AMT') {
																
								if (test == '1AMT01') {
									console.log('MUTE = ON');
									device.setCapabilityValue('volume_mute', true)
									
									let tokens = {};
							        let state = {};
	        
									driver.ready(() => {
							            driver.triggerreceiverMute( device, tokens, state );
							        });
	        
	        
								} else {
									console.log('MUTE = OFF');
									device.setCapabilityValue('volume_mute', false)
									
							        let tokens = {};
									let state = {};
	        
									driver.ready(() => {
							            driver.triggerreceiverunMute( device, tokens, state );
							        });
								}
								
							} else if (trigger == '1SLI') {
								
								allPossibleInputs.forEach( function(input) {
									
									if (input.id == '!' + test) {
										
										console.log ('SELECTED INPUT = ' + input.name);
										device.setCapabilityValue('changeInput', input.id);
		
								        let tokens = {};
								        let state = {};
		        
										driver.ready(() => {
								            driver.triggerinputChanged( device, tokens, state );
								        });
	    
									}
									
								});
							} 
						
						}
						
					}
					
				}
			
			}
							
		});
	
	}
}

//ACTIONS:
    let powerOn = new Homey.FlowCardAction('powerOn');
	powerOn
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZPW01', device_data.host, function (result) {
					
					if (result == '1ZPW01') callback (null, true); else callback (null, false);
					
				}, '1ZPW');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
	
				sendCommand ('!1PW301', device_data.host, function (result) {
					
					if (result == '1PW301') callback (null, true); else callback (null, false);
					
				}, '1PW3');
				
			} else {
				
				sendCommand ('!1PWR01', device_data.host, function (result) {
				
					if (result == '1PWR01') callback (null, true); else callback (null, false);
					
				}, '1PWR');
				
			}
			
		});
    
    
    let powerOff = new Homey.FlowCardAction('powerOff');
	powerOff
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZPW00', device_data.host, function (result) {
					
					if (result == '1ZPW00') callback (null, true); else callback (null, false);
					
				}, '1ZPW');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
	
				sendCommand ('!1PW300', device_data.host, function (result) {
					
					if (result == '1PW300') callback (null, true); else callback (null, false);
					
				}, '1PW3');
				
			} else {
				
				sendCommand ('!1PWR00', device_data.host, function (result) {
					
					if (result == '1PWR00') callback (null, true); else callback (null, false);
					
				}, '1PWR');
				
			}
			
		});
		
	let changeInput = new Homey.FlowCardAction('changeInput');
	changeInput
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			sendCommand (args.input.id, device_data.host, function (result) {

				if (result == args.input.id.substring (1)) callback (null, true); else callback (null, false);	
				
			}, args.input.id.substring(1,5));
			
		})
		.getArgument('input')
		.registerAutocompleteListener(( query, args ) => {
			
			let results = allPossibleInputs;

			results = results.filter( result => {
			    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
			  });
			
			return Promise.resolve( results );
			
        });
		
	let changeListenmode = new Homey.FlowCardAction('changeListenmode');
	changeListenmode
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			sendCommand (args.listenmode.modeName, device_data.host, function (result) {
	
				if (result == args.listenmode.modeName.substring (1)) callback (null, true); else callback (null, false);	
				
			}, args.listenmode.modeName.substring(1,5));
			
		})
		.getArgument('listenmode')
		.registerAutocompleteListener(( query, args ) => {
        
			let results = allPossibleListenmodes;

			results = results.filter( result => {
			    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
			  });
			
			return Promise.resolve( results );

        });
		
	let mute = new Homey.FlowCardAction('mute');
	mute
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZMT01', device_data.host, function (result) {
					
					if (result == '1ZMT01') callback (null, true); else callback (null, false);
					
				}, '1ZMT');
			
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
				
				sendCommand ('!1MT301', device_data.host, function (result) {
					
					if (result == '1MT301') callback (null, true); else callback (null, false);
					
				}, '1MT3');
				
			} else {
				
				sendCommand ('!1AMT01', device_data.host, function (result) {
				
					if (result == '1AMT01') callback (null, true); else callback (null, false);
					
				}, '1AMT');

								
			}
			
		});
		
		
	let sendCustomCommand = new Homey.FlowCardAction('sendCustomCommand');
	sendCustomCommand
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			sendCommand (args.command, device_data.host, function (result) {
				
				callback (null, true);
					
			}, '0000');
			
		});
	
	let Reconnect = new Homey.FlowCardAction('Reconnect');
	Reconnect
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("Destroying socket for = " + JSON.stringify (args));
			
			cmdclient[device_data.host].destroy();
			
			device.startsocket (device_data);
			
			callback (null, true)
			
		});
		
	let unMute = new Homey.FlowCardAction('unMute');
	unMute
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZMT00', device_data.host, function (result) {
					
					if (result == '1ZMT00') callback (null, true); else callback (null, false);
					
				}, '1ZMT');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
	
				sendCommand ('!1MT300', device_data.host, function (result) {
					
					if (result == '1MT300') callback (null, true); else callback (null, false);
					
				}, '1MT3');
				
			} else {
				
				sendCommand ('!1AMT00', device_data.host, function(result) {
				
					if (result == '1AMT00') callback (null, true); else callback (null, false);
					
				}, '1AMT');
				
			}
			
		});
		
	let setVolume = new Homey.FlowCardAction('setVolume');
	setVolume
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			var targetVolume = args.volume;

			if (targetVolume > 80) {
				
				console.log ('Target Volume (' + targetVolume + ') is too high (> 80)');
				callback ('Target Volume (' + targetVolume + ') is too high (> 80)', false);
				
			}
			
			console.log ('target volume=' + targetVolume);
			targetVolume = parseInt(targetVolume);
			var hexVolume = targetVolume.toString(16).toUpperCase();
			
			if (hexVolume.length < 2) hexVolume = '0' + hexVolume;
			
			console.log ('target volume in HEX=' + hexVolume);
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
				
				sendCommand ('!1ZVL' + hexVolume, device_data.host, function (result) {
				
					if (result == '1ZVL' + hexVolume) callback (null, true); else callback (null, false);
					
				}, '1ZVL');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
				
				sendCommand ('!1VL3' + hexVolume, device_data.host, function (result) {
				
					if (result == '1VL3' + hexVolume) callback (null, true); else callback (null, false);
					
				}, '1VL3');
				
			} else {
				
				sendCommand ('!1MVL' + hexVolume, device_data.host, function (result) {
				
					if (result == '1MVL' + hexVolume) callback (null, true); else callback (null, false);
					
				}, '1MVL');
				
			}
			
		});
		
	let volumeDown = new Homey.FlowCardAction('volumeDown');
	volumeDown
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZVLDOWN', device_data.host, function (result) {
					
					callback(null, true);
					
				}, '1ZVL');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
	
				sendCommand ('!1VL3DOWN', device_data.host, function (result) {
					
					callback(null, true);
					
				}, '1VL3');
				
			} else {
				
				sendCommand ('!1MVLDOWN', device_data.host, function (result) {
				
					callback (null, true);
							
				}, '1MVL');
				
			}
			
		});
		
	let volumeUp = new Homey.FlowCardAction('volumeUp');
	volumeUp
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			if (typeof args.zone  !== "undefined" && args.zone == "zone2") {
	
				sendCommand ('!1ZVLUP', device_data.host, function (result) {
					
					callback(null, true);
					
				}, '1ZVL');
				
			} else if (typeof args.zone  !== "undefined" && args.zone == "zone3") {
	
				sendCommand ('!1VL3UP', device_data.host, function (result) {
					
					callback(null, true);
					
				}, '1ZVL');
				
			} else {
				
				sendCommand ('!1MVLUP', device_data.host, function (result) {
				
					callback(null, true);
						
				}, '1MVL');
				
			}
			
		});
		
	let setPreset = new Homey.FlowCardAction('setPreset');
	setPreset
		.register()
		.registerRunListener((args, state, callback) => {
			
			console.log ("args = " + JSON.stringify (args));
			
			var preset = args.preset;

			console.log ('Set Preset to=' + preset);
			var hexPreset = preset.toString(16).toUpperCase();
			
			if (hexPreset.length < 2) hexPreset = '0' + hexPreset;
			
			sendCommand ('!1PRS' + hexPreset, device_data.host, function (result) {
			
				if (result == '1PRS' + hexPreset) callback (null, true); else callback (null, false);	
				
			}, '1PRS');
			
		});

	//CONDITIONS:
	let receiverOn = new Homey.FlowCardCondition('receiverOn');
	receiverOn
	    .register()
	    .registerRunListener(( args, state, callback ) => {
	
			sendCommand ('!1PWRQSTN', device_data.host, function(result) {
		
				if (result == '1PWR01') callback (null, true); else callback (null, false);
				
			}, '1PWR');
	
	    })
	    
	let muted = new Homey.FlowCardCondition('muted');
	muted
	    .register()
	    .registerRunListener(( args, state, callback ) => {
	
	        sendCommand ('!1AMTQSTN', device_data.host, function(result) {
		
				if (result == '1AMT01') callback (null, true); else callback (null, false);
				
			}, '1AMT');
	
	    })
	    
	let inputselected = new Homey.FlowCardCondition('inputselected');
	inputselected
	    .register()
	    .registerRunListener(( args, state, callback ) => {
				
	      	sendCommand ('!1SLIQSTN', device_data.host, function (result) {
				
				if (result == args.input.id.substring(1)) callback (null, true); else callback (null, false);
				
			}, args.input.id.substr(1, 4));
			    
	    })
	    .getArgument('input')
		.registerAutocompleteListener(( query, args ) => {
       
			let results = allPossibleInputs;

			results = results.filter( result => {
			    return result.name.toLowerCase().indexOf( query.toLowerCase() ) > -1;
			  });
			
			return Promise.resolve( results );

        });


module.exports = OnkyoDevice;


function sendCommand (cmd, hostIP, callback, substring) {

	console.log('======================================================');
	console.log ("Onkyo receiver app - sending " + cmd + " to " + hostIP);
	console.log('======================================================');
			
	//create a 'backlog' of callbacks. Required because the Onkyo sometimes responds in a different order
	//console.log('[CBLOG] ' + substring + ' = ' + callback);
	
	if (typeof callbacklog[hostIP] === "undefined") callbacklog[hostIP] = [];
	callbacklog[hostIP][substring] = callback;
	
	if (typeof cmdclient[hostIP] !== 'undefined') {
		
		cmdclient[hostIP].write(eiscp_packet(cmd));
	
	} else {
		
		console.log ('cmdclient[' + hostIP + '] is undefined, trying to restart socket');
		
		this.startsocket({ipaddress: hostIP});
		
		if (typeof cmdclient[hostIP] !== 'undefined') cmdclient[hostIP].write(eiscp_packet(cmd));
	
	}
}


function eiscp_packet (cmd) {
	
	var cmdLength=cmd.length+1; 
	var code=String.fromCharCode(cmdLength);
	var line="ISCP\x00\x00\x00\x10\x00\x00\x00"+code+"\x01\x00\x00\x00"+cmd+"\x0D";
	
	return line;
}