// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // KEEP THIS LINE! It's our Tailwind source.

// Comment out or delete these lines temporarily:
// import App from "./App.jsx";
// import 'mapbox-gl/dist/mapbox-gl.css';
// import { GoogleOAuthProvider } from "@react-oauth/google";
// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

import TestPage from "./TestPage"; // IMPORT OUR NEW TEST PAGE

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Render only our TestPage, bypassing App and GoogleOAuthProvider */}
    <TestPage />
  </React.StrictMode>
);
