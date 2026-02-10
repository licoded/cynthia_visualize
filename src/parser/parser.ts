/**
 * Cynthia Log Parser
 * Parses Cynthia log files into structured JSON data
 */

import { LogLevel } from './types';
import type {
  LogEntry,
  LogModule,
  Timestamp,
  State,
  Transition,
  SystemMove,
  EnvironmentMove,
  RealizabilityCheck,
  LoopDetection,
  LookAhead,
  Statistics,
  ParsedLog,
  ParsingMetadata,
  SerializedParsedLog
} from './types';

/**
 * Parse timestamp from log format: [2026-02-10 09:45:07.117]
 */
function parseTimestamp(timestampStr: string): Timestamp {
  // Format: 2026-02-10 09:45:07.117
  const match = timestampStr.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  if (!match) {
    throw new Error(`Invalid timestamp format: ${timestampStr}`);
  }

  const [, year, month, day, hours, minutes, seconds, milliseconds] = match;

  const timestamp: Timestamp = {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    hours: parseInt(hours, 10),
    minutes: parseInt(minutes, 10),
    seconds: parseInt(seconds, 10),
    milliseconds: parseInt(milliseconds, 10),
    raw: timestampStr,
    iso: new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10),
      parseInt(milliseconds, 10)
    ).toISOString()
  };

  return timestamp;
}

/**
 * Parse log level string to enum
 */
function parseLogLevel(levelStr: string): LogLevel {
  const normalized = levelStr.toLowerCase();
  switch (normalized) {
    case 'info':
      return LogLevel.INFO;
    case 'debug':
      return LogLevel.DEBUG;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    case 'trace':
      return LogLevel.TRACE;
    default:
      return LogLevel.INFO;
  }
}

/**
 * Parse a single log line into a LogEntry
 */
function parseLogLine(line: string, lineNumber: number): LogEntry | null {
  // Format: [2026-02-10 09:45:07.117] [cynthia] [info] [main] message
  const regex = /^\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+\[(.*?)\]\s+(.*)$/;
  const match = line.match(regex);

  if (!match) {
    return null;
  }

  const [, timestampStr, , levelStr, moduleStr, message] = match;

  return {
    timestamp: parseTimestamp(timestampStr),
    level: parseLogLevel(levelStr),
    module: moduleStr,
    message,
    rawLine: line,
    lineNumber
  };
}

/**
 * Extract state information from log entry
 */
