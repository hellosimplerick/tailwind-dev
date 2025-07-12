#!/usr/bin/env python3

import psycopg2
import imagehash
from collections import defaultdict
import time
from tqdm import tqdm

# === CONFIG ===
DB_NAME = "bessie_test_db"
USER = "ricksegal"
PASSWORD = "Teresa2024"
HOST = "localhost"
PORT = 5432
HASH_THRESHOLD = 5
BUCKET_PREFIX_LENGTH = 4
BATCH_SIZE = 1000

# === DB CONNECT ===
conn = psycopg2.connect(
    dbname=DB_NAME, user=USER, password=PASSWORD, host=HOST, port=PORT
)
cur = conn.cursor()

# === FETCH UNCLUSTERED HASHES ===
cur.execute("""
    SELECT id, image_id, hash_value
    FROM image_hashes
    WHERE hash_method = 'phash' AND cluster_id IS NULL
""")
rows = cur.fetchall()

print(f"📦 Loaded {len(rows)} unclustered hashes...")

if not rows:
    print("✅ All images already clustered.")
    exit(0)

# === BUCKETING ===
bucket_map = defaultdict(list)
for db_id, image_id, hex_hash in rows:
    h = imagehash.hex_to_hash(hex_hash)
    prefix = hex_hash[:BUCKET_PREFIX_LENGTH]
    bucket_map[prefix].append({
        "db_id": db_id,
        "image_id": str(image_id),
        "hash": h
    })

print(f"🪣 Bucketing into {len(bucket_map)} groups...")

# === CLUSTERING ===
clusters = []
visited = set()
cluster_id_counter = 1

start_time = time.time()

for prefix, candidates in bucket_map.items():
    for i, current in enumerate(candidates):
        if current["image_id"] in visited:
            continue

        cluster = [current]
        visited.add(current["image_id"])

        for other in candidates[i+1:]:
            if other["image_id"] in visited:
                continue
            if current["hash"] - other["hash"] <= HASH_THRESHOLD:
                cluster.append(other)
                visited.add(other["image_id"])

        clusters.append((cluster_id_counter, cluster))
        cluster_id_counter += 1

elapsed = time.time() - start_time
print(f"✅ Found {len(clusters)} clusters in {elapsed:.1f} sec.")
print("📝 Writing to DB with progress bar...")

# === BATCHED DB WRITES WITH PROGRESS ===
cur = conn.cursor()
total_updates = sum(len(c[1]) for c in clusters)
batched = []

with tqdm(total=total_updates, desc="Updating cluster_id") as pbar:
    for cluster_id, group in clusters:
        for item in group:
            batched.append((cluster_id, item["db_id"]))
            if len(batched) >= BATCH_SIZE:
                cur.executemany(
                    "UPDATE image_hashes SET cluster_id = %s WHERE id = %s",
                    batched
                )
                conn.commit()
                pbar.update(len(batched))
                batched = []
    # Final flush
    if batched:
        cur.executemany(
            "UPDATE image_hashes SET cluster_id = %s WHERE id = %s",
            batched
        )
        conn.commit()
        pbar.update(len(batched))

cur.close()
conn.close()
print("✅ All cluster_id values written.")
