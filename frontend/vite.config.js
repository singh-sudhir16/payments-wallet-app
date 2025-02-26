import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Ensures build files go into "dist"
  },
  base: "/", // Makes sure assets load correctly
});
