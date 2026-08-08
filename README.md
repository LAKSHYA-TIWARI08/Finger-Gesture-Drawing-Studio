# ✋ Finger Gesture Studio

> A real-time AI & computer vision digital drawing studio controlled entirely by hand gestures. Built with **React**, **Vite**, **MediaPipe Hands**, and **HTML5 Canvas**.

Designed & Developed by **Lakshya Tiwari & team**.

---

## 🌟 Key Features

- **☝ Free Drawing Mode**: Smooth index finger tracking with exponential coordinate smoothing (EWMA filter).
- **✌ Shape Creator Mode**: Place clean geometric shapes (*Circle, Rectangle, Triangle, Star, Line*).
- **🤟 Quick Tool & Palette Cycle**: Switch colors dynamically using three-finger gesture.
- **🖐 Emoji Stamping Mode**: Stamp selected emojis directly onto the canvas at fingertip position.
- **✊ Fist Canvas Eraser**: Clear the entire canvas with a simple fist gesture.
- **👍 Thumbs Up Export**: Instant PNG artwork download triggered by thumbs up gesture.
- **🎨 Advanced Brush Engine**: Normal Brush, Pencil, Marker, and Neon Glow styles with adjustable size & opacity sliders.
- **🖼️ Local Gallery & Auto-Save**: Persistent artwork storage in LocalStorage.
- **⌨️ Shortcuts & Dark/Light Mode**: Full keyboard accessibility and studio color themes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Computer Vision**: MediaPipe Hands (`@mediapipe/hands`)
- **Graphics**: HTML5 2D Canvas API
- **Styling**: Modern CSS3 (Custom Variables, Flexbox, Grid)

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Finger-Gesture-Drawing-Studio.git
   cd Finger-Gesture-Drawing-Studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173/` in your browser.

---

## 🌐 Deploying to GitHub Pages

1. **Initialize Git & Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Gesture Studio v2.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Finger-Gesture-Drawing-Studio.git
   git push -u origin main
   ```

2. **Host for free on GitHub Pages**:
   - Go to your GitHub repository **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions** (or deploy the `dist` branch).
   - Alternatively, deploy instantly via **Vercel** or **Netlify** by connecting your GitHub repository!

---

## 📄 License

MIT License. Designed & Developed by **Lakshya Tiwari & team**.
