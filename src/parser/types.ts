/**
 * Type definitions for parsed Cynthia log data
 */

export enum LogLevel {
  INFO = 'info',
  DEBUG = 'debug',
  WARN = 'warn',
  ERROR = 'error',
  TRACE = 'trace'
}

export enum LogModule {
  CYNTHIA = 'cynthia',
  MAIN = 'main'
}

export interface Timestamp {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  raw: string;
  iso: string;
}

/**
 * Basic log entry with timestamp, level, module, and message
 */
export interface LogEntry {
  timestamp: Timestamp;
  level: LogLevel;
  module: LogModule | string;
  message: string;
  rawLine: string;
  lineNumber: number;
}

/**
 * State information extracted from log
 */
export interface State {
  id: number;
  isFailure?: boolean;
  isLoop?: boolean;
  lineNumber?: number;
}

/**
 * Transition between states
 */
export interface Transition {
  fromNode: string;  // e.g., "111 AND node"
  fromNodeId: number;
  fromNodeType: 'AND' | 'OR';
  toNode: string;    // e.g., "176 OR node"
  toNodeId: number;
  toNodeType: 'AND' | 'OR';
  lineNumber: number;
}

/**
 * System move (player action)
 */
export interface SystemMove {
  formula: string;
  lineNumber: number;
}

/**
 * Environment move (opponent action)
 */
export interface EnvironmentMove {
  formula: string;
  lineNumber: number;
}

/**
 * Realizability check result
 */
export interface RealizabilityCheck {
  type: 'zero-step' | 'one-step' | 'one-step-unrealizability';
  status: 'success' | 'failure';
  lineNumber: number;
}

/**
 * Loop detection event
 */
export interface LoopDetection {
  nodeId: number;
  lineNumber: number;
}

/**
 * Look-ahead information
 */
export interface LookAhead {
  nodeId: number;
  isStateNode: boolean;
  type: 'system' | 'env';
  result?: string;
  lineNumber: number;
}

/**
 * Statistics extracted from log
 */
export interface Statistics {
  exploredStates?: number;
  timeElapsed?: number;  // in milliseconds
  result?: 'realizable' | 'unrealizable';
}

/**
 * Additional metadata from parsing
 */
export interface ParsingMetadata {
  totalLines: number;
  parsedLines: number;
  failedLines: number;
  filePath: string;
  parsedAt: Date;
}

/**
 * Root interface for complete parsed log
 */
export interface ParsedLog {
  entries: LogEntry[];
  states: Map<number, State>;
  transitions: Transition[];
  systemMoves: SystemMove[];
  environmentMoves: EnvironmentMove[];
  realizabilityChecks: RealizabilityCheck[];
  loopDetections: LoopDetection[];
  lookAheads: LookAhead[];
  statistics: Statistics;
  metadata: ParsingMetadata;
}

/**
 * Serialized version of ParsedLog for JSON storage
 * (Maps converted to arrays)
 */
export interface SerializedParsedLog {
  entries: LogEntry[];
  states: State[];
  transitions: Transition[];
  systemMoves: SystemMove[];
  environmentMoves: EnvironmentMove[];
  realizabilityChecks: RealizabilityCheck[];
  loopDetections: LoopDetection[];
  lookAheads: LookAhead[];
  statistics: Statistics;
  metadata: ParsingMetadata;
}
