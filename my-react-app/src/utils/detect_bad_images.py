#!/usr/bin/env python3

import os
import cv2
import numpy as np
from tqdm import tqdm
from pathlib import Path

# === CONFIGURATION ===
EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic"}
BAD_LOG_FILE = "bad_images.log"
STDDEV_THRESHOLD = 5.0  # Lower = more likely to be a flat black/white/blank image

# === HELPERS ===

def is_external_drive(path: Path):
    return str(path).startswith("/Volumes") and not path.name.startswith("Macintosh")

def is_supported_image(file_path: Path):
    return file_path.suffix.lower() in EXTENSIONS

def detect_bad_image(image_path: Path):
    try:
        image = cv2.imread(str(image_path))
        if image is None:
            return False

        # Resize for speed
        image = cv2.resize(image, (100, 100))
        _, stddev = cv2.meanStdDev(image)
        flatness = np.mean(stddev)

        return flatness < STDDEV_THRESHOLD
    except Exception:
        return False

# === MAIN SCRIPT ===

def main():
    all_external_drives = [Path("/Volumes") / d for d in os.listdir("/Volumes") if is_external_drive(Path("/Volumes") / d)]

    print(f"Scanning external drives: {[str(d) for d in all_external_drives]}")

    image_files = []
    for drive in all_external_drives:
        for root, _, files in os.walk(drive):
            for file in files:
                path = Path(root) / file
                if is_supported_image(path):
                    image_files.append(path)

    print(f"Found {len(image_files):,} image files. Scanning for bad ones...\n")

    with open(BAD_LOG_FILE, "w") as log, tqdm(total=len(image_files), desc="Scanning") as pbar:
        for img_path in image_files:
            if detect_bad_image(img_path):
                log.write(str(img_path) + "\n")
            pbar.update(1)

    print(f"\n✅ Scan complete. Bad images saved to: {BAD_LOG_FILE}")

if __name__ == "__main__":
    main()
