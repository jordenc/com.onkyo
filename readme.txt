Onkyo receiver app for Homey

Control your Onkyo network-enabled receiver using the Homey.
Only recent network-enabled receivers will work (TX-NR series). This app uses eISCP to control your receiver.

Pioneer VSX-receivers that have support for the Onkyo eISCP protocol are also supported

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