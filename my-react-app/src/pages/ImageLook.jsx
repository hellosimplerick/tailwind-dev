import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import ImageMapViewer from "./ImageMapViewer";

export default function ImageLook() {
  const { id } = useParams(); // ✅ support /imagelook/:id
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState(null);
  const [faces, setFaces] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedFaceId, setSelectedFaceId] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });
  const [renderedSize, setRenderedSize] = useState({ width: 1, height: 1 });
  const [showBoxes, setShowBoxes] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [magicEnabled, setMagicEnabled] = useState(false);

  const imageRef = useRef();
  const inputRef = useRef();
  const scale = renderedSize.width / imageSize.width;

  // [JWT PATCH] Utility to return headers for Axios calls
  const jwtAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      const isEditable = ["input", "textarea", "select"].includes(tag);
      if ((e.key === "f" || e.key === "F") && !isEditable) {
        e.preventDefault();
        setShowBoxes((prev) => !prev);
      }
      if (e.code === "Space" && !isEditable) {
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

  const handleImageLoad = () => {
    const img = imageRef.current;
    if (img) {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setRenderedSize({ width: img.offsetWidth, height: img.offsetHeight });
    }
  };

  const loadByOriginalName = async (name) => {
    setIsLoading(true);
    try {
      // [JWT PATCH] All requests use JWT header if present
      const [imgRes, urlRes, facesRes, peopleRes] = await Promise.all([
        axios.get(`/api/images/by-original-name/${name}`, { headers: jwtAuthHeaders() }),
        axios.get(`/api/image/signed-url`, { params: { key: `lat-long/${name}` }, headers: jwtAuthHeaders() }),
        axios.get(`/api/images/by-original-name/${name}/faces`, { headers: jwtAuthHeaders() }),
        axios.get(`/api/persons`, { headers: jwtAuthHeaders() }),
      ]);

      setImageData(imgRes.data);
      setImageUrl(urlRes.data.url);
      setFaces(facesRes.data);
      setPeople(peopleRes.data);

      setStatusMessage(
        facesRes.data.length === 0
          ? "No faces detected."
          : facesRes.data.every(f => !f.label || f.label === "Unknown")
            ? "No known faces yet. Click a box to label."
            : ""
      );
    } catch (err) {
      console.error("Failed to load by name:", err);
      alert("Failed to load image or metadata.");
    } finally {
      setIsLoading(false);
      inputRef.current?.blur();
    }
  };

  const loadById = async (uuid) => {
    setIsLoading(true);
    try {
      // [JWT PATCH] All requests use JWT header if present
      const [imgRes, facesRes, peopleRes] = await Promise.all([
        axios.get(`/api/images/${uuid}`, { headers: jwtAuthHeaders() }),
        axios.get(`/api/images/${uuid}/faces`, { headers: jwtAuthHeaders() }),
        axios.get(`/api/persons`, { headers: jwtAuthHeaders() }),
      ]);

      const urlRes = await axios.get(`/api/image/signed-url`, {
        params: { key: imgRes.data.s3_key },
        headers: jwtAuthHeaders(), // [JWT PATCH]
      });

      setImageData(imgRes.data);
      setImageUrl(urlRes.data.url);
      setFaces(facesRes.data);
      setPeople(peopleRes.data);

      setStatusMessage(
        facesRes.data.length === 0
          ? "No faces detected."
          : facesRes.data.every(f => !f.label || f.label === "Unknown")
            ? "No known faces yet. Click a box to label."
            : ""
      );
    } catch (err) {
      console.error("Failed to load by ID:", err);
      alert("Failed to load image or metadata.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadById(id);
  }, [id]);

  const handleLoad = () => {
    if (!imageName.endsWith(".jpg")) {
      alert("Image name must end with .jpg");
      return;
    }
    loadByOriginalName(imageName);
  };

  const handleFaceClick = (face) => {
    setSelectedFaceId(face.face_id);
    setLabelInput(face.label || "");
    const matched = people.find((p) => p.label === face.label);
    setSelectedPersonId(matched?.id || "");
  };

  const handleSubmit = async () => {
    if (!selectedFaceId || (!selectedPersonId && !labelInput.trim())) {
      alert("Please select or enter a label.");
      return;
    }

    let personId = selectedPersonId;

    if (!personId && labelInput.trim()) {
      // [JWT PATCH] Use JWT for all POSTs
      const res = await axios.post("/api/persons", {
        label: labelInput.trim(),
        created_by: "6b11c18f-4d51-401d-a01c-32aa1c39c62b",
      }, { headers: jwtAuthHeaders() });
      personId = res.data.id;
      const peopleRes = await axios.get("/api/persons", { headers: jwtAuthHeaders() });
      setPeople(peopleRes.data);
    }

    try {
      await axios.post("/api/face-labels", {
        face_id: selectedFaceId,
        person_id: personId,
        set_by: "6b11c18f-4d51-401d-a01c-32aa1c39c62b",
      }, { headers: jwtAuthHeaders() });

      const updatedFaces = await axios.get(
        `/api/images/${imageData.id}/faces`,
        { headers: jwtAuthHeaders() }
      );
      setFaces(updatedFaces.data);
      setSelectedFaceId(null);
      setLabelInput("");
      setSelectedPersonId("");
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 2000);
    } catch (err) {
      console.error("Failed to label face:", err);
      alert("Failed to label face.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLoad();
        }}
        role="form"
        className="mb-6 flex gap-4"
      >
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
          className={`px-4 py-2 rounded text-white ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isLoading ? "Loading…" : "Load"}
        </button>
      </form>

      {imageData && (
        <>
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <img
                src={imageUrl}
                alt="Fullscreen"
                className="max-h-screen max-w-screen object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="relative overflow-hidden">
              <img
                ref={imageRef}
                src={imageUrl}
                onLoad={handleImageLoad}
                alt="Loaded"
                className={`max-h-[60vh] w-auto transition-transform duration-300 ${magicEnabled ? "brightness-110 contrast-125 saturate-150" : ""
                  }`}
                style={{ transform: `rotate(${rotation}deg)` }}
              />

              {showBoxes &&
                faces.map((face) => {
                  const [x, y, w, h] = face.box;
                  const isSelected = face.face_id === selectedFaceId;
                  return (
                    <div
                      key={face.face_id}
                      onClick={() => handleFaceClick(face)}
                      className={`absolute border-2 text-xs text-white font-semibold bg-black bg-opacity-40 flex items-center justify-center cursor-pointer ${isSelected ? "border-green-500" : "border-yellow-400"
                        }`}
                      style={{
                        left: `${x * scale}px`,
                        top: `${y * scale}px`,
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

              <div className="mt-4 grid grid-cols-4 gap-3">
                <button
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                >
                  Rotate
                </button>
                <button
                  className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
                  onClick={() => {
                    setRotation(0);
                    setMagicEnabled(false);
                  }}
                >
                  Reset
                </button>
                <button
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  onClick={() => setMagicEnabled(true)}
                >
                  Make Magic
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                >
                  Return Home
                </button>
              </div>

            </div>

            <div>
              <ImageMapViewer
                gps_lat={imageData.gps_lat}
                gps_lon={imageData.gps_lon}
                image_id={imageData.id}
              />

              {statusMessage && (
                <p className="text-gray-600 mt-4">{statusMessage}</p>
              )}
              {showSavedMessage && (
                <div className="text-green-600 font-semibold mt-4">✅ Saved!</div>
              )}
              {selectedFaceId && (
                <div className="mt-6 border border-gray-300 p-4 rounded bg-gray-50 shadow">
                  <h2 className="text-sm font-semibold mb-2">Tag Selected Face</h2>
                  <select
                    className="mb-2 p-2 border w-full"
                    value={selectedPersonId}
                    onChange={(e) => setSelectedPersonId(e.target.value)}
                  >
                    <option value="">Select existing person</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type new label"
                    className="mb-2 p-2 border w-full"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setSelectedFaceId(null)}
                      className="px-4 py-1 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
