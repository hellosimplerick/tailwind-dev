import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case "1":
                    navigate("/account");
                    break;
                case "2":
                    navigate("/gallery");
                    break;
                case "3":
                    navigate("/memorylane");
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-8">
            <img src="/smilesm.png" alt="Welcome" className="w-40 h-auto mb-6" />
            <div className="bg-white shadow-md rounded-md p-6 max-w-md text-center">
                <h1 className="text-2xl font-semibold mb-4">
                    Welcome to MyLegacyPhotos.com
                </h1>
                <p className="mb-4">We're delighted you decided to join us.</p>
                <p className="mb-4">We can start with any of these features:</p>
                <ul className="text-left list-decimal list-inside mb-4">
                    <li>My Account Dashboard</li>
                    <li>The Gallery of Photos</li>
                    <li>Photo Memory Lane where you can add your own memories.</li>
                </ul>
                <p className="font-medium">Press the number of where you'd like to go.</p>
            </div>
        </div>
    );
}
