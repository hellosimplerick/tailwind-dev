import React, { useEffect, useState } from "react";
import useImageById from "../hooks/useImageById";
import ImageMapViewer from "./ImageMapViewer";

// ==========================================
// Component: ImageManagement
// Description: Displays an image with rotation and "magic" actions,
// plus a map interface to adjust and view GPS location.
// ==========================================

export default function ImageManagement() {
  // === Load image and metadata from backend via custom hook ===
  const { image, id, error, loading: imageLoading } = useImageById();

  // === Local State: Only rotation is preserved now ===
  const [rotation, setRotation] = useState(0);

  // === Construct the full image URL for fetching the image from FastAPI ===
  const fullImageUrl = `/api/image/${id}/full`;

  // ==========================================
  // Effect: Reset rotation when new image is loaded
  // ==========================================
  useEffect(() => {
    setRotation(0);
  }, [id]);
  // === END: Image change effect ===

  // ==========================================
  // Function: handleRotate
  // Description: Increments image rotation in 90° steps
  // ==========================================
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };
  // === END: handleRotate ===

  // ==========================================
  // Function: handleReset
  // Description: Resets the rotation to default (0°)
  // ==========================================
  const handleReset = () => {
    setRotation(0);
  };
  // === END: handleReset ===

  // ==========================================
  // Function: handleFeelinLucky
  // Description: Placeholder alert for the "Make Magic" button
  // ==========================================
  const handleFeelinLucky = () => {
    alert("✨ Magic coming soon!");
  };
  // === END: handleFeelinLucky ===

  // ==========================================
  // Function: handleReturnToGallery
  // Description: Navigates back to the root/homepage
  // ==========================================
  const handleReturnToGallery = () => {
    window.location.href = "/";
  };
  // === END: handleReturnToGallery ===

  // === Handle loading and error states before rendering main UI ===
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (imageLoading || !image) return <div className="p-4">Loading image...</div>;

  // ==========================================
  // Main Render Block
  // ==========================================
  return (
    <div className="flex flex-row w-full h-full p-4 gap-6">
      
      {/* === LEFT COLUMN: Image + Controls === */}
      <div className="w-[40%] flex flex-col items-center">
        
        {/* === Image Preview Box with rotation applied === */}
        <div className="w-full bg-white border rounded shadow h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={fullImageUrl}
            alt="Preview"
            style={{ transform: `rotate(${rotation}deg)` }}
            className="h-full w-auto object-cover max-h-[60vh] transition-transform"
          />
        </div>

        {/* === Image Control Buttons === */}
        <div className="mt-6 w-full flex flex-row items-center gap-4 justify-between">
          <button
            onClick={handleRotate}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Rotate 90°
          </button>

          <button
            onClick={handleReset}
            className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200 text-sm"
          >
            Reset
          </button>

          <button
            onClick={handleFeelinLucky}
            className="bg-green-100 px-4 py-2 rounded hover:bg-green-200 text-sm"
          >
            Make Magic
          </button>
        </div>

        {/* === Navigation Button: Return to gallery/home === */}
        <div className="mt-8 w-full flex justify-end">
          <button
            onClick={handleReturnToGallery}
            className="bg-gray-700 text-white text-sm px-4 py-2 rounded hover:bg-gray-800"
          >
            Return Home
          </button>
        </div>
      </div>

      {/* === RIGHT COLUMN: Map Viewer Component === */}
      <div className="flex-1 h-[calc(100vh-64px)] flex flex-col">
        <ImageMapViewer
          gps_lat={image.gps_lat}
          gps_lon={image.gps_lon}
          image_id={id}
        />
      </div>
    </div>
  );
}
// === END COMPONENT: ImageManagement ===
