import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import RootProviders from "./RootProviders";
import "./index.css";

// Verify React is properly loaded - diagnostic check
if (typeof React === 'undefined') {
  console.error('❌ React is not loaded!');
} else {
  console.log('✅ React loaded successfully - version:', React.version);
}

// Register custom service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </React.StrictMode>
);
