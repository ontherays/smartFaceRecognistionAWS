import argparse
import boto3
from datetime import datetime
import os

# AWS Setup
region = 'us-east-1'
rekognition = boto3.client('rekognition', region_name=region)
dynamodb = boto3.resource('dynamodb', region_name=region)
s3 = boto3.client('s3', region_name=region)

# Constants
MAIN_BUCKET = 'faceappntust'
REGISTERED_PREFIX = 'registered'
COLLECTION_ID = 'StudentFaceCollection'  
FACE_INDEX_TABLE = 'FaceIndex'        
ATTENDANCE_TABLE = 'Attendance'       

# Argument parsing
parser = argparse.ArgumentParser()
parser.add_argument('--bucket', required=True, help="Source S3 bucket name (unrecognized)")
parser.add_argument('--key', required=True, help="Source S3 object key")
args = parser.parse_args()

src_bucket = args.bucket
src_key = args.key

print(f"📁 Processing image: s3://{src_bucket}/{src_key}")

# Ask user for details
student_id = input("Enter Student ID: ").strip()
student_name = input("Enter Full Name: ").strip()

# Create destination key in registered/
date_today = datetime.now().strftime('%Y-%m-%d')
image_name = os.path.basename(src_key)
dst_key = f"{REGISTERED_PREFIX}/{date_today}/{image_name}"

# Copy image from unrecognized to main registered bucket
try:
    copy_source = {'Bucket': src_bucket, 'Key': src_key}
    s3.copy_object(CopySource=copy_source, Bucket=MAIN_BUCKET, Key=dst_key)
    print(f"✅ Image copied to main bucket: s3://{MAIN_BUCKET}/{dst_key}")
except Exception as e:
    print(f"❌ Failed to copy image to main bucket: {e}")
    exit(1)

# Index face in Rekognition
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

# Get FaceId
image_id = None
faces = response.get('FaceRecords', [])
if faces:
    image_id = faces[0]['Face']['FaceId']
else:
    print("❌ No face detected in image.")
    exit(1)


# Store metadata in FaceIndex table
print("Storing metadata in DynamoDB...")
face_index_table = dynamodb.Table(FACE_INDEX_TABLE)
try:
    face_index_table.put_item(
        Item={
            'FaceID': image_id,
            'StudentID': student_id,
            'Name': student_name,
            'ImageID': image_name
        }
    )
    print(f"✅ Metadata stored in FaceIndex table for {student_name}.")
except Exception as e:
    print(f"❌ Error storing metadata for {student_name}: {e}")


# Log attendance
print("Logging attendance...")
attendance_table = dynamodb.Table(ATTENDANCE_TABLE)
try:
    attendance_table.put_item(
        Item={
            'StudentID': student_id,
            'Date': date_today,  # e.g., 2025-06-04
            'Time': datetime.now().strftime('%H:%M:%S'),
            'Name': student_name,
            'Image': dst_key
        }
    )
    print(f"✅ Attendance logged for {student_name}.")
except Exception as e:
    print(f"❌ Error logging attendance for {student_name}: {e}")


