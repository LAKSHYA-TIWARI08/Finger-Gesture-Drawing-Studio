import React, { useState, useRef, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Toolbar from "./components/Toolbar";
import CameraWorkspace from "./components/CameraWorkspace";
import GestureGuide from "./components/GestureGuide";
import ShortcutsModal from "./components/ShortcutsModal";
import GalleryModal from "./components/GalleryModal";
import { GESTURES } from "./utils/gestureRecognition";
import { saveToGallery, saveAutoSaveState, getAutoSaveState } from "./utils/storageUtils";
import "./styles/App.css";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [mode, setMode] = useState("draw");
  const [color, setColor] = useState("#3b82f6");
  const [size, setSize] = useState(8);
  const [opacity, setOpacity] = useState(1.0);
  const [brushStyle, setBrushStyle] = useState("normal");
  const [selectedShape, setSelectedShape] = useState("circle");
  const [selectedEmoji, setSelectedEmoji] = useState("😀");
  const [isEraser, setIsEraser] = useState(false);

  const [currentGesture, setCurrentGesture] = useState(GESTURES.NONE);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isHistoryLockedRef = useRef(false);

  // Apply Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Restore Auto-save on load
  useEffect(() => {
    const savedData = getAutoSaveState();
    if (savedData && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.drawImage(img, 0, 0);
      };
      img.src = savedData;
    }
  }, []);

  // Save state history before stroke modification
  const pushHistory = useCallback(() => {
    if (isHistoryLockedRef.current || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    setUndoStack((prev) => [...prev.slice(-19), dataUrl]);
    setRedoStack([]);
    saveAutoSaveState(dataUrl);
    
    // Lock history for 300ms to prevent rapid frame captures
    isHistoryLockedRef.current = true;
    setTimeout(() => {
      isHistoryLockedRef.current = false;
    }, 300);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0 || !canvasRef.current) return;
    const currentData = canvasRef.current.toDataURL();
    const previousData = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, currentData]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveAutoSaveState(canvasRef.current.toDataURL());
    };
    img.src = previousData;
  }, [undoStack]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !canvasRef.current) return;
    const nextData = redoStack[redoStack.length - 1];
    const currentData = canvasRef.current.toDataURL();

    setUndoStack((prev) => [...prev, currentData]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));

    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveAutoSaveState(canvasRef.current.toDataURL());
    };
    img.src = nextData;
  }, [redoStack]);

  const handleClearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    pushHistory();
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);
    saveAutoSaveState("");
  }, [pushHistory]);

  const handleSaveCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");

    // Save to LocalStorage gallery
    saveToGallery(dataUrl);

    // Download PNG file
    const link = document.createElement("a");
    link.download = `gesture_art_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  const handleLoadSavedImage = useCallback((dataUrl) => {
    if (!canvasRef.current) return;
    pushHistory();
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, 640, 480);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      saveAutoSaveState(dataUrl);
    };
    img.src = dataUrl;
  }, [pushHistory]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.warn(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((e) => console.warn(e));
        setIsFullscreen(false);
      }
    }
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveCanvas();
      } else if (e.key.toLowerCase() === "c") {
        handleClearCanvas();
      } else if (e.key === "1") {
        setMode("draw");
        setIsEraser(false);
      } else if (e.key === "2") {
        setMode("shape");
        setIsEraser(false);
      } else if (e.key === "3") {
        setMode("emoji");
        setIsEraser(false);
      } else if (e.key.toLowerCase() === "t") {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, handleSaveCanvas, handleClearCanvas, toggleFullscreen]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Dashboard Grid */}
      <main className="dashboard-grid">
        {/* Left Side: Tool Controls Panel */}
        <Toolbar
          mode={mode}
          setMode={setMode}
          color={color}
          setColor={setColor}
          size={size}
          setSize={setSize}
          opacity={opacity}
          setOpacity={setOpacity}
          brushStyle={brushStyle}
          setBrushStyle={setBrushStyle}
          selectedShape={selectedShape}
          setSelectedShape={setSelectedShape}
          selectedEmoji={selectedEmoji}
          setSelectedEmoji={setSelectedEmoji}
          isEraser={isEraser}
          setIsEraser={setIsEraser}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClearCanvas}
          onSave={handleSaveCanvas}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />

        {/* Center: Camera + Drawing Workspace */}
        <CameraWorkspace
          mode={mode}
          setMode={setMode}
          color={color}
          setColor={setColor}
          size={size}
          opacity={opacity}
          brushStyle={brushStyle}
          selectedShape={selectedShape}
          selectedEmoji={selectedEmoji}
          isEraser={isEraser}
          onSaveCanvas={handleSaveCanvas}
          onClearCanvas={handleClearCanvas}
          setCurrentGestureState={setCurrentGesture}
          onPushHistory={pushHistory}
          canvasRef={canvasRef}
          overlayRef={overlayRef}
        />

        {/* Right Side: Gesture Guide Panel */}
        <GestureGuide currentGesture={currentGesture} />
      </main>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Gallery Modal */}
      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onLoadSavedImage={handleLoadSavedImage}
      />

      {/* Footer Credit Badge */}
      <footer className="app-footer-credit">
        <span className="credit-dot" />
        <span>Designed & Developed By</span>
        <span className="credit-name">Lakshya Tiwari & team</span>
      </footer>
    </div>
  );
}