import React from "react";
import { TraderStats, SwapTransaction, TradeAnalysis } from "../api/aptos";

interface TraderDetailProps {
  stats: TraderStats;
  transactions: SwapTransaction[];
  tokenAnalysis: TradeAnalysis[];
  onBack: () => void;
}

const TraderDetail: React.FC<TraderDetailProps> = ({
  stats,
  transactions,
  tokenAnalysis,
  onBack,
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toFixed(4);
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return "text-green-600";
    if (pnl < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getActionColor = (action: string) => {
    return action === "Buy" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
          >
            ← Back to Leaderboard
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">
            Trader Analysis
          </h2>
          <p className="font-mono text-sm text-gray-600 mb-6">
            {formatAddress(stats.address)}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total Trades</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalTrades}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Total Volume</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.totalVolume)} APT
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Estimated PnL</div>
              <div
                className={`text-2xl font-bold ${getPnLColor(
                  stats.estimatedPnL
                )}`}
              >
                {stats.estimatedPnL >= 0 ? "+" : ""}
                {formatNumber(stats.estimatedPnL)} APT
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-500 mb-1">Win Rate</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.winRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Analysis */}
      {tokenAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            Token Analysis
          </h3>
          <div className="space-y-4">
            {tokenAnalysis.slice(0, 10).map((analysis, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {analysis.token}
                    </h4>
                  </div>
                  <div
                    className={`font-bold text-lg ${getPnLColor(
                      analysis.estimatedPnL
                    )}`}
                  >
                    {analysis.estimatedPnL >= 0 ? "+" : ""}
                    {formatNumber(analysis.estimatedPnL)} APT
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">Trades</div>
                    <div className="font-semibold text-gray-900">
                      {analysis.totalTrades}
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">Volume</div>
                    <div className="font-semibold text-gray-900">
                      {formatNumber(analysis.totalVolume)} APT
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">Avg Price</div>
                    <div className="font-semibold text-gray-900">
                      {formatNumber(analysis.avgPrice)} APT
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-gray-500 text-xs">Last Trade</div>
                    <div className="font-semibold text-gray-900">
                      {analysis.lastTrade.split(",")[0]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          Recent Transactions
        </h3>
        <div className="space-y-4">
          {transactions.slice(0, 20).map((tx, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      tx.action === "Buy"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tx.action}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {tx.fromAmount} {tx.fromToken} → {tx.toAmount} {tx.toToken}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{tx.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Hash:</span>
                <a
                  href={`https://aptoscan.com/transaction/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  {tx.hash.slice(0, 16)}...
                </a>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      {/* Trading Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">
          Trading Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.buyTrades}
            </div>
            <div className="text-sm text-gray-500">Buy Trades</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.sellTrades}
            </div>
            <div className="text-sm text-gray-500">Sell Trades</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.avgTradeSize)}
            </div>
            <div className="text-sm text-gray-500">Avg Trade Size (APT)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraderDetail;
