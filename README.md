# Onkyo receiver app for Athom Homey

Version 0.9.0

Control your Onkyo network-enabled receiver using the Homey by Athom B.V.
Only recent network-enabled receivers will work (TX-NR series). This app uses ISCP to control your receiver.

Enables the following cards to use in your flows:
- Volume +
- Volume -
- Set specific volume (0 - 100, or 0-80 on some devices... but you shouldn't use a volume higher than 40 anyways)
- Turn receiver on or off
- Switch input to Bluray/DVD player, VCR/DVR, Cable/Sat TV, PC, Game, AUX, TV/CD, Phono, Tuner, Net, USB
- Mute or unmute
- Set Tuner Preset (to switch tuner to a saved radio channel - make sure you set input to TUNER first)
- Set listenmode (NEW)

Conditions available in your flows:
- Is receiver powered on?
- Is receiver muted?
- Is input xxx selected?

NEW: Discovery will fill in the IP-address and type as name of the device. Ofcourse, it is still possible to change the IP-address (for example, if you have more devices than 1).

Use at your own risk, I accept no responsibility for any damages caused by using this script.
