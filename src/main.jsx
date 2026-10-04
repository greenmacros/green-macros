import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import I18nProvider from "./i18n/I18nProvider.jsx";
import "./styles/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);

// Offline support: register the service worker in production builds only.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => import("./data/foods.js")) // warm the cache so food search works offline
      .catch(() => {});
  });
}
