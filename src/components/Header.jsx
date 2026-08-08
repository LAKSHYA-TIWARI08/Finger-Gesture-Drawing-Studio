import React from "react";

export default function Header({
  theme,
  setTheme,
  onOpenShortcuts,
  onOpenGallery,
  isFullscreen,
  onToggleFullscreen
}) {
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="app-header">
      <div className="header-branding">
        <div className="logo-mark">🖐️</div>
        <div className="header-text-group">
          <h1 className="header-title">Gesture Studio</h1>
          <p className="header-subtitle">
            Hand-controlled digital canvas & shape creator
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="icon-btn"
          onClick={onOpenGallery}
          title="Saved Artwork Gallery"
        >
          🖼️
        </button>

        <button
          className="icon-btn"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts"
        >
          ⌨️
        </button>

        <button
          className="icon-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <button
          className="icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? "📉" : "🖥️"}
        </button>
      </div>
    </header>
  );
}
