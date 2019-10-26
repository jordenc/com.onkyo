# Onkyo receiver app for Homey

Control your Onkyo network-enabled receiver using the Homey.
Only recent network-enabled receivers will work (TX-NR series). This app uses eISCP to control your receiver.

**Want to show your appreciation for this app? A donation is possible via http://www.d2c.nl **

Enables the following actions to use in your flows:
- Volume +1
- Volume -1
- Set specific volume (0 - 100, or 0-80 on some devices... but you shouldn't use a volume higher than 40 anyways)
- Turn receiver on or off
- Switch input to Bluray/DVD player, VCR/DVR, Cable/Sat TV, PC, Game, AUX, TV/CD, Phono, Tuner, Net, USB
- Mute or unmute
- Set Tuner Preset (to switch tuner to a saved radio channel - make sure you set input to TUNER first)
- Set listenmode

Triggers available in your flows:
- Receiver gets powered on
- Receiver gets powered off
- Volume changes (token: volume)
- Input changes (token: input)

Conditions available in your flows:
- Is receiver powered on?
- Is receiver muted?
- Is input xxx selected?

Discovery will fill in the IP-address and type as name of the device. Ofcourse, it is still possible to change the IP-address (for example, if your device is on a different LAN).

Use at your own risk, I accept no responsibility for any damages caused by using this script.

# Changelog
**Version 2.1.5**
- Resolved a onkyo bug when receiver is off and is turned on by e.g. spotify device there is no EISCP command send from
  onkyo to homey to set the on/off status.
- back to default capabilities but whithouw double flows
- Minor bugfixes
- **Sadly, you have to delete your existing devices and add them with the new pairing mechanism.**

**Version 2.1.3 BETA**

- Token/Tag volume corrected
- making all capabilities custom to get rid of the default flows that Homey create
- Minor bugfixes
- **Sadly, you have to delete your existing devices and add them with the new pairing mechanism.**

**KNOWN ISSUE, timeouts - Look like its a bit less, eventually the command wil be send to receiver**

**Version 2.1.1 BETA**
- Compatibilty version homey firmware 2.0 or higher
- Added capabilities volumeUp, VolumeDown, VolumeMute
- Volume Changes, Mute changes, Input changes and on/off changes now in sync
- Removed support fot Pioneer receiver

**Version 2.0.4**
- Fixed compatibility version

**Version 2.0.3**
- Added callback to Reconnect function (always success)
- Removed unused parts of the older code

**Version 2.0.2**
- Bugfixes

**Version 2.0.1**
- Created a conversion for older devices when upgrading to version 2.0.0+

**Version 2.0.0**
- SDKv2 version (so Homey-future-compatible)
- Zone 3 added (for receivers that support this)
- Support for DAB, Airplay and Tape (for receivers that support this)
- New keys UP, DOWN, LEFT, RIGHT, HOME, EXIT (for OSD) added under "Listen mode"
- Support for Pioneer VSX receivers (such as the Pioneer VSX 932) (untested)
- New "Disconnect and reconnect"-action card for when the connection is lost.

**Version 1.1.3**
- Added enter button

**Version 1.1.2**
- Devices are now "Amplifier" class in Homey, which makes it possible to have some default control by speech
- maxVolume is increased from 60 to 80 in the mobile card slider
- Zone 2 now selectable in Power/volume cards
- Zone 2 change input and listening modes using the existing cards (for example, "Zone 2 Bluray/DVD player")

**Version 1.1.1**
- Bugfix for the volumeChanged card (thanks nklerk!)

**Version 1.1.0**
- The "mobile card" now also features the "input channel", which means you can change the input using the device in the "Zones & Devices" page and in the Homey mobile app as well. You will have to re-add the Onkyo device to Homey in order for this to work.

**Version 1.0.9**
- When the connection to a device gets broken, try to reconnect.

**Version 1.0.8**
- Fixed small bug causing app not to run on homey firmware 0.9.1

**Version 1.0.7**
- Better error handling when cmdclient is undefined

**Version 1.0.6**
- Better error handling

**Version 1.0.5**
- Better error handling

**Version 1.0.4**
- Added TV / Bluetooth / STRM BOX inputs
- Small bugfix

**Version 1.0.3**
- Small bugfix on triggers

**Version 1.0.2:**
- Fixed a nasty bug that caused Onkyo app to crash on first time use of newly added device 

**Version 1.0.1:**
- Small bugfix

**Version 1.0.0:**
- Fixed a bug on mobile cards / capabilities
- Made a fix where 'Onkyo Net/USB List information' messages disturbed the normal work.
- **Sadly, you will have to delete your device to be able to use the mobile card to turn it on or off**
- Now includes triggers, so you can activate flows based on actions of your Onkyo receiver - whether it's done by Homey, your remote control or an external device!

**Version 0.9.3:**
- Fixed a bug on manual pairing
- Fixed a bug on deleting

**Version 0.9.2:**
- Device can now be turned on/off directly from the (mobile) card

**Version 0.9.1:**
- Pairing now works better, up to 5 devices are added automaticly per pairing session using discovery.
- If no (new) devices are found, you can add a device manually
- It is now possible to change the IP of your receiver by editing the configuration of the device.
- Autocomplete fields are now case insensitive
- **Sadly, you have to delete your existing devices and add them with the new pairing mechanism.**

**Version 0.9.0:**
- Added Listenmodes

**Version 0.8.0:**
- Automatic discovery of your device

**Version 0.6.0:**
- Condition added: is the input xxx selected?
- Conditions added: is receiver on/off, is receiver muted?
- New command: Set TUNER Preset number (to choose a saved radio channel)
- Volume Up/Down functions

**Version 0.5.0:**
- First release
