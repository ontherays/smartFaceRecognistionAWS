import boto3

# Make sure the region matches where your collection exists
rekognition = boto3.client('rekognition', region_name='us-east-1')

def list_collections():
    response = rekognition.list_collections()
    collections = response.get('CollectionIds', [])

    print("Face collections found:")
    for collection in collections:
        print(f"- {collection}")

    if not collections:
        print("No Rekognition face collections found.")

list_collections()
