
# RS485 Spy – Dual-Port Bus Monitor and Injector

**RS485 Spy** is an open-source hardware tool for real-time monitoring, logging, and testing of RS-485 networks. It provides **two RS-485 ports** (via RJ45 connectors) and can passively “sniff” bus traffic on each line or actively inject custom messages. Built around an **ESP32** microcontroller, it relays captured data to a companion mobile/PC app for live inspection, and it features **three configurable buttons** for triggering pre-set RS-485 packets. The design is released under the **CERN Open Hardware Licence v2**, encouraging community collaboration and modification.

## Features

- **Dual RS-485 Interfaces:** Two isolated RS-485 ports (RJ45 jacks) allow simultaneous monitoring of two separate half-duplex buses. Each port uses a **MAX3485** 3.3V transceiver chip.
- **Configurable Wiring & Termination:** DIP switch array allows remapping of twisted-pair wiring and optional 120Ω termination resistors.
- **Independent UART Ports:** Each MAX3485 connects to ESP32’s UART1 or UART2 for parallel sniffing or injecting.
- **Packet Injection Buttons:** 3 physical buttons are programmable via app to send specific RS-485 messages.
- **Companion Apps:** PC and mobile apps support live monitoring and configuration.
- **Ideal for Industrial/Building Networks:** Works with Modbus and other RS-485 based protocols.

## Hardware Details

- **Microcontroller:** ESP32 with Wi-Fi and dual UART for RS-485 monitoring and injection.
- **Transceivers:** MAX3485 half-duplex RS-485 transceivers (3.3V logic level).
- **RJ45 Connectors:** Dual RJ45 with remappable pins via DIP switch.
- **Termination:** On-board 120Ω resistors toggled via DIP switch.
- **Buttons:** 3 buttons connected to ESP32 GPIOs for user-configurable packet sending.

## Software and Usage

1. **Setup:** Power the board and configure DIP switches.
2. **Network Connection:** Connect to the ESP32 via Wi-Fi.
3. **Monitoring Traffic:** View RS-485 data in real time through the apps.
4. **Packet Injection:** Define and trigger packet sends with onboard buttons.
5. **Applications:** Useful for debugging, testing, and protocol analysis.

## Getting Started

1. **Clone the Repo** and download the KiCad design files and firmware.
2. **Build** the PCB and solder components.
3. **Flash Firmware** to the ESP32.
4. **Install App** for desktop or mobile.
5. **Use and Modify** the project under CERN-OHL v2 license.

## License

This project is licensed under the **CERN Open Hardware Licence Version 2**. See `LICENSE` file for full terms.
