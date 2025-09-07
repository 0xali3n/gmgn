import React from "react";

interface CopyTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  traderAddress: string;
}

const CopyTradeModal: React.FC<CopyTradeModalProps> = ({
  isOpen,
  onClose,
  traderAddress,
}) => {
  if (!isOpen) return null;

  const handleCopyTrade = async () => {
    try {
      // Copy trader address to clipboard
      await navigator.clipboard.writeText(traderAddress);

      // Open Telegram bot
      const telegramUrl = `https://t.me/AptoTrade_bot`;
      window.open(telegramUrl, "_blank");

      onClose();
    } catch (err) {
      console.error("Failed to copy address to clipboard:", err);
      // Fallback: still open Telegram bot even if clipboard fails
      const telegramUrl = `https://t.me/AptoTrade_bot`;
      window.open(telegramUrl, "_blank");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">Copy Trade</h3>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            You're about to copy trades from this trader. This will redirect you
            to our Telegram bot.
          </p>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500 mb-1">Trader Address:</p>
            <p className="font-mono text-sm text-gray-900 break-all">
              {traderAddress.slice(0, 6)}...{traderAddress.slice(-4)}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCopyTrade}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Copy Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyTradeModal;
