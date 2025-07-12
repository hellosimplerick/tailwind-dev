import os
import shutil
import boto3
import rawpy
import imageio
from tqdm import tqdm
from PIL import Image
import piexif

S3_BUCKET = 'newmlp'
S3_PREFIX = 'allpics/'
BAD_IMAGE_DIR = 'bad_images'
ERROR_LOG_FILE = 'allpics_errors.log'
UNIQUE_IMAGES_FILE = 'unique_images.txt'

if not os.path.exists(BAD_IMAGE_DIR):
    os.makedirs(BAD_IMAGE_DIR)

# S3 client (boto3 uses your AWS config/credentials)
s3 = boto3.client('s3')

def has_exif_jpeg(filepath):
    try:
        img = Image.open(filepath)
        return "exif" in img.info and img.info["exif"]
    except (OSError, IOError):
        return False

def convert_to_jpeg(source_path, dest_path):
    ext = os.path.splitext(source_path)[1].lower()
    try:
        if ext == ".nef":
            with rawpy.imread(source_path) as raw:
                rgb = raw.postprocess()
            imageio.imwrite(dest_path, rgb)
        elif ext in (".png", ".heic"):
            img = Image.open(source_path)
            rgb_img = img.convert("RGB")
            rgb_img.save(dest_path, "JPEG", quality=90)
        else:  # fallback for anything else
            img = Image.open(source_path)
            img = img.convert("RGB")
            img.save(dest_path, "JPEG", quality=90)
        return True
    except (OSError, IOError, rawpy.LibRawError, ValueError):
        return False

def copy_exif(source_path, dest_path):
    try:
        src_exif = piexif.load(source_path)
        piexif.insert(piexif.dump(src_exif), dest_path)
        return True
    except (piexif.InvalidImageDataError, KeyError, ValueError):
        return False

def upload_to_s3(local_path, s3_key):
    try:
        s3.upload_file(local_path, S3_BUCKET, s3_key)
        return True
    except boto3.exceptions.S3UploadFailedError:
        return False

error_log = []

with open(UNIQUE_IMAGES_FILE, "r", encoding="utf-8") as infile:
    all_images = [line.strip() for line in infile.readlines()]

print(f"Processing {len(all_images)} images for upload...")

img_index = 1

for image_path in tqdm(all_images, desc="Processing images"):
    file_ext = os.path.splitext(image_path)[1].lower()
    s3_name = f"s3up{img_index}.jpg"
    s3_key = f"{S3_PREFIX}{s3_name}"
    temp_jpg = f"temp_{s3_name}"

    try:
        # .jpg/.jpeg with EXIF: just copy
        if file_ext in ('.jpg', '.jpeg') and has_exif_jpeg(image_path):
            shutil.copy2(image_path, temp_jpg)
        else:
            # Convert to JPEG
            if not convert_to_jpeg(image_path, temp_jpg):
                error_log.append(f"{image_path}: Conversion to JPEG failed")
                # Move to bad_images and continue
                shutil.copy2(image_path, os.path.join(BAD_IMAGE_DIR, os.path.basename(image_path)))
                img_index += 1
                if os.path.exists(temp_jpg):
                    os.remove(temp_jpg)
                continue
            # If original was .jpg/.jpeg, try to copy EXIF
            if file_ext in ('.jpg', '.jpeg') and has_exif_jpeg(image_path):
                copy_exif(image_path, temp_jpg)
        # Upload to S3
        if not upload_to_s3(temp_jpg, s3_key):
            error_log.append(f"{image_path}: S3 upload failed")
            shutil.copy2(image_path, os.path.join(BAD_IMAGE_DIR, os.path.basename(image_path)))
    except (OSError, IOError, shutil.Error) as err:
        error_log.append(f"{image_path}: {str(err)}")
        try:
            shutil.copy2(image_path, os.path.join(BAD_IMAGE_DIR, os.path.basename(image_path)))
        except (OSError, IOError, shutil.Error):
            pass
    finally:
        if os.path.exists(temp_jpg):
            os.remove(temp_jpg)
    img_index += 1

if error_log:
    with open(ERROR_LOG_FILE, "a", encoding="utf-8") as elog:
        for line in error_log:
            elog.write(line + "\n")

print(f"\nAll done! Uploaded {img_index-1-len(error_log)} images. Errors: {len(error_log)} (see {ERROR_LOG_FILE}).")
