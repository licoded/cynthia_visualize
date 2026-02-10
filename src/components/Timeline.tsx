/**
 * Timeline Component
 *
 * Displays execution flow as a vertical timeline with expandable steps.
 * Shows system moves, environment responses, realizability checks, and other events.
 */

import { memo, useCallback, useState } from 'react';
import type {
  AnyTimelineEvent,
  TimelineProps,
  TimelineFilters
} from '../types/timeline';
import { filterTimelineEvents } from '../utils/timelineUtils';
import { TimelineItem } from './TimelineItem';
import { TimelineFilters as TimelineFiltersUI } from './TimelineFilters';

export const Timeline = memo<TimelineProps>(({
  events,
  onEventSelect,
  selectedEventId,
  className = ''
}) => {
  const [filters, setFilters] = useState<TimelineFilters>({
    eventTypes: [],
    searchQuery: '',
    lineRange: undefined
  });
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<TimelineFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Filter events based on current filters
  const filteredEvents = filterTimelineEvents(events, filters);

  // Toggle event expansion
  const handleToggleExpand = useCallback((eventId: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  }, []);

  // Handle event selection
  const handleEventSelect = useCallback((event: AnyTimelineEvent) => {
    onEventSelect?.(event);
  }, [onEventSelect]);

  // Handle expand all
  const handleExpandAll = useCallback(() => {
    setExpandedEvents(new Set(filteredEvents.map(e => e.id)));
  }, [filteredEvents]);

  // Handle collapse all
  const handleCollapseAll = useCallback(() => {
    setExpandedEvents(new Set());
  }, []);

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header with filters */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-balance">
            Execution Timeline
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleExpandAll}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Expand all timeline events"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Collapse all timeline events"
            >
              Collapse All
            </button>
          </div>
        </div>
        <TimelineFiltersUI
          filters={filters}
          onFilterChange={handleFilterChange}
          eventCount={events.length}
          filteredCount={filteredEvents.length}
        />
      </div>

      {/* Timeline events */}
      <div className="flex-1 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No events match the current filters</p>
          </div>
        ) : (
          <div className="py-4 px-6">
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                aria-hidden="true"
              />

              {/* Events */}
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    expanded={expandedEvents.has(event.id)}
                    onToggle={() => handleToggleExpand(event.id)}
                    onSelect={() => handleEventSelect(event)}
                    selected={event.id === selectedEventId}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';

// Re-export types for convenience
export type { TimelineProps, TimelineFilters } from '../types/timeline';
