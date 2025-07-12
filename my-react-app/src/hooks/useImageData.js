import { useState, useCallback, useEffect } from "react";

// PAGE_SIZE, used by both modes, so pass as arg to hook
export default function useImageData(pageSize = 30) {
    const [images, setImages] = useState([]);
    const [allClusterImages, setAllClusterImages] = useState([]); // cluster mode cache
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("numerical");

    // fetcher: numerical or cluster, updates all relevant state
    const loadImages = useCallback((viewMode, pageOffset = 0) => {
        setLoading(true);
        setOffset(pageOffset);

        if (viewMode === "cluster") {
            if (allClusterImages.length === 0) {
                fetch("/api/images/clusters")
                    .then((res) => res.json())
                    .then((clusterList) => {
                        const sortedClusters = [...clusterList].sort(
                            (a, b) => b.images.length - a.images.length
                        );
                        const flatImages = sortedClusters.flatMap((cluster) => cluster.images);
                        setAllClusterImages(flatImages);
                        setTotal(flatImages.length);
                    })
                    .finally(() => setLoading(false));
            } else {
                setTotal(allClusterImages.length);
                setLoading(false);
            }
        } else {
            fetch(`/api/images?offset=${pageOffset}&limit=${pageSize}`)
                .then((res) => res.json())
                .then((data) => {
                    const sorted = [...data.images].sort((a, b) =>
                        a.original_name.localeCompare(b.original_name, undefined, { numeric: true })
                    );
                    setImages(sorted);
                    setTotal(data.total);
                })
                .finally(() => setLoading(false));
        }
    }, [allClusterImages.length, pageSize]);

    // reset state for mode switch, but don't trigger fetch here
    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setOffset(0);
        if (newMode === "numerical") {
            setAllClusterImages([]); // clear cache
        }
    }, []);

    // Always load images on mode or offset change
    useEffect(() => {
        if (mode === "cluster") {
            loadImages("cluster", offset);
        } else {
            loadImages("numerical", offset);
        }
    }, [mode, offset, loadImages]);

    // Utility for getting the paged images for rendering
    const imagesPaged =
        mode === "cluster"
            ? allClusterImages.slice(offset, offset + pageSize)
            : images;

    // Expose everything needed to consumer
    return {
        images,
        allClusterImages,
        offset,
        total,
        loading,
        mode,
        setMode: switchMode,
        setOffset,
        setImages,
        setAllClusterImages,
        loadImages, // for explicit reload, but mostly handled by effect
        imagesPaged,
        pageSize,
    };
}
