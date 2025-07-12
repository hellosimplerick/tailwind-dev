// /src/pages/pricing.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Pricing() {
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
        <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-lg max-w-md w-full mx-auto p-8 flex flex-col items-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-6 mt-0 text-center">
            Simple, Transparent Pricing
          </h1>
          <div className="w-full mb-6">
            {/* Grid for perfect label/price alignment */}
            <div className="grid grid-cols-2 gap-y-4">
              <div className="font-bold text-gray-900 flex items-center">
                Monthly
              </div>
              <div className="font-semibold flex items-center">$20/mo</div>
              <div className="font-bold text-gray-900 flex items-center">
                Yearly
              </div>
              <div className="font-semibold flex items-center">
                $200/yr
                <span className="ml-3 bg-[#25a7f0] text-white text-xs font-semibold rounded px-2 py-1">
                  Save 16%
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/signin"
            className="bg-[#25a7f0] text-black text-lg font-extrabold py-3 px-8 rounded-lg shadow hover:bg-[#1793d1] transition text-center flex flex-col items-center mt-2"
          >
            <span className="text-lg font-extrabold">Start Free</span>
            <span className="text-xs mt-1 opacity-80">no cc required</span>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
