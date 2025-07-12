// ~/bessie-frontend/src/utils/fetchS3Images.js

/**
 * Fetches list of image URLs from the FastAPI backend.
 * Supports pagination with offset and limit.
 * Assumes backend provides presigned S3 URLs at /api/images
 * 
 * @param {number} offset - Start index for images (default 0)
 * @param {number} limit - Max number of images to fetch (default 25)
 * @returns {Promise<{ images: string[], total: number }>} API response object
 */
export async function fetchS3Images(offset = 0, limit = 25) {
    try {
        const res = await fetch(`http://localhost:8000/api/images?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            images: data.images || [],
            total: data.total ?? null
        };
    } catch (err) {
        console.error("Failed to fetch images from S3:", err);
        return {
            images: [],
            total: null
        };
    }
}
