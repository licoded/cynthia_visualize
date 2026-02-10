/**
 * TimelineItem Component
 *
 * Individual timeline event with expandable details.
 */

import { memo } from 'react';
import type { AnyTimelineEvent, TimelineItemProps, EventType } from '../types/timeline';
import { formatTimestamp, getEventTypeName, getEventTypeColor } from '../utils/timelineUtils';

export const TimelineItem = memo<TimelineItemProps>(({
  event,
  expanded = false,
  onToggle,
  onSelect,
  selected = false
}) => {
  const colorClass = getEventTypeColor(event.type);
  const typeName = getEventTypeName(event.type);

  const handleClick = () => {
    onSelect?.();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <div
      className={`relative pl-12 cursor-pointer transition-colors rounded-lg ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-selected={selected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Timeline dot */}
      <div
        className={`absolute left-0 top-4 w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
        aria-hidden="true"
      >
        {getEventIcon(event.type)}
      </div>

      {/* Event content */}
      <div className="py-3 pr-4">
        {/* Event header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-pretty">
                {typeName}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                Line {event.lineNumber}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {formatTimestamp(event.timestamp)}
            </p>
          </div>

          {/* Expand/collapse button */}
          <button
            onClick={handleToggle}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            type="button"
          >
            <svg
              className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <TimelineEventDetails event={event} />
          </div>
        )}
      </div>
    </div>
  );
});

TimelineItem.displayName = 'TimelineItem';

/**
 * TimelineEventDetails Component
 *
 * Displays detailed information about a timeline event.
 */
function TimelineEventDetails({ event }: { event: AnyTimelineEvent }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-1 gap-2">
        {renderEventDetails(event)}
      </div>
    </div>
  );
}

/**
 * Render event-specific details
 */
function renderEventDetails(event: AnyTimelineEvent) {
  switch (event.type) {
    case 'system_move':
      return (
        <>
          <DetailRow label="Formula" value={event.data.formula} />
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'environment_move':
      return (
        <>
          <DetailRow label="Formula" value={event.data.formula} />
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'realizability_check':
      return (
        <>
          <DetailRow label="Type" value={event.data.type} />
          <DetailRow label="Status" value={event.data.status} />
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'loop_detection':
      return (
        <>
          <DetailRow label="Node ID" value={event.data.nodeId.toString()} />
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'transition':
      return (
        <>
          <DetailRow label="From" value={event.data.fromNode} />
          <DetailRow label="To" value={event.data.toNode} />
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'look_ahead':
      return (
        <>
          <DetailRow label="Type" value={event.data.type} />
          <DetailRow label="Node ID" value={event.data.nodeId.toString()} />
          {event.data.isStateNode !== undefined && (
            <DetailRow label="Is State Node" value={event.data.isStateNode ? 'Yes' : 'No'} />
          )}
          {event.data.result && <DetailRow label="Result" value={event.data.result} />}
          <DetailRow label="Line Number" value={event.data.lineNumber.toString()} />
        </>
      );

    case 'state_discovery':
      return (
        <>
          <DetailRow label="State ID" value={event.data.stateId.toString()} />
          {event.data.isFailure !== undefined && (
            <DetailRow label="Is Failure" value={event.data.isFailure ? 'Yes' : 'No'} />
          )}
          {event.data.isLoop !== undefined && (
            <DetailRow label="Is Loop" value={event.data.isLoop ? 'Yes' : 'No'} />
          )}
        </>
      );

    default:
      return <p className="text-gray-500 dark:text-gray-400">No details available</p>;
  }
}

/**
 * DetailRow Component
 *
 * Displays a label-value pair in the event details.
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-fit">
        {label}:
      </dt>
      <dd className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all">
        {value}
      </dd>
    </div>
  );
}

/**
 * Get icon for event type
 */
function getEventIcon(type: EventType): string {
  const icons: Record<EventType, string> = {
    system_move: 'S',
    environment_move: 'E',
    realizability_check: 'R',
    loop_detection: 'L',
    transition: 'T',
    look_ahead: 'A',
    state_discovery: 'D'
  };
  return icons[type] || '?';
}
