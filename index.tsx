import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Agar mounting point na mile toh console mein clear error dikhaye
  console.error("Critical: #root element not found in DOM. Check your index.html");
}
