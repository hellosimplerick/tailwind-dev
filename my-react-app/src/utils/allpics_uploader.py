import os
import hashlib
from tqdm import tqdm

ROOTS = [
    '/Volumes/CruiseCrazy',
    '/Volumes/HelloSimple',
    '/Volumes/MACRAID',
    '/Volumes/Seagate Portabl',
    '/Volumes/TestPhoto',
    '/Volumes/TrainingVideos'
]
IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.nef', '.heic'}

def file_hash(filepath, blocksize=65536):
    """Efficient hash for large files."""
    hasher = hashlib.sha1()
    try:
        with open(filepath, 'rb') as f:
            while True:
                buf = f.read(blocksize)
                if not buf:
                    break
                hasher.update(buf)
        return hasher.hexdigest()
    except (OSError, IOError):
        return None

# Step 1: Find all files to hash (so progress bar can be accurate)
all_files = []
for root in ROOTS:
    if not os.path.exists(root):
        print(f"Warning: Volume {root} not found or not mounted.")
        continue
    for dirpath, dirnames, filenames in os.walk(root):
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext in IMAGE_EXTS:
                full_path = os.path.join(dirpath, fname)
                all_files.append(full_path)

print(f"Total candidate files: {len(all_files)}")

image_files = []
hash_to_path = {}
dupes = []
errors = []

# Step 2: Hashing and deduplication with progress bar
for full_path in tqdm(all_files, desc="Hashing images"):
    hashval = file_hash(full_path)
    if hashval is None:
        errors.append(f"Error hashing {full_path}")
        continue
    if hashval in hash_to_path:
        dupes.append((full_path, hash_to_path[hashval]))
    else:
        hash_to_path[hashval] = full_path
        image_files.append(full_path)

print(f"\nDe-duplication complete. Unique images: {len(image_files)}")
print(f"Exact duplicates found: {len(dupes)}")
if dupes:
    print("First 5 duplicates (src, duplicate):")
    for src, duplicate in dupes[:5]:
        print(f"Original: {duplicate} | Duplicate: {src}")
if errors:
    print(f"\nErrors encountered: {len(errors)} (see allpics_errors.log)")
    with open("allpics_errors.log", "w", encoding="utf-8") as errlog:
        for err in errors:
            errlog.write(err + "\n")

# Save the list of unique images for next steps
with open("unique_images.txt", "w", encoding="utf-8") as outlist:
    for imgfile in image_files:
        outlist.write(imgfile + "\n")