function extractState(entry: LogEntry): State | null {
  // Format: "State 112" or "State 300 is failure"
  const stateMatch = entry.message.match(/^State (\d+)(?: is (failure))?$/);
  if (stateMatch) {
    const [, idStr, failure] = stateMatch;
    return {
      id: parseInt(idStr, 10),
      isFailure: failure === 'failure',
      lineNumber: entry.lineNumber
    };
  }

  // Check for loop detection in message
  const loopMatch = entry.message.match(/Loop detected for node (\d+)/);
  if (loopMatch) {
    const [, idStr] = loopMatch;
    return {
      id: parseInt(idStr, 10),
      isLoop: true,
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract transition from log entry
 */
function extractTransition(entry: LogEntry): Transition | null {
  // Format: "Adding transition (111 AND node, 7, 176 OR node)"
  const transitionMatch = entry.message.match(
    /Adding transition \((\d+) (AND|OR) node,\s*\d+,\s*(\d+) (AND|OR) node\)/
  );

  if (transitionMatch) {
    const [, fromNodeIdStr, fromNodeType, toNodeIdStr, toNodeType] = transitionMatch;

    return {
      fromNode: `${fromNodeIdStr} ${fromNodeType} node`,
      fromNodeId: parseInt(fromNodeIdStr, 10),
      fromNodeType: fromNodeType as 'AND' | 'OR',
      toNode: `${toNodeIdStr} ${toNodeType} node`,
      toNodeId: parseInt(toNodeIdStr, 10),
      toNodeType: toNodeType as 'AND' | 'OR',
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract system move from log entry
 */
function extractSystemMove(entry: LogEntry): SystemMove | null {
  // Format: "checking system move: p1"
  const moveMatch = entry.message.match(/checking system move:\s*(.*)/);

  if (moveMatch) {
    return {
      formula: moveMatch[1].trim(),
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract environment move from log entry
 */
function extractEnvironmentMove(entry: LogEntry): EnvironmentMove | null {
  // Format: "env move: !p0"
  const moveMatch = entry.message.match(/env move:\s*(.*)/);

  if (moveMatch) {
    return {
      formula: moveMatch[1].trim(),
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract realizability check from log entry
 */
function extractRealizabilityCheck(entry: LogEntry): RealizabilityCheck | null {
  // Check zero-step realizability
  if (entry.message.includes('Check zero-step realizability')) {
    return {
      type: 'zero-step',
      status: 'success',
      lineNumber: entry.lineNumber
    };
  }

  // Check one-step realizability
  if (entry.message.includes('Check one-step realizability')) {
    return {
      type: 'one-step',
      status: 'success',
      lineNumber: entry.lineNumber
    };
  }

  // Check one-step unrealizability
  if (entry.message.includes('Check one-step unrealizability')) {
    return {
      type: 'one-step-unrealizability',
      status: 'success',
      lineNumber: entry.lineNumber
    };
  }

  // Check for successful realizability checks
  if (entry.message.includes('one-step realizability check was successful')) {
    return {
      type: 'one-step',
      status: 'success',
      lineNumber: entry.lineNumber
    };
  }

  // Check for successful unrealizability checks
  if (entry.message.includes('one-step unrealizability check was successful')) {
    return {
      type: 'one-step-unrealizability',
      status: 'success',
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract loop detection from log entry
 */
function extractLoopDetection(entry: LogEntry): LoopDetection | null {
  // Format: "Loop detected for node 300, tagging the node"
  const loopMatch = entry.message.match(/Loop detected for node (\d+)/);

  if (loopMatch) {
    return {
      nodeId: parseInt(loopMatch[1], 10),
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract look-ahead information from log entry
 */
function extractLookAhead(entry: LogEntry): LookAhead | null {
  // Format: "system look-ahead: 111 is not a state node"
  const systemLookAhead = entry.message.match(/system look-ahead:\s*(\d+) is (not )?a state node/);
  if (systemLookAhead) {
    const [, nodeIdStr, not] = systemLookAhead;
    return {
      nodeId: parseInt(nodeIdStr, 10),
      isStateNode: !not,
      type: 'system',
      lineNumber: entry.lineNumber
    };
  }

  // Format: "env look-ahead: one-step realizability check was successful"
  const envSuccessMatch = entry.message.match(/env look-ahead: (one-step [a-z]+ check was successful)/);
  if (envSuccessMatch) {
    return {
      nodeId: 0,
      isStateNode: false,
      type: 'env',
      result: envSuccessMatch[1],
      lineNumber: entry.lineNumber
    };
  }

  // Format: "env look-ahead: next state 109 not discovered yet"
  // Format: "env look-ahead: next state 176 already discovered, success, ignoring"
  const envNextStateMatch = entry.message.match(/env look-ahead: next state (\d+)(.*)$/);
  if (envNextStateMatch) {
    const [, nodeIdStr, status] = envNextStateMatch;
    return {
      nodeId: parseInt(nodeIdStr, 10),
      isStateNode: false,
      type: 'env',
      result: status.trim(),
      lineNumber: entry.lineNumber
    };
  }

  return null;
}

/**
 * Extract statistics from log entries
 */
function extractStatistics(entries: LogEntry[]): Statistics {
  const stats: Statistics = {};

  for (const entry of entries) {
    // Extract explored states
    const exploredMatch = entry.message.match(/Explored states:\s*(\d+)/);
    if (exploredMatch) {
      stats.exploredStates = parseInt(exploredMatch[1], 10);
    }

    // Extract time elapsed
    const timeMatch = entry.message.match(/Overall time elapsed:\s*([\d.]+)(ms|s)/);
    if (timeMatch) {
      const [, value, unit] = timeMatch;
      const numericValue = parseFloat(value);
      stats.timeElapsed = unit === 's' ? numericValue * 1000 : numericValue;
    }

    // Extract result - check unrealizable first since it contains "realizable"
    if (entry.message.includes('unrealizable.')) {
      stats.result = 'unrealizable';
    } else if (entry.message.includes('realizable.') && !entry.message.includes('unrealizable.')) {
      stats.result = 'realizable';
    }
  }

  return stats;
}

/**
 * Main parser function - converts log file content to structured data
 */
export function parseLog(content: string, filePath: string = 'unknown'): ParsedLog {
  const lines = content.split('\n');
  const entries: LogEntry[] = [];
  const states = new Map<number, State>();
  const transitions: Transition[] = [];
  const systemMoves: SystemMove[] = [];
  const environmentMoves: EnvironmentMove[] = [];
  const realizabilityChecks: RealizabilityCheck[] = [];
  const loopDetections: LoopDetection[] = [];
  const lookAheads: LookAhead[] = [];

  let parsedLines = 0;
  let failedLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const entry = parseLogLine(line, i + 1);
    if (entry) {
      entries.push(entry);
      parsedLines++;

      // Extract structured data from entry
      const state = extractState(entry);
      if (state) {
        // Merge state info if already exists
        const existing = states.get(state.id);
        if (existing) {
          states.set(state.id, {
            ...existing,
            ...state
          });
        } else {
          states.set(state.id, state);
        }
      }

      const transition = extractTransition(entry);
      if (transition) {
        transitions.push(transition);
      }

      const systemMove = extractSystemMove(entry);
      if (systemMove) {
        systemMoves.push(systemMove);
      }

      const envMove = extractEnvironmentMove(entry);
      if (envMove) {
        environmentMoves.push(envMove);
      }

      const realizabilityCheck = extractRealizabilityCheck(entry);
      if (realizabilityCheck) {
        realizabilityChecks.push(realizabilityCheck);
      }

      const loopDetection = extractLoopDetection(entry);
      if (loopDetection) {
        loopDetections.push(loopDetection);
      }

      const lookAhead = extractLookAhead(entry);
      if (lookAhead) {
        lookAheads.push(lookAhead);
      }
    } else {
      failedLines++;
    }
  }

  const statistics = extractStatistics(entries);

  const metadata: ParsingMetadata = {
    totalLines: lines.length,
    parsedLines,
    failedLines,
    filePath,
    parsedAt: new Date()
  };

  return {
    entries,
    states,
    transitions,
    systemMoves,
    environmentMoves,
    realizabilityChecks,
    loopDetections,
    lookAheads,
    statistics,
    metadata
  };
}

/**
 * Serialize ParsedLog to JSON-compatible format
 */
export function serializeParsedLog(log: ParsedLog): SerializedParsedLog {
  return {
    ...log,
    states: Array.from(log.states.values())
  };
}

/**
 * Deserialize JSON to ParsedLog
 */
export function deserializeParsedLog(serialized: SerializedParsedLog): ParsedLog {
  return {
    ...serialized,
    states: new Map(serialized.states.map(s => [s.id, s]))
  };
}

/**
 * Parse log from file (for use in browser with file upload)
 */
export async function parseLogFile(file: File): Promise<ParsedLog> {
  const content = await file.text();
  return parseLog(content, file.name);
}
