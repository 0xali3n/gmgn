// src/App.tsx
import React, { useState } from "react";
import { fetchTransactions, SwapTransaction } from "./api/aptos";

const App: React.FC = () => {
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState<SwapTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchTransactions = async () => {
    if (!address.trim()) {
      setError("Please enter a valid Aptos address");
      return;
    }

    setLoading(true);
    setError(null);
    setTransactions([]);

    try {
      const data = await fetchTransactions(address.trim());
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Aptos Swap Explorer</h1>
          <p className="text-lg mb-6">
            Enter an Aptos wallet address to view recent swap transactions
          </p>
        </div>

        {/* Input and Button */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Aptos wallet address (e.g., 0x123...)"
              className="flex-1 px-4 py-2 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-300 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
            <button
              onClick={handleFetchTransactions}
              disabled={loading}
              className="px-6 py-2 bg-white text-indigo-500 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Fetching..." : "Fetch Swaps"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-2">Fetching transactions...</p>
          </div>
        )}

        {/* Swap Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Swap Transactions ({transactions.length} swaps)
            </h2>
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-black bg-opacity-20 rounded-lg p-4 border border-white border-opacity-20"
                >
                  {/* Transaction Header */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-yellow-300">
                        Swap #{index + 1}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          tx.action === "Buy"
                            ? "bg-green-500 bg-opacity-20 text-green-200"
                            : "bg-red-500 bg-opacity-20 text-red-200"
                        }`}
                      >
                        {tx.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {tx.timestamp}
                    </span>
                  </div>

                  {/* Swap Details */}
                  <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-sm text-gray-300">From</div>
                        <div className="font-mono text-sm font-semibold">
                          {tx.fromAmount} {tx.fromToken}
                        </div>
                      </div>
                      <div className="text-2xl text-gray-400">→</div>
                      <div className="text-center">
                        <div className="text-sm text-gray-300">To</div>
                        <div className="font-mono text-sm font-semibold">
                          {tx.toAmount} {tx.toToken}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">Hash:</span>
                    <a
                      href={`https://aptoscan.com/transaction/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-300 hover:text-blue-200 underline cursor-pointer"
                    >
                      {tx.hash}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-300 mt-4 italic">
              Note: Showing only swap transactions. Future updates will
              calculate PnL and add more detailed analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
