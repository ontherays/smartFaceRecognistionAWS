import boto3
import json

rekognition = boto3.client('rekognition', region_name='us-east-1')

response = rekognition.list_faces(CollectionId='StudentFaceCollection')

print(json.dumps(response['Faces'], indent=2))
