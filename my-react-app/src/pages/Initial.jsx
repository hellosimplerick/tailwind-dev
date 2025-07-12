// /src/pages/Initial.jsx

import React, { useRef } from "react";

export default function Initial() {
  const fileInputRef = useRef();
  const folderInputRef = useRef();

  // Click handlers
  const handleFilesClick = () => {
    fileInputRef.current.value = null; // Reset file input
    fileInputRef.current.click();
  };

  const handleFolderClick = () => {
    folderInputRef.current.value = null; // Reset folder input
    folderInputRef.current.click();
  };

  // Acceptable file types
  const ACCEPTED_FORMATS = ".jpg,.jpeg,.png";

  // File selection logic (can be replaced with upload logic later)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      /\.(jpe?g|png)$/i.test(file.name)
    );
    console.log("Selected files:", validFiles);
    // TODO: upload logic here
  };

  const handleFolderChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file =>
      /\.(jpe?g|png)$/i.test(file.name)
    );
    console.log("Selected folder images:", validFiles);
    // TODO: upload logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-24">
        {/* Left: Welcome Text */}
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-4xl font-extrabold text-black mb-2 leading-tight text-center md:text-left">
            Welcome to MLP!
            <br />
            To get started, upload a
            <br />
            folder of images or pick
            <br />
            the photos you want to
            <br />
            upload.
          </h1>
        </div>

        {/* Right: Upload Buttons */}
        <div className="flex flex-col items-center space-y-6">
          <button
            className="bg-[#25a7f0] text-white text-base font-semibold py-3 px-12 rounded-lg focus:outline-none shadow border border-[#222]"
            onClick={handleFilesClick}
          >
            Upload Files
          </button>
          <input
            type="file"
            accept={ACCEPTED_FORMATS}
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            className="bg-[#25a7f0] text-white text-base font-semibold py-3 px-12 rounded-lg focus:outline-none shadow border border-[#222]"
            onClick={handleFolderClick}
          >
            Upload Folder
          </button>
          <input
            type="file"
            accept={ACCEPTED_FORMATS}
            multiple
            ref={folderInputRef}
            onChange={handleFolderChange}
            className="hidden"
            webkitdirectory="true"
            directory="true"
          />
        </div>
      </div>
    </div>
  );
}
