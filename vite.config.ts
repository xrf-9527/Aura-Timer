import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // React Compiler 1.0 - Automatic memoization and optimization
          // Reference: https://react.dev/blog/2025/10/07/react-compiler-1
          ['babel-plugin-react-compiler', {}]
        ]
      }
    })
  ],
  define: {
    // Replaces process.env.API_KEY in the client code with the string value from the build environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});