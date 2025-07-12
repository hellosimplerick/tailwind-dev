#!/usr/bin/env python3

import os
from PIL import Image, ImageOps, UnidentifiedImageError
from tqdm import tqdm

# === CONFIGURATION ===
SOURCE_DIR = "/Volumes/Seagate Portabl/lat-long/"
THUMB_DIR = "/Volumes/Seagate Portabl/thumbnails/lat-long/"
THUMB_SIZE = (400, 400)  # Max size

def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def create_thumbnail(src_path, dest_path):
    try:
        with Image.open(src_path) as img:
            # Respect EXIF rotation
            img = ImageOps.exif_transpose(img)
            img.thumbnail(THUMB_SIZE)
            img.save(dest_path, format="JPEG")
            return True
    except UnidentifiedImageError:
        return False
    except Exception as e:
        print(f"⚠️ Error processing {src_path}: {e}")
        return False

def main():
    ensure_dir(THUMB_DIR)

    image_files = [
        f for f in os.listdir(SOURCE_DIR)
        if os.path.isfile(os.path.join(SOURCE_DIR, f)) and f.lower().endswith((".jpg", ".jpeg"))
    ]

    success_count = 0
    fail_count = 0

    print(f"🔄 Generating thumbnails in: {THUMB_DIR}")
    for filename in tqdm(image_files, desc="Creating Thumbnails", unit="img"):
        src = os.path.join(SOURCE_DIR, filename)
        dst = os.path.join(THUMB_DIR, filename)
        if create_thumbnail(src, dst):
            success_count += 1
        else:
            fail_count += 1

    print(f"\n✅ Done. {success_count} thumbnails created successfully.")
    if fail_count > 0:
        print(f"❌ {fail_count} images failed to process.")

if __name__ == "__main__":
    main()
