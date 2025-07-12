// /src/pages/ImageGallery.jsx

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import splashImg from "../assets/splash.gif";
import ModalImageViewer from "../components/ModalImageViewer";
import PagingControls from "../components/PagingControls";
import ThumbnailCell from "../components/ThumbnailCell";

const PAGE_SIZE = 30;
const COLS = 6;
const ROWS = 5;
const THUMB_HEIGHT = 120;

export default function ImageGallery() {
  const [images, setImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("numerical");
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [modalIdx, setModalIdx] = useState(null);

  const gridRefs = useRef([]);
  const navigate = useNavigate();

  // 🚨 JWT-AWARE: Load images with Authorization header
  const loadImages = async (viewMode, currentOffset = 0) => {
    setLoading(true);
    try {
      const route =
        viewMode === "cluster"
          ? `/api/images/clustered?offset=${currentOffset}&limit=${PAGE_SIZE}`
          : `/api/images?offset=${currentOffset}&limit=${PAGE_SIZE}`;

      // --- NEW: Attach JWT if present ---
      const accessToken = localStorage.getItem("access_token");
      const res = await fetch(route, {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      });

      if (res.status === 401 || res.status === 403) {
        setImages([]);
        setTotal(0);
        setOffset(currentOffset);
        setLoading(false);
        alert("You are not authorized to view this gallery. Please sign in.");
        return;
      }

      const json = await res.json();
      setImages(json.images || []);
      setTotal(json.total || 0);
      setOffset(currentOffset);
    } catch (err) {
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages(mode, 0);
    // eslint-disable-next-line
  }, [mode]);

  useEffect(() => {
    if (selectedIdx !== null && gridRefs.current[selectedIdx]) {
      gridRefs.current[selectedIdx].focus();
    }
  }, [selectedIdx, mode, offset]);

  useEffect(() => {
    function handleKey(e) {
      if (modalIdx !== null) return;
      let idx = selectedIdx ?? 0;
      if (e.key === "ArrowRight") {
        idx = (idx + 1) % images.length;
        setSelectedIdx(idx);
        setTimeout(() => gridRefs.current[idx]?.focus(), 0);
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        idx = (idx - 1 + images.length) % images.length;
        setSelectedIdx(idx);
        setTimeout(() => gridRefs.current[idx]?.focus(), 0);
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        idx = (idx + COLS) % images.length;
        setSelectedIdx(idx);
        setTimeout(() => gridRefs.current[idx]?.focus(), 0);
        e.preventDefault();
      }
      if (e.key === "ArrowUp") {
        idx = (idx - COLS + images.length) % images.length;
        setSelectedIdx(idx);
        setTimeout(() => gridRefs.current[idx]?.focus(), 0);
        e.preventDefault();
      }
      if (e.key === "c" || e.key === "C") {
        if (mode !== "cluster") {
          setMode("cluster");
          setOffset(0);
          setSelectedIdx(null);
        }
      }
      if (e.key === "n" || e.key === "N") {
        if (mode !== "numerical") {
          setMode("numerical");
          setOffset(0);
          setSelectedIdx(null);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIdx, images, modalIdx, mode]);

  const nextPage = () => {
    if (offset + PAGE_SIZE < total) {
      loadImages(mode, offset + PAGE_SIZE);
      setSelectedIdx(null);
    }
  };

  const prevPage = () => {
    if (offset - PAGE_SIZE >= 0) {
      loadImages(mode, offset - PAGE_SIZE);
      setSelectedIdx(null);
    }
  };

  const jumpToPage = (pageNum) => {
    const newOffset = (pageNum - 1) * PAGE_SIZE;
    if (newOffset >= 0 && newOffset < total) {
      loadImages(mode, newOffset);
      setSelectedIdx(null);
    }
  };

  function handleThumbClick(idx) {
    setSelectedIdx(idx);
    setModalIdx(idx);
  }

  function handleThumbKey(e, idx) {
    if (e.key === "Enter") {
      navigate(`/imagelook/${images[idx].id}`);
      e.preventDefault();
    }
  }

  useEffect(() => {
    if (modalIdx === null) return;
    function handleModalKey(e) {
      if (e.key === "ArrowRight") {
        setModalIdx((prev) => (prev + 1) % images.length);
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") {
        setModalIdx((prev) => (prev - 1 + images.length) % images.length);
        e.preventDefault();
      }
      if (e.key === "Escape" || e.key === " " || e.key === "Spacebar") {
        setModalIdx(null);
        setTimeout(() => {
          if (selectedIdx != null) gridRefs.current[selectedIdx]?.focus();
        }, 0);
        e.preventDefault();
      }
      if (e.key === "Enter" && modalIdx !== null) {
        /*
        navigate(`/imagelook/${images[modalIdx].id}`);
        */
      }
    }
    window.addEventListener("keydown", handleModalKey);
    return () => window.removeEventListener("keydown", handleModalKey);
  }, [modalIdx, images, selectedIdx, navigate]);

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          boxSizing: "border-box",
          padding: 0,
          margin: 0,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 24,
            marginLeft: 24,
          }}
        >
          Contact Sheet Gallery
          <span
            style={{
              fontSize: 15,
              fontWeight: 400,
              marginLeft: 18,
              color: "#777",
            }}
          >
            [Mode: {mode}] &nbsp;
            <span style={{ fontWeight: 300 }}>
              (Press 'C' for Cluster, 'N' for Numerical)
            </span>
          </span>
        </h1>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <img
              src={splashImg}
              alt="Loading..."
              style={{
                width: 360,
                maxWidth: "90vw",
                maxHeight: "50vh",
                display: "block",
                margin: "0 auto",
                borderRadius: 16,
                boxShadow: "0 8px 32px #0003",
                background: "#fff",
              }}
            />
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, auto)`,
                gap: 8,
                maxWidth: 1200,
                margin: "0 auto",
                paddingBottom: 24,
              }}
            >
              {images.map((img, i) => (
                <ThumbnailCell
                  key={img.id || i}
                  img={img}
                  selected={selectedIdx === i}
                  refCallback={(el) => (gridRefs.current[i] = el)}
                  onClick={() => handleThumbClick(i)}
                  onKeyDown={(e) => handleThumbKey(e, i)}
                  onFocus={() => setSelectedIdx(i)}
                  idx={i}
                  thumbHeight={THUMB_HEIGHT}
                  isClusterMode={mode === "cluster"}
                />
              ))}
            </div>
            <PagingControls
              onPrev={prevPage}
              onNext={nextPage}
              onPageJump={jumpToPage}
              prevDisabled={offset === 0}
              nextDisabled={offset + PAGE_SIZE >= total}
              currentPage={Math.floor(offset / PAGE_SIZE) + 1}
              totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            />
          </>
        )}

        <ModalImageViewer
          images={images}
          modalIdx={modalIdx}
          onClose={() => setModalIdx(null)}
          onPrev={() =>
            setModalIdx((prev) => (prev - 1 + images.length) % images.length)
          }
          onNext={() =>
            setModalIdx((prev) => (prev + 1) % images.length)
          }
        />
      </div>
    </>
  );
}
