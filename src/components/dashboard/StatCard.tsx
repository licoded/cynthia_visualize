/**
 * StatCard Component
 *
 * Displays a single metric with icon, label, value, and optional trend indicator.
 * Follows React best practices with functional components and proper typing.
 */

import React from 'react';

export interface StatCardProps {
  /** Icon element to display */
  icon: React.ReactNode;
  /** Label describing the metric */
  label: string;
  /** Primary value to display */
  value: string | number;
  /** Optional secondary value (e.g., previous period) */
  secondaryValue?: string | number;
  /** Optional trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Optional CSS class name */
  className?: string;
  /** Optional test ID for testing */
  testId?: string;
}

/**
 * StatCard displays a metric with visual styling
 * Uses semantic HTML and accessible patterns
 */
export function StatCard({
  icon,
  label,
  value,
  secondaryValue,
  trend,
  className = '',
  testId,
}: StatCardProps): React.ReactElement {
  const cardId = testId || `stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors ${className}`}
      data-testid={cardId}
      role="region"
      aria-labelledby={`${cardId}-label`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && (
              <div
                className="text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                {icon}
              </div>
            )}
            <p
              id={`${cardId}-label`}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 text-balance"
            >
              {label}
            </p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {value}
          </p>
          {secondaryValue && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 tabular-nums">
              {secondaryValue}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
                aria-label={`Trend: ${trend.isPositive ? 'increased' : 'decreased'} by ${Math.abs(trend.value)}%`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
