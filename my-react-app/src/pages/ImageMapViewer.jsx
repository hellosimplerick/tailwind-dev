import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const fallbackCoords = { lat: 50.0244, lon: -125.2446 };

export default function ImageMapViewer({ gps_lat, gps_lon, image_id }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const staticMarkerRef = useRef(null); // red pin

  const [mapMode, setMapMode] = useState("static");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const gpsValid =
    gps_lat !== null &&
    gps_lon !== null &&
    gps_lat !== undefined &&
    gps_lon !== undefined &&
    parseFloat(gps_lat) !== 0 &&
    parseFloat(gps_lon) !== 0;

  const isStatic = mapMode === "static";
  const isLoading = mapMode === "loading";
  const isEdit = mapMode === "edit";

  useEffect(() => {
    const shouldInitMap = isEdit || isStatic;
    if (!shouldInitMap) return;

    setMapLoaded(false);

    const centerCoords = gpsValid
      ? [parseFloat(gps_lon), parseFloat(gps_lat)]
      : [fallbackCoords.lon, fallbackCoords.lat];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: centerCoords,
      zoom: 12,
    });

    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);

      if (isStatic && gpsValid) {
        // Drop a red pin in static view if GPS exists
        staticMarkerRef.current = new mapboxgl.Marker({ color: "red" })
          .setLngLat(centerCoords)
          .addTo(map);
      }

    
    });

    return () => {
      if (staticMarkerRef.current) {
        staticMarkerRef.current.remove();
        staticMarkerRef.current = null;
      }
      map.remove();
    };
  }, [mapMode, gps_lat, gps_lon]);

  useEffect(() => {
    if (mapMode === "loading") {
      requestAnimationFrame(() => {
        setTimeout(() => {
          setMapMode("edit");
        }, 150);
      });
    }
  }, [mapMode]);

  const handleAddLocation = () => {
    setMapMode("loading");
  };

  const handleCancel = () => {
    setMapMode("static");
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${mapboxgl.accessToken}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.features?.length) {
        const [lon, lat] = data.features[0].center;
        mapRef.current?.flyTo({ center: [lon, lat], zoom: 12 });
      } else {
        alert("No location found.");
      }
    } catch (err) {
      alert("Search error: " + err.message);
    }
  };

  const handleSave = async () => {
    if (!mapRef.current || !image_id) return;

    const center = mapRef.current.getCenter();
    const payload = {
      gps_lat: center.lat.toString(),
      gps_lon: center.lng.toString(),
    };

    try {
      const res = await fetch(`/api/images/${image_id}/gps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save GPS");

      window.location.reload();
    } catch (err) {
      alert("Save error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-w-[500px]">
      <div className="relative w-full">
        {/* === Shared relative wrapper === */}
        <div className="relative w-full">
          {/* === Mapbox container === */}
          {(isEdit || isStatic) && (
            <div
              ref={mapContainerRef}
              key={`${mapMode}-${image_id}`}
              className={`rounded overflow-hidden shadow border w-full ${
                isEdit ? "h-[500px]" : "max-w-[500px] h-[300px]"
              } transition-all duration-300`}
            />
          )}

          {/* === Blue pin overlay above Mapbox === */}
          {isEdit && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-blue-600 drop-shadow-lg"
                fill="currentColor"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z" />
              </svg>
            </div>
          )}

          {/* === Loading screen === */}
          {isLoading && (
            <div className="w-full h-[500px] rounded overflow-hidden shadow border flex items-center justify-center bg-white text-gray-600 font-medium text-sm">
              Loading map...
            </div>
          )}

          {/* === No GPS label === */}
          {isStatic && !gpsValid && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-red-700 font-semibold text-sm z-10 pointer-events-none">
              No valid GPS location found
            </div>
          )}
        </div>
      </div>

      {isStatic && (
        <div className="w-full max-w-[500px] text-center z-10">
          <button
            onClick={handleAddLocation}
            className="mt-2 px-4 py-2 text-sm bg-blue-800 text-white rounded shadow hover:bg-blue-900"
          >
            Adjust Location
          </button>
        </div>
      )}

      {isEdit && (
        <div className="w-full space-y-4 border-t pt-4 bg-white z-10">
          <div className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchLocation()}
              placeholder="Search address, city, or place"
              className="flex-1 px-3 py-2 border rounded shadow"
            />
            <button
              onClick={handleSearchLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go
            </button>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Location
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
