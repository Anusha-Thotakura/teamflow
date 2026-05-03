// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global reset styles
const globalStyle = document.createElement("style");
globalStyle.innerHTML = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff; }
  input, select, textarea, button { font-family: inherit; }
`;
document.head.appendChild(globalStyle);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);