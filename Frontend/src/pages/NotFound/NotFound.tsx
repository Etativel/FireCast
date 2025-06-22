import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold text-neutral-100 mb-2">404</h1>
          <div className="w-24 h-1 bg-red-400 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 mb-8">
          <h2 className="text-2xl font-semibold text-neutral-100 mb-3">
            Page Not Found
          </h2>
          <p className="text-neutral-300 mb-4">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Return Home
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-neutral-700">
          <p className="text-xs text-neutral-500">Error Code: 404 | FireCast</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
