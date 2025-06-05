import sys
import os
from datetime import datetime
import boto3

# AWS setup
s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')

# Constants
BUCKET_NAME = 'faceappntust'
COLLECTION_ID = 'StudentFaceCollection'
DYNAMODB_TABLE = 'FaceIndex'

# Get image path from command line
if len(sys.argv) < 2:
    print("❌ No image file provided. Exiting.")
    exit(1)

image_path = sys.argv[1]

if not os.path.isfile(image_path):
    print(f"❌ File does not exist: {image_path}")
    exit(1)

# Extract filename
image_filename = os.path.basename(image_path)

# Get user info
name = input("Enter your full name: ").strip()
student_id = input("Enter your student ID: ").strip()

s3_key = f"registered/{image_filename}"

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

if not response['FaceRecords']:
    print("❌ No face detected. Registration failed.")
    exit(1)

face_id = response['FaceRecords'][0]['Face']['FaceId']
print(f"✅ Face indexed. FaceId: {face_id}")

# Store metadata in DynamoDB
table = dynamodb.Table(DYNAMODB_TABLE)
table.put_item(
    Item={
        'FaceID': face_id,
        'StudentID': student_id,
        'Name': name,
        'ImageID': image_filename
    }
)
print("✅ Registration complete and stored in DynamoDB.")
