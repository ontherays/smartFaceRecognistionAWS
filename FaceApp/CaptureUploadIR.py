import RPi.GPIO as GPIO
from picamera import PiCamera
import boto3
from datetime import datetime
import time

# GPIO setup
SENSOR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN)

# AWS S3
s3 = boto3.client('s3')
bucket_name = 'faceappntust'

# Camera setup
camera = PiCamera()
camera.resolution = (1024, 768)

def capture_and_upload():
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    image_name = f"capture_{timestamp}.jpg"
    camera.capture(image_name)
    s3.upload_file(image_name, bucket_name, image_name)

print("Monitoring for motion...")

try:
    while True:
        if GPIO.input(SENSOR_PIN):
            print("Motion detected! Capturing image...")
            capture_and_upload()
            time.sleep(10)  # Delay to avoid multiple captures
        time.sleep(1)

except KeyboardInterrupt:
    GPIO.cleanup()
