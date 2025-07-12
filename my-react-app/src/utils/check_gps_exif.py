#!/usr/bin/env python3

import os
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from tqdm import tqdm

# === CONFIGURATION ===
IMAGE_DIR = "/Volumes/Seagate Portabl/lat-long/"

def get_exif_data(image):
    """Returns a dictionary from the EXIF data of an image."""
    exif_data = {}
    info = image._getexif()
    if info:
        for tag, value in info.items():
            decoded = TAGS.get(tag, tag)
            if decoded == "GPSInfo":
                gps_data = {}
                for t in value:
                    sub_decoded = GPSTAGS.get(t, t)
                    gps_data[sub_decoded] = value[t]
                exif_data["GPSInfo"] = gps_data
    return exif_data

def main():
    if not os.path.exists(IMAGE_DIR):
        print(f"❌ Folder not found: {IMAGE_DIR}")
        return

    image_files = [
        f for f in os.listdir(IMAGE_DIR)
        if os.path.isfile(os.path.join(IMAGE_DIR, f))
           and f.lower().endswith((".jpg", ".jpeg"))
    ]

    gps_count = 0
    total = len(image_files)

    for filename in tqdm(image_files, desc="Scanning for GPS", unit="img"):
        try:
            with Image.open(os.path.join(IMAGE_DIR, filename)) as img:
                exif = get_exif_data(img)
                if "GPSInfo" in exif and exif["GPSInfo"]:
                    gps_count += 1
        except Exception as e:
            print(f"⚠️ Skipped {filename} due to error: {e}")

    print(f"\n✅ Checked {total} images.")
    print(f"🛰️ {gps_count} images have GPS data in EXIF.")

if __name__ == "__main__":
    main()
