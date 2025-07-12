// /src/components/Layout.jsx

import React from "react";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {children}
      </main>
      <footer className="w-full py-6 px-10 border-t text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} MyLegacyPhotos. All rights reserved.
      </footer>
    </div>
  );
}
