#!/usr/bin/env python3

import os
import sys
import tty
import termios
import requests
from urllib.parse import urlparse

# === CONFIGURATION ===
API_BASE_URL = "http://localhost:8000"
CLUSTERED_ENDPOINT = f"{API_BASE_URL}/api/images/clustered"
LOG_FILE = os.path.expanduser("~/rendered_cluster_images.log")
PAGE_SIZE = 30
TIMEOUT = 10


def get_images(offset=0):
    try:
        res = requests.get(CLUSTERED_ENDPOINT, params={"offset": offset, "limit": PAGE_SIZE}, timeout=TIMEOUT)
        res.raise_for_status()
        return res.json().get("images", [])
    except requests.RequestException as e:
        print(f"❌ Failed to fetch images: {e}")
        return []


def getch():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return ch.lower()


def log_deletion(name):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{name}\n")


def main():
    offset = 0
    total_seen = 0

    print("\n🧱 Clustered Image Review")
    print("Use another screen or gallery view to see images manually.")
    print("This is terminal-only: press Z to keep, X to log, Q to quit.\n")

    while True:
        images = get_images(offset)
        if not images:
            print("✅ Done. No more images.")
            break

        for img in images:
            total_seen += 1
            print("\n" + "=" * 60)
            print(f"[{total_seen}] {img['original_name']}")
            print(f"Thumbnail URL: {API_BASE_URL}{img['thumbnail_url']}")

            while True:
                key = getch()
                if key == "z":
                    print("✅ Kept")
                    break
                elif key == "x":
                    log_deletion(img["original_name"])
                    print(f"❌ Logged: {img['original_name']}")
                    break
                elif key == "q":
                    print("👋 Quitting.")
                    return
                else:
                    print("Invalid key. Press Z, X, or Q.")

        offset += PAGE_SIZE


if __name__ == "__main__":
    main()
