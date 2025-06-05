import RPi.GPIO as GPIO
from picamera2 import Picamera2
import boto3
import os
from datetime import datetime
import time
import subprocess

# GPIO setup
SENSOR_PIN = 17
GPIO.setmode(GPIO.BCM)
GPIO.setup(SENSOR_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

# AWS setup
s3 = boto3.client('s3', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
sns = boto3.client('sns', region_name='us-east-1')

attendance_table = dynamodb.Table('Attendance')

# SNS topic ARN (replace with your actual ARN)
STUDENT_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AttendanceNotificationTopic'

# Buckets
main_bucket = 'attendancentust'
unrecognized_bucket = 'unrecognizedface'

# Local folders
BASE_LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/AttendanceImages')
UNRECOGNISED_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/UnrecognisedImages')
os.makedirs(BASE_LOCAL_FOLDER, exist_ok=True)
os.makedirs(UNRECOGNISED_FOLDER, exist_ok=True)

# Camera setup
camera = Picamera2()
camera_config = camera.create_still_configuration(main={"size": (1024, 768)})
camera.configure(camera_config)
camera.start()
time.sleep(2)

def notify_student(name, student_id, date, time_in):
    message = f"✅ Hello {name} (ID: {student_id}), your attendance has been marked on {date} at {time_in}."
    sns.publish(
        TopicArn=STUDENT_TOPIC_ARN,
        Message=message,
        Subject="Attendance Confirmed"
    )
    print("Student notified via SNS.")

def wait_for_attendance_record(s3_key, timeout=10):
    start_time = time.time()
    while time.time() - start_time < timeout:
        response = attendance_table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('Image').eq(s3_key)
        )
        items = response.get('Items', [])
        if items:
            item = items[0]
            name = item.get('Name', 'Unknown')
            student_id = item.get('StudentID', 'Unknown')
            date = item.get('Date', 'Unknown')
            time_in = item.get('Time', 'Unknown')

            # Check if already marked today
            existing = attendance_table.get_item(
                Key={'StudentID': student_id, 'Date': date}
            )

            if 'Item' in existing:
                print(f"⚠️ Attendance already marked for {name} on {date}.")
            else:
                # Record attendance
                attendance_table.put_item(
                    Item={
                        'StudentID': student_id,
                        'Date': date,
                        'Time': time_in,
                        'Name': name,
                        'Image': s3_key
                    }
                )
                print(f"✅ Attendance marked for {name}")
                notify_student(name, student_id, date, time_in)
            return True
        time.sleep(1)
    print("⚠️ No attendance record found for image.")
    return False



def handle_unrecognized_image(local_path, date_folder, image_name):
    try:
        choice = input("❓ Face not recognized. Do you want to register? (1 = Yes, 0 = No): ").strip()
    except Exception:
        choice = '0'

    if choice != '1':
        print("User declined to register. Resuming motion monitoring.")
        return

    print("Starting registration process...")

    s3_key = f"{date_folder}/{image_name}"
    try:
        s3.upload_file(local_path, unrecognized_bucket, s3_key)
        print(f"Image uploaded to unrecognized bucket: s3://{unrecognized_bucket}/{s3_key}")
    except Exception as e:
        print(f"❌ Upload failed to unrecognized bucket: {e}")
        return

    subprocess.run([
        "python3",
        "/home/user/FaceApp/Register_unreco_face.py",
        "--bucket", unrecognized_bucket,
        "--key", s3_key
    ])
    print("✅ Registration completed or exited. Resuming motion monitoring.")

def capture_and_upload():
    timestamp = datetime.now()
    date_folder = timestamp.strftime('%Y-%m-%d')
    time_stamp = timestamp.strftime('%H%M%S')
    image_name = f"capture_{time_stamp}.jpg"

    dated_local_folder = os.path.join(BASE_LOCAL_FOLDER, date_folder)
    os.makedirs(dated_local_folder, exist_ok=True)
    local_path = os.path.join(dated_local_folder, image_name)
    s3_key = f"{date_folder}/{image_name}"

    camera.capture_file(local_path)
    print(f"Image captured: {local_path}")

    try:
        s3.upload_file(local_path, main_bucket, s3_key)
        print(f"✅ Uploaded to attendance bucket: s3://{main_bucket}/{s3_key}")
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return

    recognized = wait_for_attendance_record(s3_key)
    if not recognized:
        handle_unrecognized_image(local_path, date_folder, image_name)

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
    GPIO.cleanup()
    camera.stop()
