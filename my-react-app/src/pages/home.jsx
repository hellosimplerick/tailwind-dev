// /src/pages/home.jsx

import React, { useState, useRef, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Carousel text slides (add/edit as needed)
const SLIDES = [
  {
    headline: 'Memories Matter.<br />Keep Yours Safe Forever.',
    body: (
      <>
        Effortlessly upload, organize, and relive your most precious moments
        with MyLegacyPhotos.
        <br />
        Built for families, creators, and anyone who wants a modern, secure
        photo memory app—without the tech drama.
      </>
    ),
  },
  {
    headline: 'Secure. Private. Yours.',
    body: (
      <>
        Your photos are never sold or mined for ads. <br />
        Only you control your story—now and forever.
      </>
    ),
  },
  {
    headline: 'AI-Organized, Human-Touch',
    body: (
      <>
        Our AI helps you find, tag, and sort your memories. <br />
        You stay in control—no hidden edits, no surprises.
      </>
    ),
  },
  {
    headline: 'Family-Friendly Sharing',
    body: (
      <>
        Invite your family or friends, share entire albums, <br />
        and keep the moments that matter in one safe place.
      </>
    ),
  },
];

const AUTO_ADVANCE_INTERVAL = 4000; // 4 seconds

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [auto, setAuto] = useState(true);
  const intervalRef = useRef();

  // Auto-advance logic
  useEffect(() => {
    if (auto) {
      intervalRef.current = setInterval(() => {
        setSlide((prev) => (prev + 1) % SLIDES.length);
      }, AUTO_ADVANCE_INTERVAL);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [auto]);

  // Clean up on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // Manual navigation disables auto
  const goToSlide = (index) => {
    setSlide(index);
    setAuto(false);
  };
  const goLeft = () => {
    setSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setAuto(false);
  };
  const goRight = () => {
    setSlide((prev) => (prev + 1) % SLIDES.length);
    setAuto(false);
  };

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

      {/* Carousel box (centered, translucent, responsive) */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mx-auto mb-8 max-w-3xl w-full">
          <div className="relative flex items-center justify-center">
            {/* Left arrow */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#25a7f0] focus:outline-none transition z-20"
              onClick={goLeft}
              aria-label="Previous"
              tabIndex={0}
            >
              <HiChevronLeft size={44} className="drop-shadow" />
            </button>
            {/* Text Slide */}
            <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-lg p-8 sm:p-10 text-center w-full select-none">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4"
                dangerouslySetInnerHTML={{
                  __html: SLIDES[slide].headline,
                }}
              />
              <p className="text-lg text-gray-800">{SLIDES[slide].body}</p>
            </div>
            {/* Right arrow */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#25a7f0] focus:outline-none transition z-20"
              onClick={goRight}
              aria-label="Next"
              tabIndex={0}
            >
              <HiChevronRight size={44} className="drop-shadow" />
            </button>
          </div>
          {/* Dots navigation */}
          <div className="flex justify-center gap-2 mt-4">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-3 h-3 rounded-full transition ${
                  slide === idx ? 'bg-[#25a7f0]' : 'bg-gray-300'
                }`}
                style={{ outline: 'none' }}
              />
            ))}
          </div>
        </div>

        {/* Buttons remain fixed below carousel */}
        <div className="flex flex-col sm:flex-row gap-5 justify-center mt-2">
          <Link
            to="/signin"
            className="bg-[#25a7f0] text-white text-lg font-semibold py-3 px-8 rounded-lg shadow hover:bg-[#1793d1] transition text-center flex flex-col items-center"
          >
            <span className="text-lg font-semibold">Start Free</span>
            <span className="text-xs font-normal mt-1 opacity-80">
              no cc required
            </span>
          </Link>

          <a
            href="#features"
            className="bg-white border border-[#25a7f0] text-[#25a7f0] text-lg font-semibold py-3 px-8 rounded-lg hover:bg-[#f0f8ff] transition text-center"
          >
            Learn More
          </a>
        </div>
      </div>
    </Layout>
  );
}
