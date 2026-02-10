/**
 * Timeline utility functions
 * Converts parsed log data to timeline events
 */

import type { ParsedLog, LogEntry } from '../parser/types';
import type {
  AnyTimelineEvent,
  TimelineStatistics
} from '../types/timeline';
import { EventType } from '../types/timeline';

/**
 * Generate a unique ID for a timeline event
 */
function generateEventId(type: EventType, lineNumber: number, index: number): string {
  return `${type}-${lineNumber}-${index}`;
}

/**
 * Convert parsed log to timeline events
 * Events are sorted by timestamp and line number
 */
export function createTimelineEvents(parsedLog: ParsedLog): AnyTimelineEvent[] {
  const events: AnyTimelineEvent[] = [];
  const { entries, systemMoves, environmentMoves, realizabilityChecks, loopDetections, lookAheads, transitions } = parsedLog;

  // Create a map of line numbers to timestamps for quick lookup
  const timestampMap = new Map<number, LogEntry['timestamp']>();
  for (const entry of entries) {
    timestampMap.set(entry.lineNumber, entry.timestamp);
  }

  // Convert system moves
  systemMoves.forEach((move, index) => {
    const timestamp = timestampMap.get(move.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.SYSTEM_MOVE, move.lineNumber, index),
      timestamp,
      lineNumber: move.lineNumber,
      type: EventType.SYSTEM_MOVE,
      data: move,
      expanded: false
    });
  });

  // Convert environment moves
  environmentMoves.forEach((move, index) => {
    const timestamp = timestampMap.get(move.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.ENVIRONMENT_MOVE, move.lineNumber, index),
      timestamp,
      lineNumber: move.lineNumber,
      type: EventType.ENVIRONMENT_MOVE,
      data: move,
      expanded: false
    });
  });

  // Convert realizability checks
  realizabilityChecks.forEach((check, index) => {
    const timestamp = timestampMap.get(check.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.REALIZABILITY_CHECK, check.lineNumber, index),
      timestamp,
      lineNumber: check.lineNumber,
      type: EventType.REALIZABILITY_CHECK,
      data: check,
      expanded: false
    });
  });

  // Convert loop detections
  loopDetections.forEach((detection, index) => {
    const timestamp = timestampMap.get(detection.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.LOOP_DETECTION, detection.lineNumber, index),
      timestamp,
      lineNumber: detection.lineNumber,
      type: EventType.LOOP_DETECTION,
      data: detection,
      expanded: false
    });
  });

  // Convert transitions
  transitions.forEach((transition, index) => {
    const timestamp = timestampMap.get(transition.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.TRANSITION, transition.lineNumber, index),
      timestamp,
      lineNumber: transition.lineNumber,
      type: EventType.TRANSITION,
      data: transition,
      expanded: false
    });
  });

  // Convert look-aheads
  lookAheads.forEach((lookAhead, index) => {
    const timestamp = timestampMap.get(lookAhead.lineNumber);
    if (!timestamp) return;

    events.push({
      id: generateEventId(EventType.LOOK_AHEAD, lookAhead.lineNumber, index),
      timestamp,
      lineNumber: lookAhead.lineNumber,
      type: EventType.LOOK_AHEAD,
      data: lookAhead,
      expanded: false
    });
  });

  // Convert state discoveries
  parsedLog.states.forEach((state) => {
    const timestamp = timestampMap.get(state.lineNumber ?? 0);
    if (!timestamp || !state.lineNumber) return;

    events.push({
      id: generateEventId(EventType.STATE_DISCOVERY, state.lineNumber, state.id),
      timestamp,
      lineNumber: state.lineNumber,
      type: EventType.STATE_DISCOVERY,
      data: {
        stateId: state.id,
        isFailure: state.isFailure,
        isLoop: state.isLoop
      },
      expanded: false
    });
  });

  // Sort events by timestamp and line number
  events.sort((a, b) => {
    // First compare by timestamp components
    const aTime = a.timestamp;
    const bTime = b.timestamp;

    if (aTime.year !== bTime.year) return aTime.year - bTime.year;
    if (aTime.month !== bTime.month) return aTime.month - bTime.month;
    if (aTime.day !== bTime.day) return aTime.day - bTime.day;
    if (aTime.hours !== bTime.hours) return aTime.hours - bTime.hours;
    if (aTime.minutes !== bTime.minutes) return aTime.minutes - bTime.minutes;
    if (aTime.seconds !== bTime.seconds) return aTime.seconds - bTime.seconds;
    if (aTime.milliseconds !== bTime.milliseconds) return aTime.milliseconds - bTime.milliseconds;

    // If timestamps are equal, compare by line number
    return a.lineNumber - b.lineNumber;
  });

  return events;
}

/**
 * Calculate timeline statistics
 */
export function calculateTimelineStatistics(events: AnyTimelineEvent[]): TimelineStatistics {
  const eventsByType: Partial<Record<EventType, number>> = {};
  let startTime: Date | null = null;
  let endTime: Date | null = null;

  for (const event of events) {
    // Count by type
    eventsByType[event.type] = (eventsByType[event.type] ?? 0) + 1;

    // Track time range
    const eventTime = new Date(event.timestamp.iso);
    if (!startTime || eventTime < startTime) {
      startTime = eventTime;
    }
    if (!endTime || eventTime > endTime) {
      endTime = eventTime;
    }
  }

  return {
    totalEvents: events.length,
    eventsByType,
    timeRange: startTime && endTime ? { start: startTime, end: endTime } : null
  };
}

/**
 * Filter timeline events based on criteria
 */
export function filterTimelineEvents(
  events: AnyTimelineEvent[],
  filters: {
    eventTypes?: EventType[];
    searchQuery?: string;
    lineRange?: { start: number; end: number };
  }
): AnyTimelineEvent[] {
  return events.filter((event) => {
    // Filter by event type
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      if (!filters.eventTypes.includes(event.type)) {
        return false;
      }
    }

    // Filter by line range
    if (filters.lineRange) {
      if (
        event.lineNumber < filters.lineRange.start ||
        event.lineNumber > filters.lineRange.end
      ) {
        return false;
      }
    }

    // Filter by search query (searches in event data)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const searchData = JSON.stringify(event.data).toLowerCase();
      if (!searchData.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: { hours: number; minutes: number; seconds: number; milliseconds: number }): string {
  const hours = timestamp.hours.toString().padStart(2, '0');
  const minutes = timestamp.minutes.toString().padStart(2, '0');
  const seconds = timestamp.seconds.toString().padStart(2, '0');
  const ms = timestamp.milliseconds.toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Get event type display name
 */
export function getEventTypeName(type: EventType): string {
  const names: Record<EventType, string> = {
    system_move: 'System Move',
    environment_move: 'Environment Move',
    realizability_check: 'Realizability Check',
    loop_detection: 'Loop Detection',
    transition: 'State Transition',
    look_ahead: 'Look-Ahead',
    state_discovery: 'State Discovery'
  };
  return names[type] || type;
}

/**
 * Get event type color for UI
 */
export function getEventTypeColor(type: EventType): string {
  const colors: Record<EventType, string> = {
    system_move: 'bg-blue-500',
    environment_move: 'bg-green-500',
    realizability_check: 'bg-purple-500',
    loop_detection: 'bg-red-500',
    transition: 'bg-gray-500',
    look_ahead: 'bg-yellow-500',
    state_discovery: 'bg-indigo-500'
  };
  return colors[type] || 'bg-gray-500';
}
