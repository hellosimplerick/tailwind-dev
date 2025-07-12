// same imports...
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import ImageMapViewer from "./ImageMapViewer";

export default function SmartPhoto() {
  // ⏩ all same useState declarations...
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [imageUuid, setImageUuid] = useState(null);
  const [faces, setFaces] = useState([]);
  const [existingPeople, setExistingPeople] = useState([]);
  const [selectedFaceId, setSelectedFaceId] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [renderedSize, setRenderedSize] = useState({ width: 1, height: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [shadowBoost, setShadowBoost] = useState(0.0);
  const [sharpen, setSharpen] = useState(false);
  const [autoColorFix, setAutoColorFix] = useState(false);
  const [enhancementLoading, setEnhancementLoading] = useState(false);

  const imageRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      const isEditable = tag === "input" || tag === "textarea" || tag === "select";
      if ((e.key === "f" || e.key === "F") && !isEditable) {
        e.preventDefault();
        setShowBoxes((prev) => !prev);
      }
      if ((e.key === " " || e.key === "Spacebar") && !isEditable) {
        e.preventDefault();
        setIsModalOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchPeople = async () => {
    try {
      const res = await axios.get("/api/persons");
      setExistingPeople(res.data);
    } catch (err) {
      console.error("Failed to fetch people", err);
    }
  };

  const fetchFaces = async () => {
    try {
      const res = await axios.get(`/api/images/by-original-name/${imageName}/faces`);
      setFaces(res.data);
      setStatusMessage(
        res.data.length === 0
          ? "No faces detected in this photo."
          : res.data.every(f => !f.label || f.label === "Unknown")
          ? "No known faces yet. Click a box to label."
          : ""
      );
    } catch (err) {
      console.error("Failed to fetch faces", err);
      setStatusMessage("No faces detected in this photo.");
    }
  };

  const fetchImageUrl = async () => {
    try {
      const res = await axios.get("/api/image/signed-url", {
        params: { key: `lat-long/${imageName}` },
      });
      setImageUrl(res.data.url);
    } catch (err) {
      console.error("Failed to load image URL", err);
    }
  };

  const handleLoad = async () => {
    setSelectedFaceId(null);
    setFaces([]);
    setImageUrl(null);
    setImageUuid(null);
    setStatusMessage("");
    setIsLoading(true);

    if (!imageName.endsWith(".jpg")) {
      alert("Image name must end with .jpg");
      setIsLoading(false);
      return;
    }

    try {
      const uuidRes = await axios.get(`/api/images/by-original-name/${imageName}`);
      setImageUuid(uuidRes.data.id);
    } catch (err) {
      alert("Could not find UUID for image.");
      setIsLoading(false);
      return;
    }

    await Promise.all([fetchFaces(), fetchImageUrl()]);
    inputRef.current?.blur();
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (img) {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setRenderedSize({ width: img.offsetWidth, height: img.offsetHeight });
    }
  };

  const handleFaceClick = (face) => {
    setSelectedFaceId(face.face_id);
    setLabelInput(face.label || "");
    const matched = existingPeople.find((p) => p.label === face.label);
    setSelectedPersonId(matched?.id || null);
  };

  const handleSubmit = async () => {
    const face = faces.find((f) => f.face_id === selectedFaceId);
    if (!face) return;

    let personId = selectedPersonId;

    if (!personId && labelInput.trim()) {
      const res = await axios.post("/api/persons", {
        label: labelInput.trim(),
        created_by: "6b11c18f-4d51-401d-a01c-32aa1c39c62b",
      });
      personId = res.data.id;
      await fetchPeople();
    }

    if (!personId) {
      alert("Select or create a person label first.");
      return;
    }

    try {
      await axios.post("/api/face-labels", {
        face_id: face.face_id,
        person_id: personId,
        set_by: "6b11c18f-4d51-401d-a01c-32aa1c39c62b"
      });
      await fetchFaces();
      setSelectedFaceId(null);
      setLabelInput("");
      setSelectedPersonId(null);
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to label face", err);
      alert("Failed to label face.");
    }
  };

  const applyEnhancement = async () => {
    if (!imageUuid) {
      alert("Missing image UUID. Load an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image_uuid", imageUuid);
    formData.append("contrast_factor", 1.3);
    formData.append("clip_limit", 1.2);
    formData.append("sharpen", "true");
    formData.append("shadow_boost", 2.5);
    formData.append("auto_color_fix", "true");

    try {
      const response = await fetch("http://127.0.0.1:8000/auto_shadow_brighten", {
        method: "POST",
        body: formData,
      });
      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      setProcessedImage(imgUrl);
    } catch (err) {
      alert("Enhancement failed: " + err.message);
    }
  };

  const scale = renderedSize.width / imageSize.width;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={processedImage || imageUrl}
            alt="Fullscreen"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleLoad(); }} className="mb-6 flex items-center space-x-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter image name (e.g., ris123.jpg)"
          className="p-2 border w-full"
          value={imageName}
          onChange={(e) => setImageName(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded text-white ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
          }`}
        >
          {isLoading ? "Loading..." : "Load"}
        </button>
      </form>

      {imageUrl && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 relative">
            <div className="relative inline-block bg-white border rounded shadow">
              <img
                ref={imageRef}
                onLoad={handleImageLoad}
                src={processedImage || imageUrl}
                alt="Loaded"
                style={{ transform: `rotate(${rotation}deg)` }}
                className="max-h-[60vh] w-auto object-contain transition-transform"
              />
              {showBoxes &&
                faces.map((face) => {
                  const [x, y, w, h] = face.box;
                  const isSelected = selectedFaceId === face.face_id;
                  return (
                    <div
                      key={face.face_id}
                      onClick={() => handleFaceClick(face)}
                      className={`absolute border-2 text-xs text-white font-semibold bg-black bg-opacity-40 flex items-center justify-center cursor-pointer ${
                        isSelected ? "border-green-500" : "border-red-500"
                      }`}
                      style={{
                        left: `${Math.max(0, x * scale)}px`,
                        top: `${Math.max(0, y * scale)}px`,
                        width: `${w * scale}px`,
                        height: `${h * scale}px`,
                      }}
                      title={face.label || "Unlabeled"}
                    >
                      {face.label && face.label !== "Unknown" && (
                        <span className="px-1">{face.label}</span>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* ⬇️ ONLY BUTTONS BELOW IMAGE */}
            <div className="mt-4 flex gap-4">
              <button onClick={() => setRotation((r) => (r + 90) % 360)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Rotate 90°</button>
              <button onClick={() => {
                setBrightness(1.0); setContrast(1.0); setShadowBoost(0.0);
                setSharpen(false); setAutoColorFix(false); setRotation(0);
                setProcessedImage(null);
              }} className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Reset</button>
              <button onClick={applyEnhancement} className="bg-green-100 px-4 py-2 rounded hover:bg-green-200">Make Magic</button>
            </div>
          </div>

          <div className="col-span-1 space-y-4">
<ImageMapViewer
          gps_lat={image.gps_lat}
          gps_lon={image.gps_lon}
          image_id={id}
        />

            {statusMessage && <p className="text-gray-500">{statusMessage}</p>}
            {showSavedMessage && <div className="text-green-600 font-medium">✅ Saved!</div>}
            {selectedFaceId && (
              <div className="border border-gray-300 p-4 rounded bg-gray-50 shadow">
                <h2 className="text-sm font-semibold mb-2">Tag Selected Face</h2>
                <select className="mb-2 p-2 border w-full" value={selectedPersonId || ""} onChange={(e) => setSelectedPersonId(e.target.value || null)}>
                  <option value="">Select existing person</option>
                  {existingPeople.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
                <input type="text" placeholder="Or type new label" className="mb-2 p-2 border w-full" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} />
                <div className="flex space-x-2">
                  <button onClick={handleSubmit} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                  <button onClick={() => setSelectedFaceId(null)} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
