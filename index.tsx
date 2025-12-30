import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ THIS LINE FIXES ISSUE 2
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
