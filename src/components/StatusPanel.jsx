import React from "react";

export default function StatusPanel({ cameraStatus, isHandDetected, currentGesture }) {
  const getCameraStatus = () => {
    switch (cameraStatus) {
      case "connected":
        return { dot: "active", text: "Camera Ready" };
      case "initializing":
        return { dot: "warning", text: "Starting..." };
      case "error":
      default:
        return { dot: "offline", text: "Offline" };
    }
  };

  const cam = getCameraStatus();

  return (
    <div className="status-badges">
      <div className="status-tag">
        <span className={`indicator-dot ${cam.dot}`} />
        <span>{cam.text}</span>
      </div>

      <div className="status-tag">
        <span className={`indicator-dot ${isHandDetected ? "active" : "warning"}`} />
        <span>Tracking: {isHandDetected ? "Active" : "Searching"}</span>
      </div>

      <div className="status-tag" style={{ borderColor: "var(--accent-indigo)" }}>
        <span style={{ fontSize: "0.95rem" }}>{currentGesture?.icon || "✋"}</span>
        <span style={{ fontWeight: 700, color: "var(--text-main)" }}>
          {currentGesture?.name || "No Gesture"}
        </span>
      </div>
    </div>
  );
}
