import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ImageMapViewer from "./ImageMapViewer";

// ==========================================
// Component: SmartMap
// Description: Shows map functionality only,
// layout identical to ImageManagement.jsx
// ==========================================

export default function SmartMap() {
  const { original_name } = useParams();

  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Fetch image metadata using original_name from URL ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/images/by-original-name/${encodeURIComponent(original_name)}`);
        if (!res.ok) throw new Error("Image not found.");
        const data = await res.json();
        setImageData(data);
      } catch (err) {
        setError(err.message || "Fetch failed.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [original_name]);

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (loading || !imageData) return <div className="p-4">Loading map data...</div>;

  return (
    <div className="flex flex-row w-full h-full p-4 gap-6">
      
      {/* === LEFT COLUMN (empty, preserves layout) === */}
      <div className="w-[40%] flex flex-col items-center">
        {/* Intentionally left blank to match ImageManagement.jsx layout */}
      </div>

      {/* === RIGHT COLUMN: Map Viewer === */}
      <div className="flex-1 h-[calc(100vh-64px)] flex flex-col">
        <ImageMapViewer
          gps_lat={imageData.gps_lat}
          gps_lon={imageData.gps_lon}
          image_id={imageData.id}
        />
      </div>
    </div>
  );
}
// === END COMPONENT: SmartMap ===
