
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Critical for browser-based SDKs that expect process.env
if (typeof window !== 'undefined') {
  (window as any).process = (window as any).process || { env: {} };
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Mounting point #root not found");
}
