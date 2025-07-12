// bessie-frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // ✅ Tailwind
import 'mapbox-gl/dist/mapbox-gl.css'; // ✅ Mapbox

import { GoogleOAuthProvider } from "@react-oauth/google"; // ✅ ADD THIS

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // ✅ Uses your .env.local var

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
