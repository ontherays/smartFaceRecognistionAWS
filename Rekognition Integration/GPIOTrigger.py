import RPi.GPIO as GPIO
from picamera2 import Picamera2
import boto3
import os
from datetime import datetime
import time

# GPIO setup
SENSOR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# AWS setup
s3 = boto3.client('s3', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
attendance_table = dynamodb.Table('Attendance')
bucket_name = 'attendancentust'

# Local storage
BASE_LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/AttendanceImages')
os.makedirs(BASE_LOCAL_FOLDER, exist_ok=True)

# Camera setup
camera = Picamera2()
camera_config = camera.create_still_configuration(main={"size": (1024, 768)})
camera.configure(camera_config)
camera.start()
time.sleep(2)

def wait_for_attendance_record(s3_key, timeout=10):
    """Poll DynamoDB to see if the image was processed and attendance was logged."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        response = attendance_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('Image').eq(s3_key)
        )
        items = response.get('Items', [])
        if items:
            name = items[0].get('Name', 'Unknown')
            print(f"✅ Attendance marked for {name}")
            return True
        time.sleep(1)  # Wait a bit before checking again
    print("⚠️ No attendance record found for image.")
    return False

def capture_and_upload():
    timestamp = datetime.now()
    date_folder = timestamp.strftime('%Y-%m-%d')
    time_stamp = timestamp.strftime('%H%M%S')
    image_name = f"capture_{time_stamp}.jpg"
    
    # Paths
    dated_local_folder = os.path.join(BASE_LOCAL_FOLDER, date_folder)
    os.makedirs(dated_local_folder, exist_ok=True)
    local_path = os.path.join(dated_local_folder, image_name)
    s3_key = f"{date_folder}/{image_name}"

    # Capture and upload
    camera.capture_file(local_path)
    print(f"Image captured: {local_path}")
    
    try:
        s3.upload_file(local_path, bucket_name, s3_key)
        print(f"✅ Image uploaded to S3: {s3_key}")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None

    # Wait for Lambda to process and record attendance
    wait_for_attendance_record(s3_key)

    return s3_key

# Main loop
print("Monitoring for motion...")

try:
    motion_detected = False

    while True:
        if GPIO.input(SENSOR_PIN) == 0:
            if not motion_detected:
                print("⚠️ Motion detected! Capturing image...")
                capture_and_upload()
                motion_detected = True
        else:
            if motion_detected:
                print("✅ Motion ended. Ready for next detection.")
            motion_detected = False

        time.sleep(1)

except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()a
    camera.stop()
