from flask import Flask, request
import subprocess
import json

app = Flask(__name__)

@app.route('/trigger-registration', methods=['POST'])
def trigger_registration():
    data = request.get_json()
    image_key = data.get("key")

    print(f"Trigger received for image: {image_key}")
    print("Launching registration script...")

    # Run register_face.py
    subprocess.Popen(["python3", "/home/user/FaceApp/register_face.py"])

    return json.dumps({"status": "Registration started"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
