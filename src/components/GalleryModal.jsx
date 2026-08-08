import React, { useState, useEffect } from "react";
import { getGalleryItems, deleteGalleryItem } from "../utils/storageUtils";

export default function GalleryModal({ isOpen, onClose, onLoadSavedImage }) {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setGallery(getGalleryItems());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteGalleryItem(id);
    setGallery(updated);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Saved Gallery</h2>
          <button className="icon-btn" onClick={onClose}>✖</button>
        </div>

        {gallery.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "2rem" }}>🎨</p>
            <p style={{ marginTop: "0.5rem", fontWeight: 600 }}>No saved drawings yet</p>
            <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
              Use Save to Gallery or the 👍 Thumbs Up gesture to save your creations!
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
            {gallery.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "relative",
                  aspectRatio: "4/3",
                  borderRadius: "0.6rem",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                  background: "#000"
                }}
              >
                <img src={item.dataUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    opacity: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    transition: "opacity 0.15s ease"
                  }}
                  className="gallery-overlay"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <button
                    className="sub-btn"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.45rem" }}
                    onClick={() => { onLoadSavedImage(item.dataUrl); onClose(); }}
                  >
                    Load
                  </button>
                  <button
                    className="sub-btn danger"
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.45rem" }}
                    onClick={(e) => handleDelete(item.id, e)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
