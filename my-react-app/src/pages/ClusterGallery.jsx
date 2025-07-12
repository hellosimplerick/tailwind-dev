import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const CLUSTERS_PER_PAGE = 50;

const ClusterGallery = () => {
  const [clusterImages, setClusterImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [taggingClusterId, setTaggingClusterId] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [existingPeople, setExistingPeople] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [personClusterMap, setPersonClusterMap] = useState({});

  const [clusterToImageIdMap, setClusterToImageIdMap] = useState({});
  const [modalImageUrl, setModalImageUrl] = useState(null);

  const fetchSignedUrls = async (clusterIds) => {
    const urls = await Promise.all(
      clusterIds.map(async (id) => {
        const key = `faces/thumbnails/clusters/cluster_${id}.jpg`;
        try {
          const res = await axios.get(`/api/image/signed-url`, {
            params: { key },
          });
          return { id, url: res.data.url };
        } catch (err) {
          console.error(`❌ Failed to load cluster ${id}`, err);
          return { id, url: null };
        }
      })
    );
    setClusterImages(urls);
    setLoading(false);
  };

  const fetchPeopleAndClusters = async () => {
    try {
      const [peopleRes, labelsRes] = await Promise.all([
        axios.get("/api/persons"),
        axios.get("/api/cluster-labels-map"),
      ]);

      setExistingPeople(peopleRes.data);
      setPersonClusterMap(labelsRes.data);
    } catch (err) {
      console.error("❌ Failed to fetch people or cluster-labels", err);
    }
  };

  const fetchClusterManifest = async () => {
    try {
      const res = await axios.get("/api/cluster-thumbnails");
      const manifest = res.data;
      const map = {};
      for (const entry of manifest) {
        map[entry.cluster_id] = entry.source_image_id;
      }
      setClusterToImageIdMap(map);
    } catch (err) {
      console.error("❌ Failed to fetch cluster manifest", err);
    }
  };

  const handleClusterClick = (id) => {
    setTaggingClusterId(id);
    const currentLabel = personClusterMap[id] || "";
    const matched = existingPeople.find((p) => p.label === currentLabel);
    setSelectedPersonId(matched?.id || null);
    setLabelInput(matched ? "" : currentLabel);
  };

  const handleSubmit = async () => {
    try {
      let personId = selectedPersonId;

      if (!personId && labelInput.trim()) {
        const createRes = await axios.post("/api/persons", {
          label: labelInput.trim(),
          created_by: "6b11c18f-4d51-401d-a01c-32aa1c39c62b",
        });
        personId = createRes.data.id;
        await fetchPeopleAndClusters();
      }

      if (!personId) {
        alert("Select or create a person label first.");
        return;
      }

      try {
        await axios.post("/api/cluster-labels", {
          cluster_id: taggingClusterId,
          person_id: personId,
        });
      } catch (err) {
        if (err.response?.status === 409) {
          await axios.delete(`/api/cluster-labels/${taggingClusterId}`).catch(() => {});
          await axios.post("/api/cluster-labels", {
            cluster_id: taggingClusterId,
            person_id: personId,
          });
        } else {
          throw err;
        }
      }

      setPersonClusterMap((prev) => ({
        ...prev,
        [taggingClusterId]:
          existingPeople.find((p) => p.id === personId)?.label || labelInput.trim(),
      }));

      setTaggingClusterId(null);
    } catch (err) {
      console.error("❌ Tagging failed", err);
      alert("Failed to tag cluster.");
    }
  };

  const handleFullImageClick = async (clusterId) => {
    const imageId = clusterToImageIdMap[clusterId];
    if (!imageId) return;

    const key = `faces/lat-long/${imageId}.jpg`;
    try {
      const res = await axios.get("/api/image/signed-url", {
        params: { key },
      });
      setModalImageUrl(res.data.url);
    } catch (err) {
      console.error("❌ Failed to get signed URL for full image", err);
    }
  };

  const handleModalClose = useCallback(() => {
    setModalImageUrl(null);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" || e.key === " ") {
        handleModalClose();
      }
    },
    [handleModalClose]
  );

  useEffect(() => {
    const start = currentPage * CLUSTERS_PER_PAGE;
    const ids = Array.from({ length: CLUSTERS_PER_PAGE }, (_, i) => start + i);
    fetchSignedUrls(ids);
    fetchPeopleAndClusters();
    fetchClusterManifest();
  }, [currentPage]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const totalPages = Math.ceil(500 / CLUSTERS_PER_PAGE);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cluster Thumbnails</h1>

      {loading ? (
        <p className="text-gray-500">Loading thumbnails...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clusterImages.map(({ id, url }) => (
            <div key={id} className="text-center relative">
              {url ? (
                <img
                  src={url}
                  alt={`Cluster ${id}`}
                  className="w-48 h-48 object-cover mx-auto rounded-lg shadow cursor-pointer hover:opacity-80"
                  onClick={() => handleClusterClick(id)}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-sm text-gray-600">
                  Failed to load
                </div>
              )}
              <p className="mt-2 text-sm text-gray-700">
                {personClusterMap[id] || `Cluster ${id}`}
              </p>
              <button
                onClick={() => handleFullImageClick(id)}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Full
              </button>

              {taggingClusterId === id && (
                <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-95 p-4 flex flex-col justify-center items-center shadow-lg rounded-lg">
                  <h2 className="text-sm mb-2">Tag or update this person</h2>

                  <select
                    className="mb-2 p-2 border w-full"
                    value={selectedPersonId || ""}
                    onChange={(e) => setSelectedPersonId(e.target.value || null)}
                  >
                    <option value="">Select existing person</option>
                    {existingPeople.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Or type new label"
                    className="mb-2 p-2 border w-full"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                  />

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-1 bg-blue-600 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setTaggingClusterId(null)}
                      className="px-4 py-1 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8 space-x-4">
        <button
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm">
          Page {currentPage + 1} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {modalImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          onClick={handleModalClose}
        >
          <img
            src={modalImageUrl}
            alt="Full"
            className="scale-125 max-w-4xl max-h-[90vh] rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ClusterGallery;
