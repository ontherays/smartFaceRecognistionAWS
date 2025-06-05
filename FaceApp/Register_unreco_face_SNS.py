import argparse
import boto3
from datetime import datetime
import os

# AWS Setup
region = 'us-east-1'
rekognition = boto3.client('rekognition', region_name=region)
dynamodb = boto3.resource('dynamodb', region_name=region)
s3 = boto3.client('s3', region_name=region)
sns = boto3.client('sns', region_name=region)

# SNS Topics
ADMIN_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AdminAlertTopic'
STUDENT_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AttendanceNotificationTopic'

# Constants
MAIN_BUCKET = 'faceappntust'
REGISTERED_PREFIX = 'registered'
COLLECTION_ID = 'StudentFaceCollection'
FACE_INDEX_TABLE = 'FaceIndex'
ATTENDANCE_TABLE = 'Attendance'

# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument('--bucket', required=True, help="Source S3 bucket name (unrecognized)")
parser.add_argument('--key', required=True, help="Source S3 object key")
args = parser.parse_args()

src_bucket = args.bucket
src_key = args.key

print(f"Processing image: s3://{src_bucket}/{src_key}")

# Input from user
student_id = input("Enter Student ID: ").strip()
student_name = input("Enter Full Name: ").strip()

# Generate timestamp and new image name
timestamp = datetime.now()
date_today = timestamp.strftime('%Y-%m-%d')
date_tag = timestamp.strftime('%Y%m%d')
time_tag = timestamp.strftime('%H%M%S')
new_image_name = f"{student_id}_{date_tag}_{time_tag}.jpg"
dst_key = f"{REGISTERED_PREFIX}/{date_today}/{new_image_name}"

# Copy image to registered folder
try:
    copy_source = {'Bucket': src_bucket, 'Key': src_key}
    s3.copy_object(CopySource=copy_source, Bucket=MAIN_BUCKET, Key=dst_key)
    print(f"✅ Image copied and renamed to: s3://{MAIN_BUCKET}/{dst_key}")
except Exception as e:
    print(f"❌ Failed to copy/rename image in registered bucket: {e}")
    exit(1)

# Delete old image if needed
try:
    if src_bucket == MAIN_BUCKET and src_key != dst_key:
        s3.delete_object(Bucket=MAIN_BUCKET, Key=src_key)
        print(f"Old image s3://{src_bucket}/{src_key} deleted.")
except Exception as e:
    print(f"⚠️ Failed to delete old image: {e}")

# Index face
try:
    response = rekognition.index_faces(
        CollectionId=COLLECTION_ID,
        Image={'S3Object': {'Bucket': MAIN_BUCKET, 'Name': dst_key}},
        ExternalImageId=student_id,
        DetectionAttributes=['ALL']
    )
    print("✅ Face successfully indexed.")
except Exception as e:
    print(f"❌ Rekognition indexing failed: {e}")
    exit(1)

# Extract FaceId
faces = response.get('FaceRecords', [])
if not faces:
    print("❌ No face detected. Exiting.")
    exit(1)
face_id = faces[0]['Face']['FaceId']

# Save to FaceIndex table
face_index_table = dynamodb.Table(FACE_INDEX_TABLE)
try:
    face_index_table.put_item(
        Item={
            'FaceID': face_id,
            'StudentID': student_id,
            'Name': student_name,
            'ImageID': new_image_name
        }
    )
    print(f"✅ Metadata stored in FaceIndex table for {student_name}.")
except Exception as e:
    print(f"❌ Failed to write to FaceIndex table: {e}")

# Save to Attendance table
attendance_table = dynamodb.Table(ATTENDANCE_TABLE)
try:
    attendance_table.put_item(
        Item={
            'StudentID': student_id,
            'Date': date_today,
            'Time': timestamp.strftime('%H:%M:%S'),
            'Name': student_name,
            'Image': dst_key
        }
    )
    print(f"✅ Attendance logged for {student_name}.")
except Exception as e:
    print(f"❌ Failed to log attendance for {student_name}: {e}")

# Notify Student
student_msg = f"Hello {student_name} (ID: {student_id}), you have been successfully registered and your attendance is marked on {date_today} at {timestamp.strftime('%H:%M:%S')}."
try:
    sns.publish(
        TopicArn=STUDENT_TOPIC_ARN,
        Message=student_msg,
        Subject="Attendance Confirmed"
    )
    print("Student notified via SNS.")
except Exception as e:
    print(f"❌ Failed to notify student: {e}")

# Notify Admin
admin_msg = f"New registration and attendance recorded:\nName: {student_name}\nStudent ID: {student_id}\nDate: {date_today}\nTime: {timestamp.strftime('%H:%M:%S')}"
try:
    sns.publish(
        TopicArn=ADMIN_TOPIC_ARN,
        Message=admin_msg,
        Subject="Student Attendance Notification"
    )
    print("Admin notified via SNS.")
except Exception as e:
    print(f"❌ Failed to notify admin: {e}")
