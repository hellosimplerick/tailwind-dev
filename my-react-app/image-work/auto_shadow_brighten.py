import sys
from pathlib import Path
import cv2
import numpy as np

def auto_shadow_brighten(input_path, clip_limit=2.0, tile_grid_size=(8, 8), output_compare=True):
    img = cv2.imread(str(input_path))
    if img is None:
        print(f"Failed to read {input_path}")
        return

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    input_path = Path(input_path)
    base = input_path.stem
    suffix = input_path.suffix

    # Save CLAHE result
    result_path = input_path.parent / f"{base}--clahe{clip_limit}-tile{tile_grid_size[0]}x{tile_grid_size[1]}{suffix}"
    cv2.imwrite(str(result_path), final)
    print(f"Saved: {result_path}")

    # Output side-by-side comparison
    if output_compare:
        side_by_side = np.hstack((img, final))
        compare_path = input_path.parent / f"{base}--CLAHE-sidebyside{suffix}"
        cv2.imwrite(str(compare_path), side_by_side)
        print(f"Saved side-by-side: {compare_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python auto_shadow_brighten.py input.jpg [clip_limit] [tile_size]")
        sys.exit(1)
    in_path = sys.argv[1]
    clip_limit = float(sys.argv[2]) if len(sys.argv) > 2 else 2.0
    tile_size = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    auto_shadow_brighten(in_path, clip_limit, (tile_size, tile_size), output_compare=True)
