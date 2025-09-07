// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  fetchTransactions,
  SwapTransaction,
  TraderStats,
  getTraderAnalysis,
} from "./api/aptos";
import Leaderboard from "./components/Leaderboard";
import TraderDetail from "./components/TraderDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MiniChart from "./components/MiniChart";
import { UpArrow, DownArrow } from "./components/ArrowIcons";

const App: React.FC = () => {
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const [singleTraderStats, setSingleTraderStats] =
    useState<TraderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state for leaderboard functionality
  const [traders, setTraders] = useState<TraderStats[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<{
    stats: TraderStats;
    transactions: SwapTransaction[];
    tokenAnalysis: any[];
  } | null>(null);
  const [view, setView] = useState<"leaderboard" | "single" | "trader">(
    "leaderboard"
  );
  const [favoriteWallet, setFavoriteWallet] = useState<string>(
    "0x09e81dc97ffc0a3d576466872dde7ee5cd144267facb0da26d85e982f498ac93"
  );

  // Predefined trader addresses - Updated wallet list
  const traderAddresses = [
    "0x0c82fcf7eef1b792e4184d837af40c6e083ed05d051d6f6e03e42ac0d581c65b",
    "0x2f9613c40a5db78deac1471adec9caadf8696d0029f7c483aca3b147f5a4487b",
    "0xcd3617c24c7bf2dcc6cadf3bbe868476416c740b9d7bf030fbd64fd2f15ee34c",
    "0x4deac5bf77600699c53cad20be9624cac8712552a0b85e68daf148bed978fe46",
    "0x3ec1448c961259d12bd1d52366c97e0ff43be06c98bed018b83b9f64590e397f",
    "0x09e81dc97ffc0a3d576466872dde7ee5cd144267facb0da26d85e982f498ac93",
  ];

  // Load leaderboard on component mount
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLeaderboardLoading(true);
    setError(null);
    setView("leaderboard");

    try {
      const { fetchMultipleTraders } = await import("./api/aptos");
      const traderData = await fetchMultipleTraders(traderAddresses);
      setTraders(traderData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleFetchTransactions = async () => {
    if (!address.trim()) {
      setError("Please enter a valid Aptos address");
      return;
    }

    setLoading(true);
    setError(null);
    setTransactions([]);
    setSingleTraderStats(null);
    setView("single");

    try {
      const data = await fetchTransactions(address.trim());
      setTransactions(data);

      // Calculate trader stats for the single address
      if (data.length > 0) {
        const { calculateTraderStats } = await import("./api/aptos");
        const stats = calculateTraderStats(address.trim(), data);
        setSingleTraderStats(stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTraderClick = async (traderAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await getTraderAnalysis(traderAddress);
      setSelectedTrader(analysis);
      setView("trader");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load trader details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (address: string) => {
    setFavoriteWallet(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900">
      {/* Navbar */}
      <Navbar
        activeTab={view}
        onTabChange={(tab) => {
          if (tab === "leaderboard") {
            loadLeaderboard();
          } else if (tab === "single") {
            setView("single");
          }
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Single Address Input */}
        {view === "single" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Single Address Analysis
              </h2>
              <p className="text-gray-600">
                Analyze any Aptos wallet address for trading insights
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Aptos wallet address (e.g., 0x123...)"
                className="flex-1 px-6 py-4 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleFetchTransactions}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold hover:shadow-xl"
              >
                {loading ? "Analyzing..." : "Analyze Address"}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {(loading || leaderboardLoading) && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">
              {view === "leaderboard"
                ? "Loading leaderboard..."
                : "Fetching data..."}
            </p>
          </div>
        )}

        {/* Content based on view */}
        {!loading && !leaderboardLoading && (
          <>
            {view === "leaderboard" && (
              <Leaderboard
                traders={traders}
                onTraderClick={handleTraderClick}
                loading={leaderboardLoading}
                favoriteWallet={favoriteWallet}
                onFavoriteChange={handleFavoriteChange}
              />
            )}

            {view === "trader" && selectedTrader && (
              <TraderDetail
                stats={selectedTrader.stats}
                transactions={selectedTrader.transactions}
                tokenAnalysis={selectedTrader.tokenAnalysis}
                onBack={loadLeaderboard}
              />
            )}

            {view === "single" && transactions.length > 0 && (
              <div className="space-y-6">
                {/* Trader Statistics */}
                {singleTraderStats && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Trader Analysis
                    </h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {singleTraderStats.totalTrades}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          Total Trades
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {singleTraderStats.totalVolume.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          Volume (APT)
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 text-center border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <UpArrow className="w-6 h-6 text-green-600" />
                          <div className="text-3xl font-bold text-green-600">
                            {singleTraderStats.buyTrades}
                          </div>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Buy Trades
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 text-center border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <DownArrow className="w-6 h-6 text-red-600" />
                          <div className="text-3xl font-bold text-red-600">
                            {singleTraderStats.sellTrades}
                          </div>
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          Sell Trades
                        </div>
                      </div>
                    </div>

                    {/* PnL and Chart Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* PnL Card */}
                      <div
                        className={`rounded-xl p-6 border-2 shadow-sm ${
                          singleTraderStats.estimatedPnL >= 0
                            ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                            : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">
                            Estimated PnL
                          </div>
                          <div
                            className={`text-4xl font-bold ${
                              singleTraderStats.estimatedPnL >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {singleTraderStats.estimatedPnL >= 0 ? "+" : ""}
                            {singleTraderStats.estimatedPnL.toFixed(4)} APT
                          </div>
                        </div>
                      </div>

                      {/* Mini Chart */}
                      <MiniChart data={[]} />
                    </div>
                  </div>
                )}

                {/* Transactions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Swap Transactions ({transactions.length} swaps)
                  </h2>
                  <div className="space-y-4">
                    {transactions.map((tx, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        {/* Transaction Header */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-700">
                              Swap #{index + 1}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                tx.action === "Buy"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.action}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {tx.timestamp}
                          </span>
                        </div>

                        {/* Swap Details */}
                        <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-sm text-gray-500">From</div>
                              <div className="font-mono text-sm font-semibold text-gray-900">
                                {tx.fromAmount} {tx.fromToken}
                              </div>
                            </div>
                            <div className="text-2xl text-gray-400">→</div>
                            <div className="text-center">
                              <div className="text-sm text-gray-500">To</div>
                              <div className="font-mono text-sm font-semibold text-gray-900">
                                {tx.toAmount} {tx.toToken}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Hash:</span>
                          <a
                            href={`https://aptoscan.com/transaction/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {tx.hash}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">
                    Note: Showing only swap transactions. Click on a trader in
                    the leaderboard for detailed PnL analysis.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
