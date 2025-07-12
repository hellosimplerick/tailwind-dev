import React, { useState, useEffect } from "react";
import ZoomModal from "../components/ZoomModal";

export default function ImageAutoBrighten() {
  const [clipLimit, setClipLimit] = useState(2.0);
  const [contrastFactor, setContrastFactor] = useState(1.0);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [applySharpening, setApplySharpening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [inputFile, setInputFile] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (hasSubmitted && processedImage) setModalOpen((prev) => !prev);
      } else if (e.code === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasSubmitted, processedImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setInputFile(file);
    setProcessedImage(null);
    setHasSubmitted(false);
    setRotationDegrees(0);
    setApplySharpening(false);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setOriginalImage(objectUrl);
      setProcessedImage(objectUrl); // immediate before/after display
      setHasSubmitted(true); // show UI even before processing
    } else {
      setOriginalImage(null);
      setProcessedImage(null);
      setHasSubmitted(false);
    }
  };

  const handleProcess = async (overrideSharpen = applySharpening) => {
    if (!inputFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", inputFile);
    formData.append("clip_limit", clipLimit.toString());
    formData.append("contrast_factor", contrastFactor.toString());
    formData.append("rotation_degrees", rotationDegrees.toString());
    formData.append("sharpen", overrideSharpen ? "true" : "false");

    const res = await fetch("/api/auto_shadow_brighten", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setLoading(false);
      alert(`Error: ${res.status}`);
      return;
    }

    const blob = await res.blob();
    const imgUrl = URL.createObjectURL(blob);
    setProcessedImage(imgUrl);
    console.log("Processed Image URL:", imgUrl);
    setLoading(false);
    setHasSubmitted(true);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setInputFile(null);
    setClipLimit(2.0);
    setContrastFactor(1.0);
    setRotationDegrees(0);
    setApplySharpening(false);
    setHasSubmitted(false);
    setModalOpen(false);
  };

  const handleRotate = () => {
    const nextRotation = (rotationDegrees + 90) % 360;
    setRotationDegrees(nextRotation);
    if (hasSubmitted) {
      handleProcess();
    }
  };

  const handleSharpenToggle = () => {
    const newSharpen = !applySharpening;
    setApplySharpening(newSharpen);
    if (hasSubmitted) {
      handleProcess(newSharpen);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black text-gray-800 text-center mb-6">Photo Shadow Fixer</h1>
        <p className="text-xl text-gray-600 text-center mb-10">
          One click, automatic beauty!
        </p>

        {!hasSubmitted && (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-150 shadow-md"
            >
              Select an image to begin
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {originalImage && processedImage && hasSubmitted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 font-bold mb-2">ORIGINAL</span>
              <img
                src={originalImage}
                alt="Original Preview"
                className="rounded-xl border border-gray-200 shadow-lg max-h-[600px] w-full object-contain"
              />
              <button
                onClick={handleReset}
                className="mt-4 text-sm text-white bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-xl shadow-sm"
              >
                Select Different
              </button>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-500 font-bold mb-2">PROCESSED</span>
              {processedImage && (
                <img
                  src={processedImage}
                  alt="Processed Preview"
                  className="rounded-xl border border-green-200 shadow-lg max-h-[600px] w-full object-contain cursor-pointer"
                  onClick={() => setModalOpen(true)}
                />
              )}

              <div className="mt-4 w-full max-w-md flex flex-col items-center">
                <label className="text-gray-700 font-medium mb-2">Shadow Boost</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={clipLimit}
                  onChange={(e) => setClipLimit(parseFloat(e.target.value))}
                  className="w-full accent-green-500"
                  disabled={loading}
                />
                <span className="mt-1 text-sm font-mono text-green-700">{clipLimit.toFixed(1)}</span>

                <label className="text-gray-700 font-medium mt-6 mb-2">Contrast Adjust</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={contrastFactor}
                  onChange={(e) => setContrastFactor(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                  disabled={loading}
                />
                <span className="mt-1 text-sm font-mono text-blue-700">{contrastFactor.toFixed(1)}</span>

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className={`mt-4 w-full px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all duration-150 ${
                    loading ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  Apply
                </button>

                <div className="mt-4 w-full flex flex-row items-center justify-center gap-6">
                  <button
                    onClick={handleRotate}
                    disabled={!inputFile || loading}
                    className="flex items-center gap-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 5V2.5L15 7.5L10 12.5V10C6.69 10 4 12.69 4 16H2C2 11.58 5.58 8 10 8V5Z" />
                    </svg>
                    Rotate 90°
                  </button>

                  <label className="inline-flex items-center gap-2 text-sm text-gray-800 font-medium">
                    <input
                      type="checkbox"
                      checked={applySharpening}
                      onChange={handleSharpenToggle}
                      disabled={loading}
                      className="accent-blue-600"
                    />
                    Apply Sharpening
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalOpen && processedImage && (
        <ZoomModal imageUrl={processedImage} onClose={() => setModalOpen(false)} />
      )}

      <footer className="mt-16 text-center text-gray-400 text-xs tracking-wide">
        © {new Date().getFullYear()} Bessie | Built with Python, FastAPI & React
      </footer>
    </div>
  );
}
