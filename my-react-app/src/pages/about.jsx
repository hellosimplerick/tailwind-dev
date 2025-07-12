// /src/pages/about.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function About() {
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
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 mt-6 text-center">
            About MyLegacyPhotos
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mb-8 text-justify mx-auto">
            MyLegacyPhotos was built for real people who want to keep their
            memories safe, accessible, and easy to share—forever. Whether you’re
            a family historian, an avid traveler, or just want to bring order to
            your photo chaos, we believe your story matters.
          </p>
          <p className="text-base text-gray-500 max-w-2xl text-justify mx-auto mb-8">
            Our mission is simple: make photo management effortless and secure,
            without sacrificing privacy or ownership. We combine the best of
            modern design, cloud storage, and AI-powered organization—no
            big-tech lock-in, no selling your data, just your legacy, your way.
          </p>
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
