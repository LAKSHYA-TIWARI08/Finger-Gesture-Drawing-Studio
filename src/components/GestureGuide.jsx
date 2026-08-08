import React from "react";
import { GESTURES } from "../utils/gestureRecognition";

const GUIDE_ITEMS = [
  {
    gesture: GESTURES.ONE_FINGER,
    title: "☝ One Finger",
    action: "Free Draw",
    desc: "Move your index finger to draw freely."
  },
  {
    gesture: GESTURES.TWO_FINGERS,
    title: "✌ Two Fingers",
    action: "Shape Creator",
    desc: "Place geometric shapes (circle, rect, star)."
  },
  {
    gesture: GESTURES.THREE_FINGERS,
    title: "🤟 Three Fingers",
    action: "Cycle Tools",
    desc: "Quickly cycle through palette colors."
  },
  {
    gesture: GESTURES.OPEN_PALM,
    title: "🖐 Open Palm",
    action: "Emoji Stamp",
    desc: "Stamp selected emoji at your fingertip."
  },
  {
    gesture: GESTURES.FIST,
    title: "✊ Fist",
    action: "Clear Canvas",
    desc: "Hold a fist to erase the entire canvas."
  },
  {
    gesture: GESTURES.THUMBS_UP,
    title: "👍 Thumbs Up",
    action: "Save to Gallery",
    desc: "Give a thumbs up to save artwork to gallery."
  }
];

export default function GestureGuide({ currentGesture }) {
  return (
    <aside className="studio-panel gesture-guide-panel">
      <div className="panel-header">
        <h2 className="panel-title">Gesture Guide</h2>
        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>CHEATSHEET</span>
      </div>

      <div className="gesture-guide-list">
        {GUIDE_ITEMS.map((item) => {
          const isActive = currentGesture?.id === item.gesture.id;
          return (
            <div
              key={item.gesture.id}
              className={`guide-item-card ${isActive ? "active" : ""}`}
            >
              <div className="guide-icon-box">{item.gesture.icon}</div>
              <div className="guide-info">
                <div className="guide-header-line">
                  <span className="guide-name">{item.title}</span>
                  <span className="guide-action-pill">• {item.action}</span>
                </div>
                <span className="guide-desc">{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
