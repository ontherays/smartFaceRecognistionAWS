from picamera2 import Picamera2
from time import sleep
import boto3

s3 = boto3.client('s3')
camera = Picamera2()

def capture_and_upload():
    camera.start()
    sleep(2)  # Allow camera to warm up
    camera.capture_file("face.jpg")
    camera.stop()
    s3.upload_file("face.jpg", "faceappntust", "face.jpg", ExtraArgs={"Metadata": {"source": "raspberry-pi"}})

capture_and_upload()
