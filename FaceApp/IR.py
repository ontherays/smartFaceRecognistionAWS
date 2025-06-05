import RPi.GPIO as GPIO
import time

# === Configuration ===
SENSOR_PIN = 17  # GPIO17 (Physical Pin 11)

# === GPIO Setup ===
GPIO.setmode(GPIO.BCM)  # Use BCM numbering
GPIO.setup(SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)  # Prevent floating input

print("IR Sensor Test: Waiting for motion... (Press Ctrl+C to exit)")

try:
    while True:
        if GPIO.input(SENSOR_PIN):
            print("⚠️  No motion!")
        else:
            print("✅ Motion detected.")
        time.sleep(5)

except KeyboardInterrupt:
    print("\nExiting...")
    GPIO.cleanup()
