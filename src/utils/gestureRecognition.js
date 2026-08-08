/**
 * Gesture Recognition Utility for MediaPipe Hands
 * 
 * MediaPipe Hand Landmarks (21 points):
 * 0: Wrist
 * 1-4: Thumb (4: Tip, 3: IP, 2: MCP, 1: CMC)
 * 5-8: Index (8: Tip, 7: PIP, 6: MCP, 5: MCP-base)
 * 9-12: Middle (12: Tip, 11: PIP, 10: MCP)
 * 13-16: Ring (16: Tip, 15: PIP, 14: MCP)
 * 17-20: Pinky (20: Tip, 19: PIP, 18: MCP)
 */

export const GESTURES = {
  ONE_FINGER: { id: "ONE_FINGER", name: "Free Drawing", icon: "☝", mode: "draw", desc: "Move your finger to draw." },
  TWO_FINGERS: { id: "TWO_FINGERS", name: "Shape Creator", icon: "✌", mode: "shape", desc: "Create circles and shapes." },
  THREE_FINGERS: { id: "THREE_FINGERS", name: "Change Tool", icon: "🤟", mode: "switch", desc: "Switch drawing options." },
  OPEN_PALM: { id: "OPEN_PALM", name: "Emoji Mode", icon: "🖐", mode: "emoji", desc: "Place emojis." },
  FIST: { id: "FIST", name: "Clear Canvas", icon: "✊", mode: "clear", desc: "Erase everything." },
  THUMBS_UP: { id: "THUMBS_UP", name: "Save Drawing", icon: "👍", mode: "save", desc: "Download artwork." },
  NONE: { id: "NONE", name: "Searching Hand", icon: "✋", mode: "none", desc: "Show your hand to start." }
};

/**
 * Returns finger extension status [thumb, index, middle, ring, pinky]
 */
export function getFingerStates(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false, extendedCount: 0 };
  }

  // Wrist point
  const wrist = landmarks[0];

  // Index finger tip (8) vs PIP (6)
  const index = landmarks[8].y < landmarks[6].y;

  // Middle finger tip (12) vs PIP (10)
  const middle = landmarks[12].y < landmarks[10].y;

  // Ring finger tip (16) vs PIP (14)
  const ring = landmarks[16].y < landmarks[14].y;

  // Pinky finger tip (20) vs PIP (18)
  const pinky = landmarks[20].y < landmarks[18].y;

  // Thumb tip (4) vs IP (3) & MCP (2) - account for left/right horizontal or vertical extension
  const thumbDistanceToWrist = Math.hypot(landmarks[4].x - wrist.x, landmarks[4].y - wrist.y);
  const thumbBaseDistanceToWrist = Math.hypot(landmarks[2].x - wrist.x, landmarks[2].y - wrist.y);
  const thumb = thumbDistanceToWrist > thumbBaseDistanceToWrist * 1.15 || landmarks[4].y < landmarks[3].y;

  let extendedCount = 0;
  if (index) extendedCount++;
  if (middle) extendedCount++;
  if (ring) extendedCount++;
  if (pinky) extendedCount++;
  if (thumb) extendedCount++;

  return { thumb, index, middle, ring, pinky, extendedCount };
}

/**
 * Recognizes gesture based on landmark topology
 */
export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return GESTURES.NONE;
  }

  const { thumb, index, middle, ring, pinky, extendedCount } = getFingerStates(landmarks);

  // 1. THUMBS UP: Thumb extended upwards, other 4 fingers folded down
  const fourFingersFolded = !index && !middle && !ring && !pinky;
  const thumbUpward = landmarks[4].y < landmarks[3].y && landmarks[4].y < landmarks[8].y;
  if (thumb && thumbUpward && fourFingersFolded) {
    return GESTURES.THUMBS_UP;
  }

  // 2. FIST: All fingers folded down
  if (!index && !middle && !ring && !pinky && !thumbUpward) {
    return GESTURES.FIST;
  }

  // 3. ONE FINGER (Index up, middle/ring/pinky down)
  if (index && !middle && !ring && !pinky) {
    return GESTURES.ONE_FINGER;
  }

  // 4. TWO FINGERS (Index + Middle up, ring/pinky down)
  if (index && middle && !ring && !pinky) {
    return GESTURES.TWO_FINGERS;
  }

  // 5. THREE FINGERS (Index + Middle + Ring up, pinky down OR I-Love-You gesture)
  if (index && middle && ring && !pinky) {
    return GESTURES.THREE_FINGERS;
  }

  // 6. OPEN PALM (All 5 fingers extended or 4+ fingers up)
  if (extendedCount >= 4) {
    return GESTURES.OPEN_PALM;
  }

  // Default fallback if pointing or partial
  if (index) {
    return GESTURES.ONE_FINGER;
  }

  return GESTURES.NONE;
}

/**
 * Cooldown tracker for single-action gestures (Clear, Save, Switch)
 */
class GestureCooldown {
  constructor() {
    this.lastTriggerTimes = {};
  }

  canTrigger(gestureId, cooldownMs = 1500) {
    const now = Date.now();
    const lastTime = this.lastTriggerTimes[gestureId] || 0;
    if (now - lastTime >= cooldownMs) {
      this.lastTriggerTimes[gestureId] = now;
      return true;
    }
    return false;
  }
}

export const gestureCooldown = new GestureCooldown();
