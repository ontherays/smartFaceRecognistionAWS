import boto3
import os
import time
from datetime import datetime
from picamera2 import Picamera2
import RPi.GPIO as GPIO

# AWS Setup
rekognition = boto3.client('rekognition', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
S3_BUCKET = 'countfaceapp'

# Paths
LOCAL_DIR = '/home/user/FaceApp/Pictures/CountPerson'
os.makedirs(LOCAL_DIR, exist_ok=True)

# GPIO Setup
SENSOR_PIN = 17 
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# Camera Setup
camera = Picamera2()
camera_config = camera.create_still_configuration(main={"size": (1024, 768)})
camera.configure(camera_config)
camera.start()
time.sleep(2)

def capture_image():
    timestamp = datetime.now()
    date_str = timestamp.strftime('%Y-%m-%d')
    time_str = timestamp.strftime('%H%M%S')
    filename = f"{date_str}_{time_str}.jpg"
    local_path = os.path.join(LOCAL_DIR, filename)

    camera.capture_file(local_path)
    print(f"Image captured: {local_path}")
    return local_path, filename

def upload_to_s3(local_path, filename):
    try:
        s3.upload_file(local_path, S3_BUCKET, filename)
        print(f"☁️ Uploaded to S3: s3://{S3_BUCKET}/{filename}")
    except Exception as e:
        print(f"❌ S3 upload failed: {e}")

def count_people(local_path):
    with open(local_path, 'rb') as img_file:
        image_bytes = img_file.read()

    try:
        response = rekognition.detect_labels(
            Image={'Bytes': image_bytes},
            MaxLabels=10,
            MinConfidence=70
        )

        person_count = 0
        for label in response['Labels']:
            if label['Name'] == 'Person':
                person_count = len(label.get('Instances', []))
                break

        print(f"✅ Total number of person present is {person_count}")
        return person_count

    except Exception as e:
        print(f"❌ Rekognition failed: {e}")
        return 0

# Main Loop
print("Monitoring for motion...")

try:
    motion_detected = False

    while True:
        if GPIO.input(SENSOR_PIN) == 0:
            if not motion_detected:
                print("⚠️ Motion Detected, Capturing Image")
                img_path, img_name = capture_image()
                upload_to_s3(img_path, img_name)
                count_people(img_path)
                motion_detected = True
        else:
            motion_detected = False

        time.sleep(1)

except KeyboardInterrupt:
    print("Exiting...")
    GPIO.cleanup()
    camera.stop()
