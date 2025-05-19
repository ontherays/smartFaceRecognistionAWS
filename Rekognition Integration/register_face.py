from picamera2 import Picamera2
from time import sleep
import boto3
import os
import uuid
from datetime import datetime

# AWS setup
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

# Constants
BUCKET_NAME = 'faceappntust'
COLLECTION_ID = 'StudentFaceCollection'
DYNAMODB_TABLE = 'FaceIndex'
LOCAL_FOLDER = os.path.expanduser('/home/user/FaceApp/Pictures')
os.makedirs(LOCAL_FOLDER, exist_ok=True)

# Get user input
name = input("Enter your full name: ").strip()
student_id = input("Enter your student ID: ").strip()

# Create image filename
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
image_filename = f"{student_id}_{timestamp}.jpg"
image_path = os.path.join(LOCAL_FOLDER, image_filename)
s3_key = f"registered/{image_filename}"

# Capture image
print("Capturing image...")
camera = Picamera2()
camera.configure(camera.create_still_configuration())
camera.start()
sleep(2)
camera.capture_file(image_path)
camera.stop()
print(f"Image saved at {image_path}")

# Upload to S3
print("Uploading to S3...")
s3.upload_file(image_path, BUCKET_NAME, s3_key)
print("Upload complete.")

# Index face in Rekognition
print("Indexing face in Rekognition...")
response = rekognition.index_faces(
    CollectionId=COLLECTION_ID,
    Image={'S3Object': {'Bucket': BUCKET_NAME, 'Name': s3_key}},
    ExternalImageId=student_id,
    DetectionAttributes=['DEFAULT']
)

# Extract FaceId
if not response['FaceRecords']:
    print("No face detected. Registration failed.")
    exit(1)

face_id = response['FaceRecords'][0]['Face']['FaceId']
print(f"Face indexed. FaceId: {face_id}")

# Store metadata in DynamoDB
print("Storing metadata in DynamoDB...")
table = dynamodb.Table(DYNAMODB_TABLE)
table.put_item(
    Item={
        'FaceId': face_id,
        'StudentID': student_id,
        'Name': name,
        'ImageId': image_filename
    }
)
print("Registration complete and stored in DynamoDB.")
