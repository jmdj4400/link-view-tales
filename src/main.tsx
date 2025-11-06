import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import RootProviders from "./RootProviders";
import "./index.css";

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
  <StrictMode>
    <RootProviders>
      <App />
    </RootProviders>
  </StrictMode>
);
