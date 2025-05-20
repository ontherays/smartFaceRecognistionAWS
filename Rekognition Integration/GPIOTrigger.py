import RPi.GPIO as GPIO
from picamera2 import Picamera2
import boto3
import os
from datetime import datetime
import time

# GPIO setup
SENSOR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)  # Add pull-up resistor

# AWS S3 setup
s3 = boto3.client('s3', region_name='us-east-1')
bucket_name = 'attendancentust'

# Local storage setup
LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/AttendanceImages')
os.makedirs(LOCAL_FOLDER, exist_ok=True)

# Camera setup
camera = Picamera2()
camera_config = camera.create_still_configuration(main={"size": (1024, 768)})
camera.configure(camera_config)
camera.start()
time.sleep(2)  # Allow camera to warm up

def capture_and_upload():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    image_name = f"capture_{timestamp}.jpg"
    local_path = os.path.join(LOCAL_FOLDER, image_name)
    
    camera.capture_file(local_path)
    print(f"Image captured: {local_path}")
    
    try:
        s3.upload_file(local_path, bucket_name, image_name)
        print(f"✅ Image uploaded to S3: {image_name}")
    except Exception as e:
        print(f"❌ Upload failed: {e}")

print("Monitoring for motion...")

try:
    motion_detected = False

    while True:
        # Reverse logic: detect motion when input goes LOW (0)
        if GPIO.input(SENSOR_PIN) == 0:
            if not motion_detected:
                print("⚠️ Motion detected! Capturing image...")
                capture_and_upload()
                motion_detected = True
        else:
            if motion_detected:
                print("✅ Motion ended. Ready for next detection.")
            motion_detected = False

        time.sleep(1)  # Polling interval (shorter is more responsive)

except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()
    camera.stop()
