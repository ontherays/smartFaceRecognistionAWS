import json
import boto3
from datetime import datetime

rekognition = boto3.client('rekognition')
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Table names
face_table = dynamodb.Table('FaceIndex')       # metadata for students
attendance_table = dynamodb.Table('Attendance')  # attendance records

def lambda_handler(event, context):
    print("S3 Trigger Event Received")

    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    print(f"Processing image: s3://{bucket}/{key}")

    try:
        # Search face in collection
        response = rekognition.search_faces_by_image(
            CollectionId='StudentFaceCollection',
            Image={'S3Object': {'Bucket': bucket, 'Name': key}},
            MaxFaces=1,
            FaceMatchThreshold=95
        )

        if not response['FaceMatches']:
            print("❌ No face match found.")
            return {"statusCode": 404, "body": "No face match found."}

        face_match = response['FaceMatches'][0]
        face_id = face_match['Face']['FaceId']
        student_id = face_match['Face']['ExternalImageId']

        # Lookup student details
        student = face_table.get_item(Key={'StudentID': student_id}).get('Item')

        if not student:
            print("⚠️ Student not found in FaceIndex.")
            return {"statusCode": 404, "body": "Student not found."}

        name = student.get('Name', 'Unknown')
        now = datetime.utcnow()
        date = now.strftime('%Y-%m-%d')
        time_in = now.strftime('%H:%M:%S')

        # Log attendance
        attendance_table.put_item(
            Item={
                'StudentID': student_id,
                'Date': date,
                'TimeIn': time_in,
                'Name': name,
                'Image': key
            }
        )

        print(f"✅ Attendance recorded for {name} ({student_id}) at {time_in}")
        return {
            'statusCode': 200,
            'body': f"Attendance recorded for {name}"
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': f"Internal error: {str(e)}"
        }
