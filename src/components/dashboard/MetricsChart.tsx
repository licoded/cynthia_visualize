/**
 * MetricsChart Components
 *
 * Lightweight SVG-based chart components for visualizing statistics.
 * Avoids heavy charting libraries to optimize bundle size.
 */

import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  width?: string;
  className?: string;
  testId?: string;
}

/**
 * LineChart for displaying trends over time
 * Uses native SVG for lightweight implementation
 */
export function LineChart({
  data,
  height = 200,
  width = '100%',
  className = '',
  testId = 'line-chart',
}: LineChartProps): React.ReactElement | null {
  if (data.length === 0) {
    return (
      <div
        className={className}
        data-testid={testId}
        role="img"
        aria-label="No data available for chart"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  // Calculate points for the SVG path
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const normalizedValue = (point.value - minValue) / range;
    const y = 100 - normalizedValue * 100;
    return `${x},${y}`;
  });

  // Create area path (closed loop for fill)
  const areaPath = `${points.join(' L ')} L 100,100 L 0,100 Z`;

  return (
    <div
      className={className}
      data-testid={testId}
      role="img"
      aria-label={`Line chart showing ${data.length} data points`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height: `${height}px`, width }}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={`grid-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200 dark:text-gray-700"
            aria-hidden="true"
          />
        ))}

        {/* Area fill */}
        <path
          d={`M ${areaPath}`}
          fill="rgba(59, 130, 246, 0.1)"
          aria-hidden="true"
        />

        {/* Line */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="rgba(59, 130, 246, 1)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1 || 1)) * 100;
          const normalizedValue = (point.value - minValue) / range;
          const y = 100 - normalizedValue * 100;
          return (
            <circle
              key={`point-${index}`}
              cx={x}
              cy={y}
              r="3"
              fill="white"
              stroke="rgba(59, 130, 246, 1)"
              strokeWidth="2"
              aria-label={`${point.label}: ${point.value}`}
            />
          );
        })}
      </svg>

      {/* X-axis labels */}
      {data.length <= 10 && (
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {data.map((point, index) => (
            <span key={`label-${index}`} className="text-pretty">
              {point.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  thickness?: number;
  className?: string;
  testId?: string;
}

/**
 * DonutChart for displaying distribution of values
 * Uses native SVG for lightweight implementation
 */
export function DonutChart({
  data,
  size = 200,
  thickness = 20,
  className = '',
  testId = 'donut-chart',
}: DonutChartProps): React.ReactElement | null {
  if (data.length === 0) {
    return (
      <div
        className={className}
        data-testid={testId}
        role="img"
        aria-label="No data available for chart"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Default colors for segments
  const defaultColors = [
    'rgba(59, 130, 246, 1)',   // blue
    'rgba(16, 185, 129, 1)',   // green
    'rgba(245, 158, 11, 1)',   // amber
    'rgba(239, 68, 68, 1)',    // red
    'rgba(139, 92, 246, 1)',   // purple
    'rgba(236, 72, 153, 1)',   // pink
  ];

  let currentOffset = 0;

  // Handle case where total is 0 to avoid division by zero
  if (total === 0) {
    return (
      <div
        className={className}
        data-testid={testId}
        role="img"
        aria-label="No data available for chart"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div
      className={className}
      data-testid={testId}
      role="img"
      aria-label={`Donut chart showing distribution of ${data.length} categories`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={thickness}
          aria-hidden="true"
        />

        {/* Segments */}
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const offset = currentOffset;
          currentOffset += (percentage / 100) * circumference;

          return (
            <circle
              key={`segment-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color || defaultColors[index % defaultColors.length]}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={String(-offset)}
              aria-label={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
            />
          );
        })}

        {/* Center text showing total */}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-gray-900 dark:fill-gray-100"
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2"
              role="listitem"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color || defaultColors[index % defaultColors.length],
                }}
                aria-hidden="true"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.label}: {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  width?: string;
  className?: string;
  testId?: string;
}

/**
 * BarChart for displaying categorical data
 * Uses native SVG for lightweight implementation
 */
export function BarChart({
  data,
  height = 200,
  width = '100%',
  className = '',
  testId = 'bar-chart',
}: BarChartProps): React.ReactElement | null {
  if (data.length === 0) {
    return (
      <div
        className={className}
        data-testid={testId}
        role="img"
        aria-label="No data available for chart"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 80 / data.length;
  const gap = 20 / data.length;

  // Default colors for bars
  const defaultColors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
  ];

  return (
    <div
      className={className}
      data-testid={testId}
      role="img"
      aria-label={`Bar chart showing ${data.length} categories`}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ height: `${height}px`, width }}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={`grid-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-gray-200 dark:text-gray-700"
            aria-hidden="true"
          />
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 90;
          const x = index * (barWidth + gap) + gap / 2;
          const y = 100 - barHeight;

          return (
            <g key={`bar-${index}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color || defaultColors[index % defaultColors.length]}
                rx="1"
                aria-label={`${item.label}: ${item.value}`}
              />
            </g>
          );
        })}
      </svg>

      {/* X-axis labels */}
      {data.length <= 8 && (
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {data.map((item, index) => (
            <span
              key={`label-${index}`}
              className="text-pretty"
              style={{ width: `${100 / data.length}%`, textAlign: 'center' }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
