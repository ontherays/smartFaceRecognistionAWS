import argparse
from picamera2 import Picamera2
from time import sleep
import boto3
import os
from datetime import datetime

# AWS Setup
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns', region_name='us-east-1')

# Constants
BUCKET_NAME = 'faceappntust'
ATTENDANCE_BUCKET = 'attendancentust'
COLLECTION_ID = 'StudentFaceCollection'
FACEINDEX_TABLE = 'FaceIndex'
ATTENDANCE_TABLE = 'Attendance'
LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures/RegistrationImages')
os.makedirs(LOCAL_FOLDER, exist_ok=True)

# SNS Topics
ADMIN_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AdminAlertTopic'
STUDENT_TOPIC_ARN = 'arn:aws:sns:us-east-1:702975096997:AttendanceNotificationTopic'


def register_face(name, student_id):
    # Timestamp and filename
    timestamp = datetime.now()
    date_tag = timestamp.strftime('%Y-%m-%d')
    time_tag = timestamp.strftime('%H:%M:%S')
    image_filename = f"{student_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}.jpg"
    image_path = os.path.join(LOCAL_FOLDER, image_filename)
    s3_key = f"registered/{image_filename}"
    attendance_s3_key = f"{date_tag}/{image_filename}"

    # Capture image
    print("Taking Picture, Smile Please!")
    camera = Picamera2()
    camera.configure(camera.create_still_configuration())
    camera.start()
    sleep(2)
    camera.capture_file(image_path)
    camera.stop()
    print(f"✅ Image saved at: {image_path}")

    # Upload to S3
    print("⬆️ Uploading to S3...")
    s3.upload_file(image_path, BUCKET_NAME, s3_key)
    print("✅ Upload complete to:", f"s3://{BUCKET_NAME}/{s3_key}")

    # Index face in Rekognition
    print("Indexing face in Rekognition...")
    response = rekognition.index_faces(
        CollectionId=COLLECTION_ID,
        Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': s3_key}},
        ExternalImageId=student_id,
        DetectionAttributes=['DEFAULT']
    )
    if not response['FaceRecords']:
        print("❌ No face detected. Registration failed.")
        return

    face_id = response['FaceRecords'][0]['Face']['FaceId']
    print(f"✅ Face indexed. FaceId: {face_id}")

    # Store in FaceIndex DynamoDB
    faceindex_table = dynamodb.Table(FACEINDEX_TABLE)
    faceindex_table.put_item(
        Item={
            'FaceID': face_id,
            'StudentID': student_id,
            'Name': name,
            'ImageID': image_filename
        }
    )
    print(f"✅ Metadata stored in DynamoDB FaceIndex table for {name}.")

    # Log attendance
    print("Marking attendance...")
    attendance_table = dynamodb.Table(ATTENDANCE_TABLE)
    attendance_table.put_item(
        Item={
            'StudentID': student_id,
            'Date': date_tag,
            'Time': time_tag,
            'Name': name,
            'Image': attendance_s3_key
        }
    )
    s3.upload_file(image_path, ATTENDANCE_BUCKET, attendance_s3_key)
    print(f"✅ Attendance logged in DynamoDB and uploaded to: s3://{ATTENDANCE_BUCKET}/{attendance_s3_key}")

    # Notify Admin
    admin_msg = f"New student registered:\nName: {name}\nID: {student_id}\nImage: s3://{BUCKET_NAME}/{s3_key}"
    sns.publish(
        TopicArn=ADMIN_TOPIC_ARN,
        Message=admin_msg,
        Subject="New Face Registration Alert"
    )
    print("Admin notified via SNS.")

    # Notify Student
    student_msg = f"✅ Hello {name} (ID: {student_id}), you have been successfully registered and marked present on {date_tag} at {time_tag}."
    sns.publish(
        TopicArn=STUDENT_TOPIC_ARN,
        Message=student_msg,
        Subject="Registration & Attendance Confirmed"
    )
    print("Student notified via SNS.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--name', required=True, help='Full name of the student')
    parser.add_argument('--student_id', required=True, help='Student ID')
    args = parser.parse_args()

    register_face(args.name, args.student_id)
