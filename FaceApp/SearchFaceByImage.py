rekognition = boto3.client('rekognition')

with open('face.jpg', 'rb') as img:
    response = rekognition.search_faces_by_image(
        CollectionId='MyFaceCollection',
        Image={'Bytes': img.read()},
        MaxFaces=1
    )

print(response['FaceMatches'])
