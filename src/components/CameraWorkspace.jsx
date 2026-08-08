import React, { useRef, useState, useCallback } from "react";
import { useHandTracking } from "../hooks/useHandTracking";
import { classifyGesture, gestureCooldown, GESTURES } from "../utils/gestureRecognition";
import { drawStroke, drawShape, drawEmoji, drawHandSkeleton, PointSmoother } from "../utils/drawingUtils";
import StatusPanel from "./StatusPanel";

export default function CameraWorkspace({
  mode,
  setMode,
  color,
  setColor,
  size,
  opacity,
  brushStyle,
  selectedShape,
  selectedEmoji,
  isEraser,
  onSaveCanvas,
  onClearCanvas,
  setCurrentGestureState,
  onPushHistory,
  canvasRef,
  overlayRef
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [activeGestureToast, setActiveGestureToast] = useState(null);
  const [toastTimeoutId, setToastTimeoutId] = useState(null);

  const smootherRef = useRef(new PointSmoother(0.35));
  const prevPointRef = useRef(null);

  // Cycle colors helper for 🤟 Three Fingers gesture
  const COLOR_PALETTE = ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ffffff"];
  const cycleColor = useCallback(() => {
    setColor((prev) => {
      const idx = COLOR_PALETTE.indexOf(prev);
      return COLOR_PALETTE[(idx + 1) % COLOR_PALETTE.length];
    });
  }, [setColor]);

  // Show Toast notification when gesture changes
  const triggerToast = useCallback((gesture) => {
    if (!gesture || gesture.id === "NONE") return;
    setActiveGestureToast(gesture);
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    const tid = setTimeout(() => {
      setActiveGestureToast(null);
    }, 1800);
    setToastTimeoutId(tid);
  }, [toastTimeoutId]);

  // Handle hand tracking frame results
  const handleHandResults = useCallback(
    (results) => {
      const drawingCanvas = canvasRef.current;
      const overlayCanvas = overlayRef.current;
      if (!drawingCanvas || !overlayCanvas) return;

      const dCtx = drawingCanvas.getContext("2d");
      const oCtx = overlayCanvas.getContext("2d");

      if (drawingCanvas.width !== 640 || drawingCanvas.height !== 480) {
        drawingCanvas.width = 640;
        drawingCanvas.height = 480;
        overlayCanvas.width = 640;
        overlayCanvas.height = 480;
      }

      // Clear overlay frame
      oCtx.clearRect(0, 0, 640, 480);

      const landmarks = results.multiHandLandmarks && results.multiHandLandmarks[0];

      if (!landmarks) {
        smootherRef.current.reset();
        prevPointRef.current = null;
        setCurrentGestureState(GESTURES.NONE);
        return;
      }

      // 1. Classify Gesture
      const detectedGesture = classifyGesture(landmarks);
      setCurrentGestureState(detectedGesture);

      // Render Skeleton if enabled
      if (showSkeleton) {
        drawHandSkeleton(oCtx, landmarks, "#6366f1");
      }

      // Compute Index Tip coordinate (Note video is scaleX(-1) mirrored)
      const indexTip = landmarks[8];
      const rawX = (1 - indexTip.x) * 640;
      const rawY = indexTip.y * 480;

      const currPoint = smootherRef.current.smooth(rawX, rawY);

      // 2. Perform Actions Based on Gesture Mode
      switch (detectedGesture.id) {
        case "ONE_FINGER": {
          // Free Drawing Mode
          if (prevPointRef.current) {
            onPushHistory();
            const activeColor = isEraser ? "#000000" : color;
            const drawStyle = isEraser ? "normal" : brushStyle;

            if (isEraser) {
              dCtx.save();
              dCtx.globalCompositeOperation = "destination-out";
              drawStroke(dCtx, prevPointRef.current, currPoint, {
                style: "normal",
                color: "rgba(0,0,0,1)",
                size: size * 1.5,
                opacity: 1.0
              });
              dCtx.restore();
            } else {
              drawStroke(dCtx, prevPointRef.current, currPoint, {
                style: drawStyle,
                color: activeColor,
                size,
                opacity
              });
            }
          }
          prevPointRef.current = currPoint;
          break;
        }

        case "TWO_FINGERS": {
          // Shape Creation Mode
          smootherRef.current.reset();
          prevPointRef.current = null;

          drawShape(oCtx, selectedShape, currPoint.x, currPoint.y, size * 1.5, color, opacity);

          if (gestureCooldown.canTrigger("STAMP_SHAPE", 600)) {
            onPushHistory();
            drawShape(dCtx, selectedShape, currPoint.x, currPoint.y, size * 1.5, color, opacity);
            triggerToast(GESTURES.TWO_FINGERS);
          }
          break;
        }

        case "OPEN_PALM": {
          // Emoji Stamping Mode
          smootherRef.current.reset();
          prevPointRef.current = null;

          drawEmoji(oCtx, selectedEmoji, currPoint.x, currPoint.y, size * 2);

          if (gestureCooldown.canTrigger("STAMP_EMOJI", 600)) {
            onPushHistory();
            drawEmoji(dCtx, selectedEmoji, currPoint.x, currPoint.y, size * 2);
            triggerToast(GESTURES.OPEN_PALM);
          }
          break;
        }

        case "THREE_FINGERS": {
          // Tool / Color Switch
          smootherRef.current.reset();
          prevPointRef.current = null;

          if (gestureCooldown.canTrigger("SWITCH_TOOL", 1200)) {
            cycleColor();
            triggerToast(GESTURES.THREE_FINGERS);
          }
          break;
        }

        case "FIST": {
          // Clear Canvas
          smootherRef.current.reset();
          prevPointRef.current = null;

          if (gestureCooldown.canTrigger("CLEAR_CANVAS", 2000)) {
            onClearCanvas();
            triggerToast(GESTURES.FIST);
          }
          break;
        }

        case "THUMBS_UP": {
          // Save Drawing
          smootherRef.current.reset();
          prevPointRef.current = null;

          if (gestureCooldown.canTrigger("SAVE_CANVAS", 2500)) {
            onSaveCanvas();
            triggerToast(GESTURES.THUMBS_UP);
          }
          break;
        }

        default:
          smootherRef.current.reset();
          prevPointRef.current = null;
          break;
      }
    },
    [
      canvasRef,
      overlayRef,
      color,
      size,
      opacity,
      brushStyle,
      selectedShape,
      selectedEmoji,
      isEraser,
      showSkeleton,
      cycleColor,
      onClearCanvas,
      onSaveCanvas,
      setCurrentGestureState,
      onPushHistory,
      triggerToast
    ]
  );

  const { cameraStatus, isHandDetected, errorMessage } = useHandTracking(videoRef, handleHandResults);

  return (
    <div className="workspace-wrapper">
      {/* Viewport Box */}
      <div
        ref={containerRef}
        className={`canvas-frame ${isHandDetected ? "tracking-active" : ""}`}
      >
        {/* Webcam Video */}
        <video
          ref={videoRef}
          className="webcam-feed"
          autoPlay
          playsInline
          muted
        />

        {/* Persistent Drawing Canvas */}
        <canvas ref={canvasRef} className="drawing-canvas" width={640} height={480} />

        {/* Skeleton & Shape Preview Overlay Canvas */}
        <canvas ref={overlayRef} className="overlay-canvas" width={640} height={480} />

        {/* Active Gesture Notification Toast */}
        {activeGestureToast && (
          <div className="workspace-notification">
            <span style={{ fontSize: "1.1rem" }}>{activeGestureToast.icon}</span>
            <span>{activeGestureToast.name}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {cameraStatus === "initializing" && (
          <div className="workspace-state-overlay">
            <div className="spin-loader" />
            <p style={{ fontWeight: 600 }}>Initializing Camera & Vision Engine...</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Please grant webcam permission when prompted</p>
          </div>
        )}

        {/* Error Overlay */}
        {cameraStatus === "error" && (
          <div className="workspace-state-overlay">
            <p style={{ fontSize: "2rem" }}>⚠️</p>
            <p style={{ fontWeight: 600, color: "#ef4444" }}>Camera Connection Error</p>
            <p style={{ fontSize: "0.8rem", maxWidth: "80%", color: "var(--text-muted)" }}>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Control Status Bar */}
      <div className="workspace-bottom-bar">
        <StatusPanel
          cameraStatus={cameraStatus}
          isHandDetected={isHandDetected}
          currentGesture={activeGestureToast || GESTURES.NONE}
        />

        <button
          className={`sub-btn ${showSkeleton ? "active" : ""}`}
          style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem" }}
          onClick={() => setShowSkeleton(!showSkeleton)}
        >
          🦴 Skeleton: {showSkeleton ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
