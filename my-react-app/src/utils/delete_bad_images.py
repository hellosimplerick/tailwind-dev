#!/usr/bin/env python3

import os
from tqdm import tqdm
from pathlib import Path

# === CONFIGURATION ===
BAD_LOG_FILE = "bad_images.log"

# === MAIN SCRIPT ===

def main():
    log_path = Path(BAD_LOG_FILE)
    if not log_path.exists():
        print(f"❌ Log file not found: {BAD_LOG_FILE}")
        return

    with open(log_path, "r") as f:
        bad_paths = [line.strip() for line in f.readlines() if line.strip()]

    if not bad_paths:
        print("✅ No entries to delete. Log file is empty.")
        return

    deleted_count = 0
    with tqdm(total=len(bad_paths), desc="Deleting bad images") as pbar:
        for path_str in bad_paths:
            try:
                os.remove(path_str)
                deleted_count += 1
            except Exception as e:
                print(f"⚠️ Could not delete: {path_str} — {e}")
            pbar.update(1)

    print(f"\n✅ Deletion complete. Total images deleted: {deleted_count}")

if __name__ == "__main__":
    main()
