import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src="/logoo.png"
              alt="Neo Trade Logo"
              className="w-20 h-auto object-contain"
            />
          </div>

          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm">
              © 2025 Neo Trade | Built at CTRL+MOVE Hackathon
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Professional Aptos Trading Analytics
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
