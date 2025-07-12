// /src/components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-10 border-b">
      <Link
        to="/"
        className="text-2xl font-bold text-[#25a7f0] tracking-wide hover:opacity-80 transition"
        style={{ textDecoration: "none" }}
      >
        MyLegacyPhotos
      </Link>
      <div className="flex space-x-8 text-lg font-medium">
        <Link to="/" className="hover:text-[#25a7f0] transition">
          Home
        </Link>
        <Link to="/about" className="hover:text-[#25a7f0] transition">
          About
        </Link>
        <Link to="/features" className="hover:text-[#25a7f0] transition">
          Features
        </Link>
        <Link to="/pricing" className="hover:text-[#25a7f0] transition">
          Pricing
        </Link>
        <Link to="/signup" className="hover:text-[#25a7f0] transition">
          Sign Up/In
        </Link>
        <Link to="/contact" className="hover:text-[#25a7f0] transition">
          Contact Us
        </Link>
        <Link to="/help" className="hover:text-[#25a7f0] transition">
          Help
        </Link>
      </div>
    </nav>
  );
}
