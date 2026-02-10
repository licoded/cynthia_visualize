/**
 * StatisticsDashboard Component
 *
 * Main dashboard component displaying parsed Cynthia log statistics.
 * Shows summary cards and visual charts for key metrics.
 */

import React, { useMemo } from 'react';
import type { ParsedLog } from '../../parser/types';
import { StatCard, LineChart, DonutChart, BarChart } from './index';

export interface StatisticsDashboardProps {
  /** Parsed log data to visualize */
  data: ParsedLog;
  /** Optional CSS class name */
  className?: string;
  /** Optional test ID for testing */
  testId?: string;
}

/**
 * Icon components using inline SVG for bundle size optimization
 */
const Icons = {
  States: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" strokeWidth="2" />
    </svg>
  ),
  Time: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
    </svg>
  ),
  Transitions: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 8l4 4-4 4M7 8l-4 4 4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Loops: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h4" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Moves: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 2L3 14h8l-2 10 10-12h-8l2-10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * StatisticsDashboard displays key metrics and visualizations
 * Calculates derived statistics from parsed log data
 */
export function StatisticsDashboard({
  data,
  className = '',
  testId = 'statistics-dashboard',
}: StatisticsDashboardProps): React.ReactElement {
  // Memoize calculations to avoid recomputation
  const metrics = useMemo(() => {
    const totalStates = data.states.size;
    const totalTransitions = data.transitions.length;
    const totalLoops = data.loopDetections.length;
    const systemMoves = data.systemMoves.length;
    const environmentMoves = data.environmentMoves.length;
    const realizabilityChecks = data.realizabilityChecks.length;

    // Calculate state types
    const failureStates = Array.from(data.states.values()).filter((s) => s.isFailure).length;
    const loopStates = Array.from(data.states.values()).filter((s) => s.isLoop).length;
    const normalStates = totalStates - failureStates - loopStates;

    // Calculate transition types
    const andToOr = data.transitions.filter((t) => t.fromNodeType === 'AND' && t.toNodeType === 'OR').length;
    const orToAnd = data.transitions.filter((t) => t.fromNodeType === 'OR' && t.toNodeType === 'AND').length;
    const andToAnd = data.transitions.filter((t) => t.fromNodeType === 'AND' && t.toNodeType === 'AND').length;
    const orToOr = data.transitions.filter((t) => t.fromNodeType === 'OR' && t.toNodeType === 'OR').length;

    // Get time information
    const timeElapsed = data.statistics.timeElapsed ?? 0;
    const timeInSeconds = (timeElapsed / 1000).toFixed(2);
    const timeInMinutes = (timeElapsed / 60000).toFixed(2);

    // Get realizability result
    const result = data.statistics.result ?? 'unknown';

    return {
      totalStates,
      totalTransitions,
      totalLoops,
      systemMoves,
      environmentMoves,
      realizabilityChecks,
      failureStates,
      loopStates,
      normalStates,
      andToOr,
      orToAnd,
      andToAnd,
      orToOr,
      timeElapsed,
      timeInSeconds,
      timeInMinutes,
      result,
    };
  }, [data]);

  // Generate timeline data for state exploration
  const timelineData = useMemo(() => {
    // Group states by time buckets (assuming we have timestamp info)
    const timeBuckets: Record<string, number> = {};

    data.transitions.forEach((transition) => {
      // Create a simple bucket based on line number as proxy for time
      const bucket = Math.floor(transition.lineNumber / 100) * 100;
      timeBuckets[bucket] = (timeBuckets[bucket] || 0) + 1;
    });

    return Object.entries(timeBuckets)
      .map(([label, value]) => ({ label: `${label}`, value }))
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [data.transitions]);

  // State type distribution for donut chart
  const stateDistributionData = useMemo(
    () => [
      { label: 'Normal', value: metrics.normalStates, color: 'rgba(59, 130, 246, 1)' },
      { label: 'Failure', value: metrics.failureStates, color: 'rgba(239, 68, 68, 1)' },
      { label: 'Loop', value: metrics.loopStates, color: 'rgba(245, 158, 11, 1)' },
    ],
    [metrics.normalStates, metrics.failureStates, metrics.loopStates]
  );

  // Transition type distribution for bar chart
  const transitionTypeData = useMemo(
    () => [
      { label: 'AND→OR', value: metrics.andToOr, color: 'rgba(59, 130, 246, 0.8)' },
      { label: 'OR→AND', value: metrics.orToAnd, color: 'rgba(16, 185, 129, 0.8)' },
      { label: 'AND→AND', value: metrics.andToAnd, color: 'rgba(245, 158, 11, 0.8)' },
      { label: 'OR→OR', value: metrics.orToOr, color: 'rgba(139, 92, 246, 0.8)' },
    ],
    [metrics.andToOr, metrics.orToAnd, metrics.andToAnd, metrics.orToOr]
  );

  return (
    <div
      className={`space-y-6 ${className}`}
      data-testid={testId}
      role="region"
      aria-label="Statistics Dashboard"
    >
      {/* Summary Cards */}
      <section aria-label="Summary Metrics">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
          Summary
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard
            icon={<Icons.States />}
            label="Total States"
            value={metrics.totalStates.toLocaleString()}
            testId="stat-total-states"
          />
          <StatCard
            icon={<Icons.Time />}
            label="Execution Time"
            value={metrics.timeElapsed > 0 ? `${metrics.timeInSeconds}s` : 'N/A'}
            secondaryValue={metrics.timeElapsed > 60000 ? `(${metrics.timeInMinutes} min)` : undefined}
            testId="stat-execution-time"
          />
          <StatCard
            icon={<Icons.Check />}
            label="Result"
            value={metrics.result === 'realizable' ? 'Realizable' : metrics.result === 'unrealizable' ? 'Unrealizable' : 'Unknown'}
            testId="stat-result"
          />
          <StatCard
            icon={<Icons.Transitions />}
            label="Transitions"
            value={metrics.totalTransitions.toLocaleString()}
            testId="stat-transitions"
          />
          <StatCard
            icon={<Icons.Loops />}
            label="Loop Detections"
            value={metrics.totalLoops.toLocaleString()}
            testId="stat-loops"
          />
        </div>
      </section>

      {/* Additional Metrics */}
      <section aria-label="Additional Metrics">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
          Additional Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Icons.Moves />}
            label="System Moves"
            value={metrics.systemMoves.toLocaleString()}
            testId="stat-system-moves"
          />
          <StatCard
            icon={<Icons.Moves />}
            label="Environment Moves"
            value={metrics.environmentMoves.toLocaleString()}
            testId="stat-environment-moves"
          />
          <StatCard
            icon={<Icons.Check />}
            label="Realizability Checks"
            value={metrics.realizabilityChecks.toLocaleString()}
            testId="stat-realizability-checks"
          />
        </div>
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <section aria-label="State Exploration Timeline" role="region">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
            State Exploration Timeline
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <LineChart data={timelineData} height={200} testId="chart-timeline" />
          </div>
        </section>

        {/* State Distribution */}
        <section aria-label="State Type Distribution" role="region">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
            State Type Distribution
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex justify-center">
            <DonutChart data={stateDistributionData} size={200} testId="chart-state-distribution" />
          </div>
        </section>

        {/* Transition Types */}
        <section aria-label="Transition Types" role="region" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
            Transition Types
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <BarChart data={transitionTypeData} height={200} testId="chart-transition-types" />
          </div>
        </section>
      </div>

      {/* Metadata */}
      <section aria-label="Parsing Information" role="region">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-balance">
          Parsing Information
        </h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Total Lines:</span>{' '}
              {data.metadata.totalLines.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Parsed Lines:</span>{' '}
              {data.metadata.parsedLines.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Failed Lines:</span>{' '}
              {data.metadata.failedLines.toLocaleString()}
            </div>
            <div>
              <span className="font-medium">File:</span> {data.metadata.filePath}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
