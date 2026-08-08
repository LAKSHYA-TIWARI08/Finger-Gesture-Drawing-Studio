import React from "react";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ffffff", // White
  "#111827"  // Dark Slate
];

const EMOJI_OPTIONS = ["😀", "😎", "❤️", "😂", "🔥", "⭐", "🚀", "🎨"];

const SHAPE_OPTIONS = [
  { id: "circle", label: "⚪ Circle" },
  { id: "rectangle", label: "⬜ Rect" },
  { id: "triangle", label: "🔺 Triangle" },
  { id: "star", label: "⭐ Star" },
  { id: "line", label: "➖ Line" }
];

const BRUSH_STYLES = [
  { id: "normal", label: "🖌️ Normal" },
  { id: "pencil", label: "✏️ Pencil" },
  { id: "marker", label: "🖍️ Marker" },
  { id: "neon", label: "🌟 Neon" }
];

export default function Toolbar({
  mode,
  setMode,
  color,
  setColor,
  size,
  setSize,
  opacity,
  setOpacity,
  brushStyle,
  setBrushStyle,
  selectedShape,
  setSelectedShape,
  selectedEmoji,
  setSelectedEmoji,
  isEraser,
  setIsEraser,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo
}) {
  return (
    <aside className="studio-panel">
      <div className="panel-header">
        <h2 className="panel-title">Studio Controls</h2>
        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", fontWeight: 600 }}>TOOLS</span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="tool-group">
        <span className="tool-label">Mode</span>
        <div className="segmented-tabs">
          <button
            className={`segmented-tab ${mode === "draw" && !isEraser ? "active" : ""}`}
            onClick={() => { setMode("draw"); setIsEraser(false); }}
          >
            Draw
          </button>
          <button
            className={`segmented-tab ${mode === "shape" ? "active" : ""}`}
            onClick={() => { setMode("shape"); setIsEraser(false); }}
          >
            Shape
          </button>
          <button
            className={`segmented-tab ${mode === "emoji" ? "active" : ""}`}
            onClick={() => { setMode("emoji"); setIsEraser(false); }}
          >
            Emoji
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div className="tool-group">
        <span className="tool-label">Palette</span>
        <div className="color-grid">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className={`color-dot ${color === c && !isEraser ? "active" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => { setColor(c); setIsEraser(false); }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
            className="color-input-btn"
            title="Custom Color"
          />
        </div>
      </div>

      {/* Brush Size & Opacity */}
      <div className="tool-group">
        <div className="slider-container">
          <div className="slider-row">
            <span>Stroke Size</span>
            <span>{size}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="slider-input"
          />
        </div>

        <div className="slider-container" style={{ marginTop: "0.5rem" }}>
          <div className="slider-row">
            <span>Opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="slider-input"
          />
        </div>
      </div>

      {/* Brush Style Selector */}
      {mode === "draw" && (
        <div className="tool-group">
          <span className="tool-label">Brush Type</span>
          <div className="brush-options-grid">
            {BRUSH_STYLES.map((b) => (
              <button
                key={b.id}
                className={`brush-option-btn ${brushStyle === b.id && !isEraser ? "active" : ""}`}
                onClick={() => { setBrushStyle(b.id); setIsEraser(false); }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shape Selector */}
      {mode === "shape" && (
        <div className="tool-group">
          <span className="tool-label">Shape Type</span>
          <div className="brush-options-grid">
            {SHAPE_OPTIONS.map((s) => (
              <button
                key={s.id}
                className={`brush-option-btn ${selectedShape === s.id ? "active" : ""}`}
                onClick={() => setSelectedShape(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Selector */}
      {mode === "emoji" && (
        <div className="tool-group">
          <span className="tool-label">Emoji Stamp</span>
          <div className="icon-select-grid">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                className={`icon-select-btn ${selectedEmoji === e ? "active" : ""}`}
                onClick={() => setSelectedEmoji(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Quick Actions */}
      <div className="tool-group">
        <span className="tool-label">Actions</span>
        <div className="action-buttons-grid">
          <button
            className={`sub-btn ${isEraser ? "active" : ""}`}
            onClick={() => setIsEraser(!isEraser)}
            title="Toggle Eraser"
          >
            🧹 Eraser
          </button>
          <button
            className="sub-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↩️ Undo
          </button>
          <button
            className="sub-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↪️ Redo
          </button>
          <button
            className="sub-btn danger"
            onClick={onClear}
            title="Clear Canvas (Fist Gesture)"
          >
            🗑️ Clear
          </button>
        </div>

        <button
          className="primary-btn"
          style={{ width: "100%", marginTop: "0.4rem" }}
          onClick={onSave}
        >
          💾 Export PNG
        </button>
      </div>
    </aside>
  );
}