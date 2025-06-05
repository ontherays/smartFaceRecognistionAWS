from picamera2 import Picamera2
from time import sleep
import boto3
import os

# AWS S3 client
s3 = boto3.client('s3')

# Initialize PiCamera2
camera = Picamera2()

# Folder to store images
pictures_folder = os.path.expanduser('/home/user/FaceApp/Pictures')
image_filename = 'face.jpg'
image_path = os.path.join(pictures_folder, image_filename)

# Ensure the folder exists
os.makedirs(pictures_folder, exist_ok=True)

def capture_and_upload():
    # Configure and start camera
    camera.configure(camera.create_still_configuration())
    camera.start()
    sleep(2)  # Allow camera to adjust

    # Capture image
    camera.capture_file(image_path)
    camera.stop()

    # Upload image to S3
    s3.upload_file(
        image_path,
        'faceappntust',
        image_filename,
        ExtraArgs={"Metadata": {"source": "raspberry-pi"}}
    )

    print(f"✅ Image captured and uploaded from: {image_path}")

capture_and_upload()


# from picamera2 import Picamera2
#from time import sleep
#import boto3

#s3 = boto3.client('s3')
#camera = Picamera2()

#def capture_and_upload():
    #camera.start()
    #sleep(2)  # Allow camera to warm up
    #camera.capture_file("face.jpg")
    #camera.stop()
    #s3.upload_file("face.jpg", "faceappntust", "face.jpg", ExtraArgs={"Metadata": {"source": "raspberry-pi"}})

#capture_and_upload()
