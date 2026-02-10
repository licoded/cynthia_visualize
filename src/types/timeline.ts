/**
 * Timeline component types
 * Defines the structure for timeline events and UI state
 */

import type {
  LogEntry,
  SystemMove,
  EnvironmentMove,
  RealizabilityCheck,
  LoopDetection,
  LookAhead,
  Transition
} from '../parser/types';

/**
 * Base timeline event type
 */
export interface TimelineEvent {
  id: string;
  timestamp: LogEntry['timestamp'];
  lineNumber: number;
  type: EventType;
  expanded?: boolean;
}

/**
 * Event types for the timeline
 */
export enum EventType {
  SYSTEM_MOVE = 'system_move',
  ENVIRONMENT_MOVE = 'environment_move',
  REALIZABILITY_CHECK = 'realizability_check',
  LOOP_DETECTION = 'loop_detection',
  TRANSITION = 'transition',
  LOOK_AHEAD = 'look_ahead',
  STATE_DISCOVERY = 'state_discovery'
}

/**
 * System move timeline event
 */
export interface SystemMoveEvent extends TimelineEvent {
  type: EventType.SYSTEM_MOVE;
  data: SystemMove;
}

/**
 * Environment move timeline event
 */
export interface EnvironmentMoveEvent extends TimelineEvent {
  type: EventType.ENVIRONMENT_MOVE;
  data: EnvironmentMove;
}

/**
 * Realizability check timeline event
 */
export interface RealizabilityCheckEvent extends TimelineEvent {
  type: EventType.REALIZABILITY_CHECK;
  data: RealizabilityCheck;
}

/**
 * Loop detection timeline event
 */
export interface LoopDetectionEvent extends TimelineEvent {
  type: EventType.LOOP_DETECTION;
  data: LoopDetection;
}

/**
 * Transition timeline event
 */
export interface TransitionEvent extends TimelineEvent {
  type: EventType.TRANSITION;
  data: Transition;
}

/**
 * Look-ahead timeline event
 */
export interface LookAheadEvent extends TimelineEvent {
  type: EventType.LOOK_AHEAD;
  data: LookAhead;
}

/**
 * State discovery timeline event
 */
export interface StateDiscoveryEvent extends TimelineEvent {
  type: EventType.STATE_DISCOVERY;
  data: {
    stateId: number;
    isFailure?: boolean;
    isLoop?: boolean;
  };
}

/**
 * Union type for all timeline events
 */
export type AnyTimelineEvent =
  | SystemMoveEvent
  | EnvironmentMoveEvent
  | RealizabilityCheckEvent
  | LoopDetectionEvent
  | TransitionEvent
  | LookAheadEvent
  | StateDiscoveryEvent;

/**
 * Timeline component props
 */
export interface TimelineProps {
  events: AnyTimelineEvent[];
  onEventSelect?: (event: AnyTimelineEvent) => void;
  selectedEventId?: string;
  className?: string;
}

/**
 * Timeline item component props
 */
export interface TimelineItemProps {
  event: AnyTimelineEvent;
  expanded?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  selected?: boolean;
}

/**
 * Event filter options
 */
export interface TimelineFilters {
  eventTypes: EventType[];
  searchQuery?: string;
  lineRange?: {
    start: number;
    end: number;
  };
}

/**
 * Timeline statistics
 */
export interface TimelineStatistics {
  totalEvents: number;
  eventsByType: Partial<Record<EventType, number>>;
  timeRange: {
    start: Date;
    end: Date;
  } | null;
}
