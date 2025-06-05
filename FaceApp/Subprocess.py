import subprocess

def handle_unrecognized_image(local_path, date_folder, image_name):
    # Ask user if they want to register
    try:
        choice = input("❓ Face not recognized. Do you want to register? (1 = Yes, 0 = No): ").strip()
    except Exception:
        choice = '0'

    if choice != '1':
        print("🚫 User declined to register. Resuming motion monitoring.")
        return

    print("📝 Starting registration process...")
    
    # Save image locally and upload to unrecognized bucket
    unrecog_local_folder = os.path.join(UNRECOGNISED_FOLDER, date_folder)
    os.makedirs(unrecog_local_folder, exist_ok=True)
    local_unrecognized_path = os.path.join(unrecog_local_folder, image_name)
    os.system(f"cp '{local_path}' '{local_unrecognized_path}'")
    
    s3_key = f"{date_folder}/{image_name}"
    try:
        s3.upload_file(local_path, unrecognized_bucket, s3_key)
        print(f"📤 Image uploaded to unrecognized bucket: s3://{unrecognized_bucket}/{s3_key}")
    except Exception as e:
        print(f"❌ Upload failed to unrecognized bucket: {e}")

    # Run register_face.py and wait until it finishes
    subprocess.run(["python3", "/home/user/FaceApp/register_face.py"])
    print("✅ Registration complete or exited. Resuming motion monitoring.")
