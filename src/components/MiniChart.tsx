import React from "react";

interface MiniChartProps {
  data: number[];
  className?: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ data, className = "" }) => {
  // Generate dummy data if none provided
  const chartData =
    data.length > 0
      ? data
      : [0, 0.5, -0.2, 0.8, 1.2, 0.9, 1.5, 1.8, 1.3, 2.1, 1.9, 2.5];

  const maxValue = Math.max(...chartData.map(Math.abs));
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue;

  // Create SVG path for the area chart
  const points = chartData.map((value, index) => {
    const x = (index / (chartData.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")} L 100,100 L 0,100 Z`;

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">PnL Trend</h4>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Last 12 trades</span>
        </div>
      </div>

      <div className="h-20 w-full">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Area chart */}
          <path d={pathData} fill="url(#gradient)" opacity="0.3" />

          {/* Line chart */}
          <path
            d={`M ${points.join(" L ")}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>Start</span>
        <span>Current</span>
      </div>
    </div>
  );
};

export default MiniChart;
