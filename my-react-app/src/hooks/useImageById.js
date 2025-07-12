// /src/hooks/useImageById.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function useImageById() {
    const { id } = useParams();
    const [image, setImage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("Missing image ID in URL.");
            return;
        }

        const fetchImage = async () => {
            try {
                const res = await fetch(`/api/images/${id}`);
                if (!res.ok) throw new Error(`Failed to fetch image ${id}`);
                const data = await res.json();
                setImage(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [id]);

    return { id, image, loading, error };
}
