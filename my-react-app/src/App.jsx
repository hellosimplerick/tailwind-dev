function App() {
  return (
    // A dark background for the whole page in dark mode, light gray in light mode
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center font-sans">
      {/* Main container card */}
      <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden p-8 space-y-4">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 dark:text-indigo-400">
            Tailwind is Working!
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
            If you see this styled, your setup is complete.
          </p>
        </div>

        {/* Separator Line */}
        <hr className="border-slate-200 dark:border-slate-600" />

        {/* Feature List */}
        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-200">
          <li>
            Styled with{" "}
            <code className="bg-slate-200 dark:bg-slate-700 rounded px-1 font-mono text-sm">
              utility classes
            </code>
            .
          </li>
          <li>Flexbox for centering.</li>
          <li>Responsive padding and shadows.</li>
          <li>
            <span className="font-bold text-sky-500">Dark mode</span> is
            enabled.
          </li>
        </ul>

        {/* Action Button */}
        <div className="pt-4">
          <button className="w-full bg-pink-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all duration-300 ease-in-out">
            Kawabunga!
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
