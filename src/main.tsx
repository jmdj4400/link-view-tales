import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import RootProviders from "./RootProviders";
import "./index.css";

// Service worker enabled for PWA features
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
