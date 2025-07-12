// /src/pages/purge.jsx

import React, { useEffect, useState, useCallback } from "react";

const PAGE_SIZE = 20000;
const GRID_ROWS = 6;
const GRID_COLS = 8;
const GRID_SIZE = GRID_ROWS * GRID_COLS;
const STORAGE_KEY = "purgePageIdx";

export default function Purge() {
  const [images, setImages] = useState([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/images/clustered?offset=0&limit=${PAGE_SIZE}`);
        const json = await res.json();
        setImages(json.images || []);
      } catch (err) {
        console.error("Failed to load clustered images", err);
      }
    };
    fetchImages();

    const storedPage = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    if (!isNaN(storedPage)) {
      setPageIdx(storedPage);
    }
  }, []);

  const start = pageIdx * GRID_SIZE;
  const end = start + GRID_SIZE;
  const currentImages = images.slice(start, end);

  const toggleCheckbox = (imgId) => {
    setSelected((prev) => ({
      ...prev,
      [imgId]: !prev[imgId],
    }));
  };

  const handleExecute = async () => {
    const targets = currentImages.filter((img) => selected[img.id]);
    for (const img of targets) {
      try {
        await fetch("/api/images/log-thumbnail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ s3_key: img.s3_key }),
        });
      } catch (err) {
        console.error(`Failed to log ${img.s3_key}`, err);
      }
    }
    // Clear selected checkboxes for this page
    setSelected((prev) => {
      const newSelected = { ...prev };
      targets.forEach((img) => delete newSelected[img.id]);
      return newSelected;
    });
    // Persist page index
    localStorage.setItem(STORAGE_KEY, String(pageIdx));
  };

  const handleNext = () => {
    const nextPage = pageIdx + 1;
    const nextStart = nextPage * GRID_SIZE;
    if (nextStart < images.length) {
      setPageIdx(nextPage);
      localStorage.setItem(STORAGE_KEY, String(nextPage));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>
        Purge Interface — Page {pageIdx + 1} / {Math.ceil(images.length / GRID_SIZE)}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gap: 12,
          marginBottom: 32,
        }}
      >
        {currentImages.map((img) => (
          <div
            key={img.id}
            style={{
              position: "relative",
              background: "#222",
              borderRadius: 6,
              padding: 4,
              boxShadow: "0 0 8px #0007",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={img.thumbnail_url || img.presigned_url}
              alt={img.original_name}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: 4,
                background: "#333",
              }}
              loading="lazy"
            />
            <label style={{ marginTop: 6, fontSize: 12 }}>
              <input
                type="checkbox"
                checked={!!selected[img.id]}
                onChange={() => toggleCheckbox(img.id)}
                style={{ marginRight: 6 }}
              />
              {img.original_name}
            </label>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <button
          onClick={handleExecute}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            background: "#2ecc71",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ✅ Execute (log selected)
        </button>

        <button
          onClick={handleNext}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            background: "#3498db",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
          }}
          disabled={end >= images.length}
        >
          ⏭️ Next Page
        </button>
      </div>
    </div>
  );
}
