import { useState, useEffect, useRef } from "react";
import { fetchS3Images } from "../services/fetchS3Images";

export default function useImageLoader(BLOCK_SIZE = 25) {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalCount, setTotalCount] = useState(null);
    const [blockOffsets, setBlockOffsets] = useState(new Set());
    const [loadingRest, setLoadingRest] = useState(false);

    const initialLoadStartRef = useRef(performance.now());

    // Initial image + preload
    useEffect(() => {
        let isMounted = true;
        setImages([]);
        setBlockOffsets(new Set());
        setCurrentIndex(0);
        setTotalCount(null);
        initialLoadStartRef.current = performance.now();

        (async () => {
            const data = await fetchS3Images(0, 1);
            if (isMounted && Array.isArray(data.images) && data.images.length > 0) {
                setImages(data.images);
                setTotalCount(data.total ?? null);

                const dataRest = await fetchS3Images(1, BLOCK_SIZE - 1);
                if (isMounted && Array.isArray(dataRest.images)) {
                    setImages((prev) => [...prev, ...dataRest.images]);
                    setBlockOffsets(new Set([0]));
                    setLoadingRest(false);
                }
            }
        })();

        return () => { isMounted = false; };

    }, [BLOCK_SIZE]);

    // Load next blocks as needed
    useEffect(() => {
        if (
            images.length &&
            totalCount !== null &&
            currentIndex >= images.length - 2 &&
            images.length < totalCount
        ) {
            (async () => {
                const data = await fetchS3Images(images.length, BLOCK_SIZE);
                if (Array.isArray(data.images) && data.images.length) {
                    setImages((prev) => [...prev, ...data.images]);
                    setBlockOffsets((prev) => new Set([...prev, images.length]));
                }
            })();
        }

    }, [currentIndex, images, totalCount, BLOCK_SIZE]);

    return {
        images,
        setImages,
        currentIndex,
        setCurrentIndex,
        totalCount,
        loadingRest,
        setLoadingRest,
        blockOffsets,
        setBlockOffsets,
        initialLoadStartRef,
    };
}
