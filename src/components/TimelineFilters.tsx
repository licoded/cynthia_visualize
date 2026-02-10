/**
 * TimelineFilters Component
 *
 * Filter controls for the timeline view.
 */

import { memo, useCallback } from 'react';
import type { TimelineFilters as TimelineFiltersType } from '../types/timeline';
import { EventType } from '../types/timeline';
import { getEventTypeName } from '../utils/timelineUtils';

interface TimelineFiltersProps {
  filters: TimelineFiltersType;
  onFilterChange: (filters: Partial<TimelineFiltersType>) => void;
  eventCount: number;
  filteredCount: number;
}

export const TimelineFilters = memo<TimelineFiltersProps>(({
  filters,
  onFilterChange,
  eventCount,
  filteredCount
}) => {
  const allEventTypes: EventType[] = [
    EventType.SYSTEM_MOVE,
    EventType.ENVIRONMENT_MOVE,
    EventType.REALIZABILITY_CHECK,
    EventType.LOOP_DETECTION,
    EventType.TRANSITION,
    EventType.LOOK_AHEAD,
    EventType.STATE_DISCOVERY
  ];

  const handleTypeToggle = useCallback((type: EventType) => {
    const currentTypes = filters.eventTypes ?? [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    onFilterChange({ eventTypes: newTypes });
  }, [filters.eventTypes, onFilterChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value });
  }, [onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange({
      eventTypes: [],
      searchQuery: '',
      lineRange: undefined
    });
  }, [onFilterChange]);

  const hasActiveFilters = (
    (filters.eventTypes && filters.eventTypes.length > 0) ||
    (filters.searchQuery && filters.searchQuery.trim() !== '') ||
    filters.lineRange !== undefined
  );

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div>
        <label htmlFor="timeline-search" className="sr-only">
          Search events
        </label>
        <input
          id="timeline-search"
          type="text"
          value={filters.searchQuery ?? ''}
          onChange={handleSearchChange}
          placeholder="Search events..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        />
      </div>

      {/* Event type filters */}
      <div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Filter by event type
        </span>
        <div className="flex flex-wrap gap-2">
          {allEventTypes.map((type) => {
            const isSelected = filters.eventTypes?.includes(type);
            return (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-pressed={isSelected}
              >
                {getEventTypeName(type)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter summary and clear */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredCount} of {eventCount} events
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
});

TimelineFilters.displayName = 'TimelineFilters';
