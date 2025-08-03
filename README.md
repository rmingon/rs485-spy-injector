# ESP32 RS485 Hacker Suite

### _Sniff, Inject, and Control RS485 Communication from Your Phone_

## Overview

**ESP32 RS485 Hacker Suite** is a mobile-integrated toolkit built around the ESP32 microcontroller, designed to interact with RS485-based communication systems. This system allows for full control, inspection, and injection of RS485 traffic — making it a valuable asset for penetration testers, reverse engineers, and industrial system analysts.

## Features

- **RS485 Sniffing**  
  Monitor and log communication over RS485 in raw hex format. Useful for debugging, protocol analysis, or reverse engineering.

- **Hex Injection (Manual & Presets)**  
  Send custom hex data manually or use predefined presets. This supports use cases like device emulation, protocol fuzzing, or triggering specific system behaviors.

- **Mobile App Interface**  
  Control every feature directly from a smartphone via a dedicated app. Includes interfaces for configuration, command sending, and history review.

- **Dual RS485 Bus Support**  
  Work with two independent RS485 buses, ideal for simultaneously observing and injecting data into separate lines.

- **WiFi Configuration**  
  Easily connect your ESP32 to a local network or operate it in AP mode.

- **Command Presets**  
  Create and store frequently used hex commands for rapid execution.

- **Reception History**  
  View a log of all received data, enabling traffic inspection and replay.

## Ethical Hacking Applications

> **Important:** This tool is provided for **authorized use only**. Unauthorized access or tampering with industrial systems is illegal and unethical.

- Reverse engineering RS485-based protocols (MODBUS RTU, proprietary systems, etc.)
- Pen-testing building automation hardware (e.g., HVAC, elevator controllers, door access systems)
- Replay attacks or fault injection to test system resilience
- Simulating RS485 slave/master devices
- Forensic logging of unsecured RS485 data transmissions

## Hardware

- ESP32 (WROOM or S3 variant recommended)
- Dual RS485 transceivers (e.g., MAX485)
- Level shifters and protection diodes
- Power supply (USB or external)
- Custom PCB (designed in KiCad)

## Mobile App Overview

- Configure each RS485 bus individually
- Set baud rates and communication parameters
- Enter and send custom hex data manually
- Create named command presets (e.g., open door)
- View reception history for each bus

## Quick Example

```
Preset: Open door
Command: 09 21 32 AA B2
Target Device: Access Controller
Result: Relay Triggered, Door Unlocked
```

## Getting Started

### Flashing Firmware

1. Upload `main.cpp` to your ESP32 using Arduino IDE or PlatformIO.
2. Power on the device and connect via serial or mobile app.
3. Configure your RS485 settings and network preferences.

### Using the App

1. Connect to the ESP32 over WiFi.
2. Select Bus 1 or Bus 2.
3. Set the appropriate baud rate.
4. Send hex data manually or use a saved preset.
5. Monitor the reception log for data.

## Protocols Supported

- MODBUS RTU
- BACnet MS/TP (partial)
- Custom/Proprietary RS485 protocols
- Most serial-based building and industrial control protocols

## Disclaimer

This tool is meant for **educational, testing, and research** purposes only. Use it exclusively on systems you own or have explicit permission to test.

**You are fully responsible for how this tool is used. Unauthorized access or tampering with live systems can lead to legal consequences.**

5. **Use and Modify** the project under CERN-OHL v2 license.

## License

This project is licensed under the **CERN Open Hardware Licence Version 2**. See `LICENSE` file for full terms.
