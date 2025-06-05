import boto3
import json

rekognition = boto3.client('rekognition')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    response = rekognition.index_faces(
        CollectionId='MyFaceCollection',
        Image={'S3Object': {'Bucket': bucket, 'Name': key}},
        ExternalImageId=key,
        DetectionAttributes=['ALL']
    )
    
    face_id = response['FaceRecords'][0]['Face']['FaceId']
    
    # Get metadata (HEAD object)
    metadata = s3.head_object(Bucket=bucket, Key=key)['Metadata']
    
    # Store in DynamoDB
    table = dynamodb.Table('FaceIndex')
    table.put_item(
        Item={
            'FaceId': face_id,
            'ImageId': key,
            'Metadata': metadata
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps('Face indexed successfully')
    }
