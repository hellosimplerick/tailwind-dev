// ~/bessie/bessie-frontend/src/hooks/useGPSData.js

import { useState, useEffect } from "react";
import exifr from "exifr";

export default function useGPSData(imageUrl) {
    const [gpsData, setGpsData] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!imageUrl) return;
        setGpsLoading(true);
        setGpsData(null);

        (async () => {
            try {
                const response = await fetch(imageUrl, { mode: "cors" });
                const blob = await response.blob();
                const exif = await exifr.gps(blob);
                if (!cancelled && exif?.latitude && exif?.longitude) {
                    setGpsData({ lat: exif.latitude, lon: exif.longitude });
                } else if (!cancelled) {
                    setGpsData(null);
                }
            } catch (err) {
                if (!cancelled) setGpsData(null);
            } finally {
                if (!cancelled) setGpsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [imageUrl]);

    return { gpsData, gpsLoading };
}
