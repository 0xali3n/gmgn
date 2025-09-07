import React from "react";

interface NavbarProps {
  activeTab: "leaderboard" | "single" | "trader";
  onTabChange: (tab: "leaderboard" | "single" | "trader") => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {/* Neo Trade Logo */}
              <img
                src="/logoo.png"
                alt="Neo Trade Logo"
                className="w-20 h-auto object-contain"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange("leaderboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "leaderboard"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => onTabChange("single")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "single"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Single Address
            </button>
            <button className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">
              Docs
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
