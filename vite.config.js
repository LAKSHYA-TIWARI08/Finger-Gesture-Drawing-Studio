import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.js.org/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets resolve properly on GitHub Pages & custom domains
});
