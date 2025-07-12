// /src/pages/signup.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Basic email regex: must have "@" and "." after "@"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    let errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name required';
    if (!form.email.match(emailRegex)) errs.email = 'Valid email required';
    if (form.email !== form.confirmEmail)
      errs.confirmEmail = 'Emails do not match';
    if (!form.password || form.password.length < 8)
      errs.password = 'Password (min 8 chars) required';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!form.agree) errs.agree = 'You must agree to the Terms';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      // Replace with real backend endpoint
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + '/signup',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: form.firstName,
            email: form.email,
            password: form.password,
          }),
        }
      );
      if (response.ok) {
        // Auto-login or direct to welcome page
        navigate('/welcome');
      } else {
        const data = await response.json();
        setErrors({ submit: data.detail || 'Signup failed' });
      }
    } catch (err) {
      setErrors({ submit: 'Network error—try again later.' });
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function Required({ children }) {
    return (
      <span>
        {children}
        <span className="text-red-500 ml-1" title="Required">
          *
        </span>
      </span>
    );
  }

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
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-lg max-w-md w-full mx-auto p-8 flex flex-col items-center">
          <p className="text-lg font-extrabold text-gray-900 mb-4 text-left">
            Sign Up to give us a try for free. No credit card required.
          </p>

          <form
            className="w-full flex flex-col gap-4"
            onSubmit={handleSubmit}
            autoComplete="off"
            spellCheck={false}
          >
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-left pl-1">
                <Required>First Name</Required>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25a7f0]"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.firstName && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.firstName}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-left pl-1">
                <Required>Email Address</Required>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25a7f0]"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
                disabled={submitting}
              />
              {errors.email && (
                <div className="text-red-500 text-xs mt-1">{errors.email}</div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-left pl-1">
                <Required>Confirm Email Address</Required>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25a7f0]"
                type="email"
                name="confirmEmail"
                value={form.confirmEmail}
                onChange={handleChange}
                autoComplete="off"
                disabled={submitting}
              />
              {errors.confirmEmail && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.confirmEmail}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-left pl-1">
                <Required>Create Password</Required>
              </label>
              <div className="relative">
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#25a7f0]"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 px-2 text-xs text-gray-600 hover:text-black"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                  aria-label="Show/hide password"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.password}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-left pl-1">
                <Required>Confirm Password</Required>
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25a7f0]"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={submitting}
              />
              {errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
            <div className="flex items-center mb-2">
              <input
                id="agree"
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                disabled={submitting}
                className="h-4 w-4 text-[#25a7f0] border-gray-300 rounded focus:ring-[#25a7f0]"
              />
              <label
                htmlFor="agree"
                className="ml-2 text-sm text-gray-700 select-none text-left"
              >
                <Required>
                  I agree to the{' '}
                  <a
                    href="/terms"
                    className="underline text-[#25a7f0] hover:text-[#1793d1]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>
                </Required>
              </label>
            </div>
            {errors.agree && (
              <div className="text-red-500 text-xs mb-2">{errors.agree}</div>
            )}
            {errors.submit && (
              <div className="text-red-500 text-sm mb-2">{errors.submit}</div>
            )}
            <button
              type="submit"
              className="w-full bg-[#25a7f0] text-black text-lg font-extrabold py-2 px-4 rounded-lg shadow hover:bg-[#1793d1] transition disabled:opacity-60 mb-2"
              disabled={submitting}
            >
              {submitting ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center w-full my-4">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Google OAuth placeholder */}
          {/* Uncomment if using Google login */}
          {/* <div className="w-full flex justify-center">
            <GoogleLoginButton />
          </div> */}

          <div className="w-full flex justify-center mt-2">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/signin"
                className="underline text-[#25a7f0] hover:text-[#1793d1]"
              >
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
