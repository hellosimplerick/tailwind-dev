#!/usr/bin/env python3

import re
import boto3
from tqdm import tqdm

# === CONFIGURATION ===
BUCKET = "newmlp"
PREFIX = "lat-long/"
PATTERN = re.compile(r"ris(\d+)\.jpg$", re.IGNORECASE)

s3 = boto3.client("s3")

def get_all_keys():
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=BUCKET, Prefix=PREFIX)
    all_keys = []
    for page in pages:
        all_keys.extend(obj["Key"] for obj in page.get("Contents", []))
    return all_keys

def main():
    print("🔍 Scanning S3 bucket for risN.jpg files...")
    keys = get_all_keys()
    max_num = -1

    for key in tqdm(keys, desc="Checking keys", unit="file"):
        match = PATTERN.search(key)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    if max_num >= 0:
        print(f"\n✅ Highest risN.jpg number: {max_num}")
    else:
        print("\n⚠️ No risN.jpg files found.")

if __name__ == "__main__":
    main()
