import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import SignInForm from "../components/SignInForm";
import SignUpForm from "../components/SignUpForm";

const BACKEND_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function SignIn() {
    useEffect(() => {
        document.body.classList.add("bg-green-100");
        return () => document.body.classList.remove("bg-green-100");
    }, []);

    const [mode, setMode] = useState(null); // null, 'signin', or 'signup'
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState(""); // NEW: email state for signup
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    // Google handler for sign in & sign up (same endpoint and behavior)
    const handleSuccess = async (credentialResponse) => {
        const idToken = credentialResponse.credential;
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: idToken }),
            });
            if (!response.ok) throw new Error("Backend auth failed");
            // Parse backend response and store JWT in localStorage!
            const user = await response.json();
            if (user.access_token) {
                localStorage.setItem("access_token", user.access_token);
                localStorage.setItem("username", user.username || "");
                localStorage.setItem("email", user.email || "");
            }
            window.location.href = "/welcome";
        } catch (err) {
            setError("Google login error");
        }
    };


    const handleError = () => setError("Google login failed");

    // --- PATCHED LOGIN HANDLER ---
    const handleCredentialLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const user = await response.json();   // <--- NEW: Parse JSON response!
            if (user.access_token) {              // <--- NEW: Store JWT in localStorage!
                localStorage.setItem("access_token", user.access_token);
                localStorage.setItem("username", user.username || username);
                localStorage.setItem("email", user.email || "");
            }
            window.location.href = "/welcome";
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    // --- PATCHED SIGNUP HANDLER ---
    const handleCredentialSignup = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });
            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || "Signup failed");
            }
            const user = await response.json();   // <--- NEW: Parse JSON response!
            if (user.access_token) {              // <--- NEW: Store JWT in localStorage!
                localStorage.setItem("access_token", user.access_token);
                localStorage.setItem("username", user.username || username);
                localStorage.setItem("email", user.email || email);
            }
            window.location.href = "/welcome";
        } catch (err) {
            setError("Sign up failed: " + err.message);
        }
    };

    // === LOGOUT HANDLER ===
    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        window.location.href = "/";
    };

    // Main panel: welcome + image + action buttons + LOGOUT
    const renderLanding = () => (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Welcome to MyLegacyPhotos
            </h1>
            <img
                src="/tree12.jpg"
                alt="Tree"
                className="w-80 h-auto rounded shadow object-cover mb-8"
            />
            <div className="flex flex-col items-center space-y-4 w-80">
                <button
                    onClick={() => setMode("signup")}
                    className="w-full bg-green-600 text-white py-3 rounded font-bold text-lg"
                >
                    Sign Up
                </button>
                <div className="w-full flex items-center justify-center my-2">
                    <span className="font-bold text-black text-lg">OR</span>
                </div>
                <button
                    onClick={() => setMode("signin")}
                    className="w-full bg-blue-600 text-white py-3 rounded font-bold text-lg"
                >
                    Sign In
                </button>
                {/* LOGOUT BUTTON */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 text-white py-3 rounded font-bold text-lg mt-4"
                >
                    Log Out
                </button>
            </div>
        </div>
    );

    // Render appropriate panel
    return (
        <div className="min-h-screen flex items-center justify-center">
            {mode === "signin" ? (
                <SignInForm
                    username={username}
                    password={password}
                    error={error}
                    setUsername={setUsername}
                    setPassword={setPassword}
                    handleCredentialLogin={handleCredentialLogin}
                    handleSuccess={handleSuccess}
                    handleError={handleError}
                    onGoToSignUp={() => setMode("signup")}
                    onBack={() => setMode(null)}
                />
            ) : mode === "signup" ? (
                <SignUpForm
                    username={username}
                    email={email}
                    password={password}
                    confirmPassword={confirmPassword}
                    error={error}
                    setUsername={setUsername}
                    setEmail={setEmail}
                    setPassword={setPassword}
                    setConfirmPassword={setConfirmPassword}
                    handleCredentialSignup={handleCredentialSignup}
                    handleSuccess={handleSuccess}
                    handleError={handleError}
                    onGoToSignIn={() => setMode("signin")}
                    onBack={() => setMode(null)}
                />
            ) : (
                renderLanding()
            )}
        </div>
    );
}
