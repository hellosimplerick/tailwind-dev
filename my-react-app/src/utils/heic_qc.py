import os
import pillow_heif
from PIL import Image

pillow_heif.register_heif_opener()

for fname in os.listdir('.'):
    if fname.lower().endswith('.heic'):
        try:
            im = Image.open(fname)
            im = im.convert("RGB")
            outname = fname.replace('.heic', '.jpg').replace('.HEIC', '.jpg')
            im.save(outname, "JPEG", quality=90)
            print(f"Converted {fname} -> {outname}")
        except Exception as e:
            print(f"FAILED: {fname}: {type(e).__name__} {str(e)}")
