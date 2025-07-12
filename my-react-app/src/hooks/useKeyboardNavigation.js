// ~/bessie/bessie-frontend/src/hooks/useKeyboardNavigation.js

import { useEffect } from "react";

export default function useKeyboardNavigation({
    enabled,
    onPrev,
    onNext,
    onZoom,
    onUnzoom,
    atStart,
    atEnd,
    loadingRest,
    zoomed,
    imagesLength,
}) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (!enabled || imagesLength === 0) return;

            if (zoomed) {
                if (e.key === " " || e.key === "Escape") {
                    e.preventDefault();
                    onUnzoom();
                }
                return;
            }

            if (e.key === "ArrowLeft" && !atStart) {
                onPrev();
            }
            if (e.key === "ArrowRight" && !atEnd && !loadingRest) {
                onNext();
            }
            if (e.key === " ") {
                e.preventDefault();
                onZoom();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [
        enabled,
        onPrev,
        onNext,
        onZoom,
        onUnzoom,
        atStart,
        atEnd,
        loadingRest,
        zoomed,
        imagesLength,
    ]);
}
// This hook handles keyboard navigation for image galleries, allowing users to navigate images using arrow keys, zoom in with space, and unzoom with escape or space when zoomed in. It also checks if the gallery is at the start or end to prevent unnecessary actions.
// It takes an object with the following properties:
// - `enabled`: whether keyboard navigation is enabled
// - `onPrev`: function to call when navigating to the previous image
// - `onNext`: function to call when navigating to the next image
// - `onZoom`: function to call when zooming in
// - `onUnzoom`: function to call when unzooming
// - `atStart`: boolean indicating if the gallery is at the first image
// - `atEnd`: boolean indicating if the gallery is at the last image
// - `loadingRest`: boolean indicating if more images are loading
// - `zoomed`: boolean indicating if the current image is zoomed in
// - `imagesLength`: total number of images in the gallery
