import boto3

rekognition = boto3.client('rekognition', region_name='us-east-1')
collection_id = 'StudentFaceCollection'

# Get all face IDs
face_ids = []
response = rekognition.list_faces(CollectionId=collection_id)

while True:
    face_ids += [face['FaceId'] for face in response['Faces']]
    if 'NextToken' in response:
        response = rekognition.list_faces(CollectionId=collection_id, NextToken=response['NextToken'])
    else:
        break

# Delete all faces
if face_ids:
    delete_response = rekognition.delete_faces(
        CollectionId=collection_id,
        FaceIds=face_ids
    )
    print("Deleted FaceIds:", delete_response['DeletedFaces'])
else:
    print("No faces found in the collection.")
