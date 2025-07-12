// /src/pages/tos.jsx

import React from 'react';
import Layout from '../components/Layout';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-lg max-w-2xl w-full mx-auto p-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 mt-6 text-center">
            Terms of Service
          </h1>
          <div className="text-lg text-gray-700 mb-8 text-center">
            <p>
              This is a placeholder for the Bessie Terms of Service. The full
              policy will appear here soon.
            </p>
            <p className="mt-4 text-base text-gray-500">
              For now, if you have questions about your privacy or our terms,
              please{' '}
              <a
                href="/contact"
                className="underline text-[#25a7f0] hover:text-[#1793d1]"
              >
                contact us
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
