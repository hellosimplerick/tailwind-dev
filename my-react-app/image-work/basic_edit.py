import sys
from pathlib import Path
from PIL import Image, ImageEnhance

def adjust_image(input_path, brightness=1.0, contrast=1.0):
    img = Image.open(input_path)

    # Brightness
    img = ImageEnhance.Brightness(img).enhance(brightness)
    # Contrast
    img = ImageEnhance.Contrast(img).enhance(contrast)

    # Build output filename
    input_path = Path(input_path)
    output_name = (
        input_path.stem +
        f"--bright{brightness:.2f}--cont{contrast:.2f}" +
        input_path.suffix
    )
    output_path = input_path.parent / output_name
    img.save(output_path)
    print(f"Saved edited image: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python basic_edit.py input.jpg [brightness] [contrast]")
        sys.exit(1)
    in_path = sys.argv[1]
    brightness = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    contrast = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
    adjust_image(in_path, brightness, contrast)
