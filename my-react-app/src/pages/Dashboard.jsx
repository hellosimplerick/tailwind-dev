import React from "react";

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold text-center mb-6">
                Administrator Dashboard
            </h1>

            <div className="grid grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <button className="w-1/2 bg-blue-600 py-3 rounded text-lg font-bold text-white">
                            Upload photos
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button className="w-1/2 bg-yellow-400 py-3 rounded text-lg font-bold text-white">
                            View/Update User Exceptions/Permissions
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button className="w-1/2 bg-green-500 py-3 rounded text-lg font-bold text-white">
                            View/Edit Genealogy Chart
                        </button>
                    </div>
                </div>

                {/* Center Column */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <button className="w-1/2 bg-blue-400 py-3 rounded text-lg font-bold text-white">
                            Search for Existing Photos
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button className="w-1/2 bg-blue-400 py-3 rounded text-lg font-bold text-white">
                            Search for a Memory
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <button className="w-1/2 bg-orange-400 py-3 rounded text-lg font-bold text-white">
                            Add or Edit a User
                        </button>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <button className="w-1/2 bg-pink-400 py-3 rounded text-lg font-bold text-white">
                            Send/Answer Messages
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
