// /src/pages/features.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Features() {
  return (
    <Layout>
      {/* Background image */}
      <div
        className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('/oldimg.png')",
          opacity: 0.4,
          filter: 'brightness(1.2)',
        }}
        aria-hidden="true"
      />
      <div className="flex flex-col items-center justify-center min-h-[65vh]">
        <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-lg max-w-2xl w-full mx-auto p-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 mt-6 text-center">
            Features
          </h1>
          <p className="text-lg text-gray-700 font-semibold max-w-xl text-left mb-10">
            Stay tuned for a full list of awesome features—including:
          </p>
          <ul className="text-gray-900 font-extrabold text-base mb-10 space-y-2 text-left">
            <li>• Effortless photo uploads (from any device or location)</li>
            <li>• AI-powered tagging & search</li>
            <li>• Add personal audio memories to enhances the photos</li>
            <li>
              • Family sharing and collaboration with full privacy controls
            </li>
            <li>• Memory Lane time travel (revisit any day in history)</li>
            <li>• Full Genealogy Tree linked to your photos</li>
            <li>• Secure cloud backup—your way, not Big Tech’s</li>
          </ul>
          <Link
            to="/signin"
            className="bg-[#25a7f0] text-black text-lg font-extrabold py-3 px-8 rounded-lg shadow hover:bg-[#1793d1] transition text-center flex flex-col items-center"
          >
            <span className="text-lg font-extrabold">Start Free</span>
            <span className="text-xs mt-1 opacity-80">no cc required</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
