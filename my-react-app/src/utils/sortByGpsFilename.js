// bessie-frontend/src/utils/sortByGpsFilename.js
export function sortByGpsFilename(urls) {
    return urls
        .map((url) => {
            const filename = url.split("/").pop().split("?")[0];
            const match = filename.match(/gps(\d+)\.jpg$/i);
            const num = match ? parseInt(match[1], 10) : -1;
            return { url, num };
        })
        .filter((item) => item.num !== -1)
        .sort((a, b) => a.num - b.num)
        .map((item) => item.url);
}
