## Hardware Setup

### 🖥️ **Raspberry Pi 4 – Overview**

The **Raspberry Pi 4 Model B** is a powerful, compact, and affordable single-board computer developed by the **Raspberry Pi Foundation**. It’s designed for a wide range of applications—from learning programming and DIY electronics to home automation, media centers, and even edge computing projects.

![image](https://github.com/user-attachments/assets/72a5b7f2-b9db-4ae6-abda-4883ba0fd40e)

---

### 🔧 **Key Features:**

- **Processor**: Quad-core ARM Cortex-A72 (64-bit) @ 1.5 GHz  
- **RAM Options**: 2GB, 4GB, or 8GB LPDDR4-3200 SDRAM  
- **Connectivity**:
  - Dual-band **Wi-Fi 802.11ac** and **Bluetooth 5.0**
  - **Gigabit Ethernet** for fast network access
  - **2 × USB 3.0** and **2 × USB 2.0** ports  
- **Display & Video**:
  - **2 × micro-HDMI ports** (up to 4K resolution)
  - **VideoCore VI GPU** supports dual 4K displays  
- **Storage**: microSD card slot for OS and data storage  
- **GPIO Pins**: 40-pin GPIO header for hardware interfacing

---

### ⚡ **Typical Uses:**

- Programming & education (Python, C++, etc.)
- Home automation (smart sensors, cameras)
- Media centers (using software like Kodi or Plex)
- Lightweight server or web hosting
- Robotics and IoT projects
- 5G/Edge computing experiments (great for testbeds)

---

### 🔌 **Hardware Setup Steps for Raspberry Pi 4**

1. **Connect USB Keyboard and Mouse**  
   - Plug the **USB keyboard** and **mouse** into the **USB 2.0 or USB 3.0 ports** (blue ports are USB 3.0).

2. **Connect the Camera**  
   - Locate the **camera serial interface (CSI) port** near the HDMI ports.  
   - Gently **lift the plastic clip**, insert the **ribbon cable** from the camera (metal contacts facing the HDMI ports), and press the clip back to secure it.

3. **Connect the Monitor via micro-HDMI**  
   - Use a **micro-HDMI to HDMI cable** to connect your monitor to **one of the two micro-HDMI ports**.  
   - Use the **left HDMI port (HDMI0)** for the primary display.

4. **Connect the Power Supply**  
   - Use a **5V/3A USB-C power adapter** (official Raspberry Pi power supply recommended).  
   - Plug it into the **USB-C power port** on the Pi.

5. **Optional: Connect to Ethernet (Wired Network)**  
   - Plug in an **Ethernet cable** to the **Gigabit Ethernet port** for wired internet access, or use Wi-Fi after booting.
   - **Note-**I used Wifi connection After Booting
  
6 . Flash your desired OS (e.g., Raspberry Pi OS) onto a microSD card using a tool like Raspberry Pi Imager.
   - Install (SD card formator)[https://www.sdcard.org/downloads/formatter/sd-memory-card-formatter-for-windows-download/]
   - Choose SD card drive carefully.
   - Formate.
   - Goto (Raspberry Pi OS)[https://www.raspberrypi.com/software/].
   - Install Raspberry Pi Imager for Windows
     <img width="860" alt="image" src="https://github.com/user-attachments/assets/ec332bb6-1268-4d28-9b0d-12b5adc9ad6e" />
   - Open and Choose Device, OS and Storage as per requirements.
     <img width="680" alt="image" src="https://github.com/user-attachments/assets/e270b02e-5789-4327-b683-ffe8ebb208f9" />
     - Device - Version of your Raspberry Pi (As PI 4)
     - OS - Compitable with your Device( Raspberry Pi OS(64 bits))
     - Storage - SD card.
     - Click Next > Edit Setting
     - Addition Setting, Choose Hostname, Username, Password, Wifi Seetings and Region.
     - Click Save
     - <img width="538" alt="image" src="https://github.com/user-attachments/assets/a400d5cf-58fc-4eb5-a75b-64e2d14754f6" />

   - Flash.
   - Once Donce, Put the SD card in Raspberry Pi module.

7. **Turn It On**  
   - Once power is connected, the Pi will **automatically boot** if the OS is correctly installed on the microSD card.  
   - You'll see the **boot sequence on the monitor**.

---

**Setup Complete!** 

