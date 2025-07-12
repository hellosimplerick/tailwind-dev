import subprocess
import json
import sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict

INSTANCE_NAME = "BessieDb"
PERIOD = 3600
S3_BUCKET = "newmlp"
GROUP_BY_DEPTH = 2  # Change as desired

NOW = datetime.now(timezone.utc)
START = NOW - timedelta(days=7)

def iso8601(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

start_time = iso8601(START)
end_time = iso8601(NOW)

def get_metric(metric_name, filename):
    cmd = [
        "aws", "lightsail", "get-instance-metric-data",
        "--instance-name", INSTANCE_NAME,
        "--metric-name", metric_name,
        "--period", str(PERIOD),
        "--start-time", start_time,
        "--end-time", end_time,
        "--unit", "Bytes",
        "--statistics", "Sum"
    ]
    try:
        with open(filename, "w", encoding="utf-8") as outfile:
            subprocess.run(cmd, check=True, stdout=outfile)
    except subprocess.CalledProcessError as e:
        print(f"Error running AWS CLI for {metric_name}: {e}")
        sys.exit(1)

def sum_bytes(filename):
    with open(filename, encoding="utf-8") as f:
        data = json.load(f)
    return sum([point["sum"] for point in data.get("metricData", []) if "sum" in point])

def get_all_s3_objects():
    # Use aws cli to page through ALL objects
    folder_counts = defaultdict(int)
    folder_sizes = defaultdict(int)
    total_objects = 0
    total_bytes = 0
    continuation_token = None

    while True:
        cmd = [
            "aws", "s3api", "list-objects-v2",
            "--bucket", S3_BUCKET,
            "--output", "json",
            "--query", "Contents[]"
        ]
        if continuation_token:
            cmd += ["--starting-token", continuation_token]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        objects = json.loads(result.stdout)

        for obj in objects:
            key = obj["Key"]
            size = obj["Size"]
            total_objects += 1
            total_bytes += size
            # Folder group
            parts = key.split("/")
            if len(parts) <= GROUP_BY_DEPTH:
               # Treat any keys with <= N parts as a single group (folder), but exclude files with no "/"
                folder = "/".join(parts[:-1]) if len(parts) > 1 else "(root)"
            else:
                folder = "/".join(parts[:GROUP_BY_DEPTH])

            folder_counts[folder] += 1
            folder_sizes[folder] += size

        # Pagination: check for NextContinuationToken
        # Instead of --starting-token (S3 uses --continuation-token)
        result_full = json.loads(subprocess.run([
            "aws", "s3api", "list-objects-v2",
            "--bucket", S3_BUCKET,
            "--output", "json",
        ] + (["--continuation-token", continuation_token] if continuation_token else []),
        capture_output=True, text=True, check=True).stdout)
        if "NextContinuationToken" in result_full:
            continuation_token = result_full["NextContinuationToken"]
        else:
            break

    return folder_counts, folder_sizes, total_objects, total_bytes

def main():
    print("Querying AWS CLI for network usage (last 7 days)...")
    get_metric("NetworkIn", "bessie_networkin.json")
    get_metric("NetworkOut", "bessie_networkout.json")
    in_bytes = sum_bytes("bessie_networkin.json")
    out_bytes = sum_bytes("bessie_networkout.json")
    print(f"Incoming  (last 7 days): {in_bytes / (1024 ** 3):.2f} GB")
    print(f"Outgoing  (last 7 days): {out_bytes / (1024 ** 3):.2f} GB")
    print(f"Total     (last 7 days): {(in_bytes + out_bytes) / (1024 ** 3):.2f} GB\n")

    print(f"Querying S3 bucket '{S3_BUCKET}' for object counts and storage by folder (depth={GROUP_BY_DEPTH})...")
    folder_counts, folder_sizes, total_objects, total_bytes = get_all_s3_objects()

    print(f"\nTotal objects in '{S3_BUCKET}': {total_objects:,}")
    print(f"Total storage used: {total_bytes / (1024 ** 3):.2f} GB")
    print(f"\nObjects by folder (depth={GROUP_BY_DEPTH}):")
    for folder in sorted(folder_counts):
        size_gb = folder_sizes[folder] / (1024 ** 3)
        print(f"  {folder:40}  {folder_counts[folder]:8,} objects   {size_gb:10.2f} GB")

if __name__ == "__main__":
    main()
