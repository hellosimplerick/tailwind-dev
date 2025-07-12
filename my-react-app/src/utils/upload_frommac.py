#!/usr/bin/env python3

import os
import boto3
from tqdm import tqdm
from botocore.exceptions import ClientError

# === CONFIGURATION ===
BUCKET_NAME = "newmlp"
LOCAL_DIR = "/Volumes/Seagate Portabl/lat-long/"
S3_PREFIX = "frommac/"  # Appears as a folder in S3 UI

# Initialize S3 client (uses local AWS credentials)
s3 = boto3.client("s3")

def upload_image(file_path, s3_key):
    try:
        s3.upload_file(file_path, BUCKET_NAME, s3_key)
        return True
    except ClientError as e:
        print(f"❌ Failed to upload {file_path}: {e}")
        return False

def main():
    if not os.path.exists(LOCAL_DIR):
        print(f"❌ Folder not found: {LOCAL_DIR}")
        return

    image_files = [
        f for f in os.listdir(LOCAL_DIR)
        if os.path.isfile(os.path.join(LOCAL_DIR, f))
           and f.lower().endswith((".jpg", ".jpeg", ".png", ".heic", ".webp"))
    ]

    if not image_files:
        print("⚠️ No image files found.")
        return

    print(f"Uploading {len(image_files)} files from '{LOCAL_DIR}' to 's3://{BUCKET_NAME}/{S3_PREFIX}'...")

    for filename in tqdm(image_files, desc="Uploading", unit="file"):
        local_path = os.path.join(LOCAL_DIR, filename)
        s3_key = f"{S3_PREFIX}{filename}"
        upload_image(local_path, s3_key)

    print("✅ Upload complete.")

if __name__ == "__main__":
    main()
