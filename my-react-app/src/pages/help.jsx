// /src/pages/help.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Help() {
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
            Help
          </h1>
          <p className="text-lg text-gray-700 mb-8 text-center">
            FAQs, documentation, and tips are on the way. Check back for
            updates!
          </p>
          <Link
            to="/signup"
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
