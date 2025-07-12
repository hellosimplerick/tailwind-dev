import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";

export default function MemoryLanePage() {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [index, setIndex] = useState(0);
    const [autoMode, setAutoMode] = useState(true);
    const [direction, setDirection] = useState("right");
    const timeoutRef = useRef(null);

    // Fetch images from backend
    useEffect(() => {
        fetch("/api/images?offset=0&limit=1000")
            .then((res) => res.json())
            .then((data) => {
                const sortedImages = data.images.map((img) => ({
                    id: img.id,
                    url: `/api/images/${img.id}/full`, // ✅ FIXED LINE
                    original_name: img.original_name,
                }));
                setImages(sortedImages);
            })
            .catch((err) => console.error("Image fetch failed:", err));
    }, []);

    const nextImage = () => {
        setDirection("right");
        setIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setDirection("left");
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    useEffect(() => {
        if (autoMode && images.length > 0) {
            timeoutRef.current = setTimeout(() => {
                nextImage();
            }, 4500);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [index, autoMode, images]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === " ") {
                setAutoMode((prev) => !prev);
            } else if (e.key === "ArrowRight") {
                setAutoMode(false);
                nextImage();
            } else if (e.key === "ArrowLeft") {
                setAutoMode(false);
                prevImage();
            } else if (e.key === "h") {
                navigate("/");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [images]);

    if (images.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <p className="text-xl">Loading photos...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="relative w-full max-w-4xl h-[80vh] overflow-hidden">
                {images.map((img, i) => (
                    <img
                        key={img.id}
                        src={img.url}
                        alt={img.original_name}
                        className={classNames(
                            "absolute w-full h-full object-contain transition-all duration-700 ease-in-out",
                            {
                                "translate-x-0 z-10": i === index,
                                "-translate-x-full z-0": i !== index && direction === "right",
                                "translate-x-full z-0": i !== index && direction === "left",
                            }
                        )}
                        style={{ top: 0, left: 0 }}
                    />
                ))}
            </div>
        </div>
    );
}
