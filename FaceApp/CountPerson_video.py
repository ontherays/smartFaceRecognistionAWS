import boto3
import cv2
import os
import shutil
from datetime import datetime

# AWS Rekognition and S3 setup
rekognition = boto3.client('rekognition', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
COLLECTION_ID = 'MyFaceCollection'
S3_BUCKET = 'countfaceapp'

# Local save folder
LOCAL_SAVE_DIR = '/home/user/FaceApp/Pictures/CountPerson'
os.makedirs(LOCAL_SAVE_DIR, exist_ok=True)

def save_to_local_and_s3(input_path):
    base_name = os.path.basename(input_path)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    new_filename = f"{timestamp}_{base_name}"
    local_path = os.path.join(LOCAL_SAVE_DIR, new_filename)

    # Copy locally
    shutil.copy2(input_path, local_path)
    print(f"✅ File saved locally: {local_path}")

    # Upload to S3
    try:
        s3.upload_file(local_path, S3_BUCKET, new_filename)
        print(f"✅ File uploaded to S3: s3://{S3_BUCKET}/{new_filename}")
    except Exception as e:
        print(f"❌ S3 upload failed: {e}")

    return local_path

def detect_faces_in_frame(frame):
    success, encoded_image = cv2.imencode('.jpg', frame)
    if not success:
        print("❌ Failed to encode frame.")
        return 0

    image_bytes = encoded_image.tobytes()
    response = rekognition.detect_faces(
        Image={'Bytes': image_bytes},
        Attributes=['DEFAULT']
    )
    return len(response['FaceDetails'])

def count_faces_from_image(image_path):
    with open(image_path, 'rb') as img_file:
        image_bytes = img_file.read()

    response = rekognition.detect_faces(
        Image={'Bytes': image_bytes},
        Attributes=['DEFAULT']
    )
    return len(response['FaceDetails'])

def count_faces_from_video(video_path):
    cap = cv2.VideoCapture(video_path)
    total_faces = 0
    frame_interval = 30
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            faces = detect_faces_in_frame(frame)
            print(f"🖼️ Frame {frame_count}: {faces} face(s) detected.")
            total_faces += faces

        frame_count += 1

    cap.release()
    return total_faces

# ---- Main Execution ----
input_type = input("Enter 'image' or 'video': ").strip().lower()
input_path = input("Enter full path to file: ").strip()

if not os.path.exists(input_path):
    print("❌ File does not exist.")
    exit()

# Save to local + S3
local_path = save_to_local_and_s3(input_path)

# Perform face count
if input_type == 'image':
    face_count = count_faces_from_image(local_path)
    print(f"✅ Detected {face_count} face(s) in image.")
elif input_type == 'video':
    face_count = count_faces_from_video(local_path)
    print(f"✅ Total estimated faces in video: {face_count}")
else:
    print("❌ Invalid input type. Use 'image' or 'video'.")
