import React, { useState } from "react";
import { TraderStats } from "../api/aptos";
import CopyTradeModal from "./CopyTradeModal";
import { UpArrow, DownArrow } from "./ArrowIcons";

interface LeaderboardProps {
  traders: TraderStats[];
  onTraderClick: (address: string) => void;
  loading: boolean;
  favoriteWallet: string;
  onFavoriteChange: (address: string) => void;
}

// Helper function to validate trader data
const isValidTrader = (trader: TraderStats): boolean => {
  const hasValidTrades = trader.totalTrades > 0;
  const hasValidAddress =
    trader.address && trader.address !== "N/A" && trader.address.length > 10;
  const hasValidPnL = !isNaN(trader.estimatedPnL);

  return hasValidTrades && hasValidAddress && hasValidPnL;
};

const Leaderboard: React.FC<LeaderboardProps> = ({
  traders,
  onTraderClick,
  loading,
  favoriteWallet,
  onFavoriteChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<string>("");

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toFixed(2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleCopyTrade = (address: string) => {
    setSelectedTrader(address);
    setModalOpen(true);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${index + 1}`;
    }
  };

  const getPnLBgColor = (pnl: number) => {
    if (pnl > 0) return "bg-green-50 border-green-200";
    if (pnl < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600";
    if (pnl < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Aptos Trading Leaderboard
          </h2>
          <p className="text-gray-600">
            Top performing Aptos traders ranked by PnL
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  <div className="w-20 h-4 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-300 rounded"></div>
                  <div className="w-24 h-3 bg-gray-300 rounded"></div>
                  <div className="w-28 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const validTraders = traders.filter(isValidTrader);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm font-medium text-gray-600">Live Data</span>
        </div>
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Aptos Trading Leaderboard
        </h2>
        <p className="text-gray-600">
          Top performing Aptos traders ranked by PnL
        </p>
      </div>

      {/* Trader Cards */}
      {validTraders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validTraders.map((trader, index) => (
            <div
              key={trader.address}
              className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer"
            >
              {/* Header with Rank and Copy Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-gray-800">
                    {getRankIcon(index)}
                  </div>
                  {index < 3 && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                  {/* Favorite Star - Instagram-like like button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteChange(trader.address);
                    }}
                    className="text-xl transition-all duration-200 hover:scale-110 focus:outline-none"
                  >
                    {trader.address === favoriteWallet ? (
                      <span className="text-yellow-500">⭐</span>
                    ) : (
                      <span className="text-gray-400 hover:text-yellow-400">
                        ☆
                      </span>
                    )}
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyTrade(trader.address);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-full hover:from-blue-700 hover:to-purple-700 transition duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Copy Trade
                </button>
              </div>

              {/* Address with Copy Button */}
              <div className="mb-6">
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {formatAddress(trader.address)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(trader.address);
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* PnL with Color-coded Badge */}
              <div
                className={`rounded-xl p-4 mb-6 border-2 ${getPnLBgColor(
                  trader.estimatedPnL
                )} shadow-sm`}
              >
                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  Estimated PnL
                </div>
                <div
                  className={`text-2xl font-bold ${getPnLColor(
                    trader.estimatedPnL
                  )}`}
                >
                  {trader.estimatedPnL >= 0 ? "+" : ""}
                  {formatNumber(trader.estimatedPnL)} APT
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-gray-900">
                    {trader.totalTrades}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Total Trades
                  </div>
                </div>
                <div className="text-center bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="text-xl font-bold text-gray-900">
                    {formatNumber(trader.totalVolume)}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    Volume (APT)
                  </div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200 shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <UpArrow className="w-5 h-5 text-green-600" />
                    <div className="text-xl font-bold text-green-600">
                      {trader.buyTrades}
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Buy Trades
                  </div>
                </div>
                <div className="text-center bg-red-50 rounded-lg p-3 border border-red-200 shadow-sm">
                  <div className="flex items-center justify-center gap-2">
                    <DownArrow className="w-5 h-5 text-red-600" />
                    <div className="text-xl font-bold text-red-600">
                      {trader.sellTrades}
                    </div>
                  </div>
                  <div className="text-xs text-red-600 font-medium">
                    Sell Trades
                  </div>
                </div>
              </div>

              {/* Top Tokens as Pills */}
              {trader.topTokens.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                    Top Tokens
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trader.topTokens.slice(0, 3).map((token, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-700 text-xs rounded-full border border-blue-200 font-medium"
                      >
                        {token.token} ({token.trades})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Trade */}
              <div className="text-xs text-gray-500 mb-6 bg-gray-50 px-3 py-2 rounded-lg">
                {trader.lastTradeTime !== "N/A"
                  ? "Last trade: " + trader.lastTradeTime.split(",")[0]
                  : "No recent trades"}
              </div>

              {/* View Details Button */}
              <button
                onClick={() => onTraderClick(trader.address)}
                className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition duration-200 font-semibold shadow-sm"
              >
                View Detailed Analysis
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Traders Found
            </h3>
            <p className="text-gray-500">
              No traders with valid trading data found. Transactions with N/A
              data are automatically filtered out.
            </p>
          </div>
        </div>
      )}

      {/* Copy Trade Modal */}
      <CopyTradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        traderAddress={selectedTrader}
      />
    </div>
  );
};

export default Leaderboard;
