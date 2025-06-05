from picamera2 import Picamera2
from time import sleep
import boto3
import os
from datetime import datetime

# AWS setup
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns', region_name='us-east-1')

# Constants
FACE_BUCKET = 'faceappntust'
ATTENDANCE_BUCKET = 'attendancentust'
COLLECTION_ID = 'StudentFaceCollection'
DYNAMODB_FACE_INDEX = 'FaceIndex'
DYNAMODB_ATTENDANCE = 'Attendance'
LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/RegistrationImages')
os.makedirs(LOCAL_FOLDER, exist_ok=True)

# SNS Topics
ADMIN_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AdminAlertTopic'
STUDENT_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AttendanceNotificationTopic'

# Get input
name = input("Enter your full name: ").strip()
student_id = input("Enter your student ID: ").strip()

# Timestamp & filenames
now = datetime.now()
timestamp_str = now.strftime('%Y%m%d_%H%M%S')
date_str = now.strftime('%Y-%m-%d')
time_str = now.strftime('%H:%M:%S')
image_filename = f"{student_id}_{timestamp_str}.jpg"
local_path = os.path.join(LOCAL_FOLDER, image_filename)
faceapp_s3_key = f"registered/{image_filename}"
attendance_s3_key = f"{date_str}/{image_filename}"

# Capture image
print("Taking Picture, Smile Please! :)")
sleep(2)
print("Capturing image...")
camera = Picamera2()
camera.configure(camera.create_still_configuration())
camera.start()
sleep(2)
camera.capture_file(local_path)
camera.stop()
print(f"Image saved at {local_path}")

# Upload to faceapp bucket
print("Uploading image to S3 (registration bucket)...")
s3.upload_file(local_path, FACE_BUCKET, faceapp_s3_key)
print(f"✅ Uploaded to s3://{FACE_BUCKET}/{faceapp_s3_key}")

# Upload to attendance bucket
print("Uploading image to S3 (attendance bucket)...")
s3.upload_file(local_path, ATTENDANCE_BUCKET, attendance_s3_key)
print(f"✅ Uploaded to s3://{ATTENDANCE_BUCKET}/{attendance_s3_key}")

# Index face
print("Indexing face in Rekognition...")
response = rekognition.index_faces(
    CollectionId=COLLECTION_ID,
    Image={'S3Object': {'Bucket': FACE_BUCKET, 'Name': faceapp_s3_key}},
    ExternalImageId=student_id,
    DetectionAttributes=['DEFAULT']
)

if not response['FaceRecords']:
    print("❌ No face detected. Registration failed.")
    exit(1)

face_id = response['FaceRecords'][0]['Face']['FaceId']
print(f"✅ Face indexed. FaceId: {face_id}")

# Save to FaceIndex table
print("Storing metadata in DynamoDB (FaceIndex)...")
face_index_table = dynamodb.Table(DYNAMODB_FACE_INDEX)
face_index_table.put_item(
    Item={
        'FaceID': face_id,
        'StudentID': student_id,
        'Name': name,
        'ImageID': image_filename
    }
)
print(f"✅ Metadata stored for {name}.")

# Save attendance
print("Logging attendance in DynamoDB (Attendance)...")
attendance_table = dynamodb.Table(DYNAMODB_ATTENDANCE)
attendance_table.put_item(
    Item={
        'StudentID': student_id,
        'Date': date_str,
        'Time': time_str,
        'Name': name,
        'Image': attendance_s3_key
    }
)
print(f"✅ Attendance logged for {name} on {date_str} at {time_str}.")

# SNS: Notify Admin
admin_msg = f"New student registered and marked present:\nName: {name}\nID: {student_id}\nImage: s3://{FACE_BUCKET}/{faceapp_s3_key}"
sns.publish(
    TopicArn=ADMIN_TOPIC_ARN,
    Message=admin_msg,
    Subject="New Student Registration and Attendance"
)
print("✅ Admin notified via SNS.")

# SNS: Notify Student
student_msg = f"✅ Hello {name} (ID: {student_id}), you are registered and your attendance is marked for {date_str} at {time_str}."
sns.publish(
    TopicArn=STUDENT_TOPIC_ARN,
    Message=student_msg,
    Subject="Attendance Confirmed"
)
print("✅ Student notified via SNS.")
