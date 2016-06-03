# Onkyo receiver app for Athom Homey

Control your Onkyo network-enabled receiver using the Homey by Athom B.V.
Only recent network-enabled receivers will work (TX-NR series). This app uses ISCP to control your receiver.

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