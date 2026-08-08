import React from "react";

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl + Z", action: "Undo last stroke" },
    { key: "Ctrl + Y", action: "Redo stroke" },
    { key: "Ctrl + S", action: "Export PNG artwork" },
    { key: "C", action: "Clear canvas" },
    { key: "1", action: "Free Drawing Mode" },
    { key: "2", action: "Shape Creator Mode" },
    { key: "3", action: "Emoji Stamping Mode" },
    { key: "T", action: "Toggle Dark / Light Theme" },
    { key: "F", action: "Toggle Fullscreen Mode" }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Keyboard Shortcuts</h2>
          <button className="icon-btn" onClick={onClose}>✖</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {shortcuts.map((sc) => (
            <div key={sc.key} className="shortcut-item">
              <span>{sc.action}</span>
              <kbd className="kbd-tag">{sc.key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
