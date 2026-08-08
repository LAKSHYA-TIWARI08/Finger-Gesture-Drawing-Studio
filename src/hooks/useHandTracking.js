import { useEffect, useState, useRef } from "react";
import { Hands } from "@mediapipe/hands";

/**
 * Custom React Hook for MediaPipe Hands webcam tracking
 */
export function useHandTracking(videoRef, onResultsCallback) {
  const [cameraStatus, setCameraStatus] = useState("initializing"); // "initializing" | "connected" | "error" | "denied"
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const handsRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const callbackRef = useRef(onResultsCallback);

  // Keep callback reference updated without triggering re-initialization loop
  useEffect(() => {
    callbackRef.current = onResultsCallback;
  }, [onResultsCallback]);

  useEffect(() => {
    let isMounted = true;
    let stream = null;

    async function initHandTracking() {
      try {
        setCameraStatus("initializing");
        setErrorMessage("");

        // Request webcam video stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          }
        });

        if (!isMounted) return;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => resolve();
          });
        }

        // Initialize MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7
        });

        hands.onResults((results) => {
          if (!isMounted) return;

          const hasHand = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;
          setIsHandDetected(hasHand);

          if (callbackRef.current) {
            callbackRef.current(results);
          }
        });

        handsRef.current = hands;
        setCameraStatus("connected");

        // Processing loop
        const processFrame = async () => {
          if (!isMounted) return;
          if (videoRef.current && videoRef.current.readyState >= 2 && handsRef.current) {
            try {
              await handsRef.current.send({ image: videoRef.current });
            } catch (err) {
              console.warn("Frame processing skipped:", err);
            }
          }
          animFrameIdRef.current = requestAnimationFrame(processFrame);
        };

        processFrame();

      } catch (err) {
        console.error("Camera access / MediaPipe init error:", err);
        if (isMounted) {
          setCameraStatus("error");
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setErrorMessage("Camera permission denied. Please allow camera access in browser settings.");
          } else {
            setErrorMessage("Could not connect to camera: " + (err.message || "Unknown error"));
          }
        }
      }
    }

    initHandTracking();

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  return { cameraStatus, isHandDetected, errorMessage };
}
