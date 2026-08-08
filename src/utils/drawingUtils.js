/**
 * Drawing Utilities & Canvas Rendering Engine
 */

// Simple EWMA point filter for line smoothing
export class PointSmoother {
  constructor(alpha = 0.35) {
    this.alpha = alpha;
    this.lastPoint = null;
  }

  smooth(x, y) {
    if (!this.lastPoint) {
      this.lastPoint = { x, y };
      return { x, y };
    }
    const smoothX = this.lastPoint.x + this.alpha * (x - this.lastPoint.x);
    const smoothY = this.lastPoint.y + this.alpha * (y - this.lastPoint.y);
    this.lastPoint = { x: smoothX, y: smoothY };
    return { x: smoothX, y: smoothY };
  }

  reset() {
    this.lastPoint = null;
  }
}

/**
 * Draws stroke based on brush style
 */
export function drawStroke(ctx, p1, p2, { style = "normal", color = "#3b82f6", size = 6, opacity = 1.0 }) {
  if (!p1 || !p2) return;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (style) {
    case "pencil":
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, size * 0.7);
      // Pencil texture effect with light jitter line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.globalAlpha = opacity * 0.4;
      ctx.lineWidth = Math.max(1, size * 0.4);
      ctx.beginPath();
      ctx.moveTo(p1.x + (Math.random() - 0.5) * 1.5, p1.y + (Math.random() - 0.5) * 1.5);
      ctx.lineTo(p2.x + (Math.random() - 0.5) * 1.5, p2.y + (Math.random() - 0.5) * 1.5);
      ctx.stroke();
      break;

    case "marker":
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.5;
      ctx.lineCap = "square";
      ctx.globalAlpha = opacity * 0.6;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;

    case "neon":
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 2.5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, size * 0.6);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.shadowBlur = size * 4;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;

    case "normal":
    default:
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

/**
 * Draws geometric shapes
 */
export function drawShape(ctx, shapeType, x, y, size = 40, color = "#3b82f6", opacity = 1.0) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.fillStyle = color + "33"; // 20% fill transparency
  ctx.lineWidth = Math.max(2, size / 8);
  ctx.lineJoin = "round";

  ctx.beginPath();

  switch (shapeType) {
    case "circle":
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;

    case "rectangle":
      ctx.rect(x - size, y - size * 0.7, size * 2, size * 1.4);
      break;

    case "triangle":
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y + size * 0.8);
      ctx.lineTo(x - size, y + size * 0.8);
      ctx.closePath();
      break;

    case "star":
      drawStarPoints(ctx, x, y, 5, size, size * 0.45);
      break;

    case "line":
      ctx.moveTo(x - size * 1.5, y);
      ctx.lineTo(x + size * 1.5, y);
      break;

    default:
      ctx.arc(x, y, size, 0, Math.PI * 2);
      break;
  }

  if (shapeType !== "line") {
    ctx.fill();
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Helper to compute 5-pointed star paths
 */
function drawStarPoints(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = (Math.PI / 2) * 3;
  let step = Math.PI / spikes;

  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Stamp emoji at given coordinates
 */
export function drawEmoji(ctx, emoji, x, y, size = 48) {
  ctx.save();
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x, y);
  ctx.restore();
}

/**
 * Renders MediaPipe hand skeleton landmarks on preview canvas
 */
export function drawHandSkeleton(ctx, landmarks, color = "#22c55e") {
  if (!landmarks || landmarks.length < 21) return;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],       // Index
    [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
    [9, 13], [13, 14], [14, 15], [15, 16],// Ring
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17]                               // Palm base
  ];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Draw connections
  for (const [i, j] of connections) {
    // Note: Video is mirrored scaleX(-1), so x is flipped
    const x1 = (1 - landmarks[i].x) * width;
    const y1 = landmarks[i].y * height;
    const x2 = (1 - landmarks[j].x) * width;
    const y2 = landmarks[j].y * height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Draw landmark points
  for (let i = 0; i < landmarks.length; i++) {
    const x = (1 - landmarks[i].x) * width;
    const y = landmarks[i].y * height;

    ctx.fillStyle = i === 8 ? "#3b82f6" : "#ffffff"; // Highlight index tip
    ctx.beginPath();
    ctx.arc(x, y, i === 8 ? 6 : 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
