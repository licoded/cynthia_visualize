/**
 * Tests for Cynthia Log Parser
 */

import { describe, it, expect } from 'vitest';
import { parseLog, serializeParsedLog, deserializeParsedLog } from './parser';
import { LogLevel, State } from './types';

describe('Parser - Basic Log Entry Parsing', () => {
  it('should parse a basic info log entry', () => {
    const line = '[2026-02-10 09:45:07.117] [cynthia] [info] [main] Parsing /path/to/file.ltlf';
    const result = parseLog(line, 'test.log');

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].level).toBe(LogLevel.INFO);
    expect(result.entries[0].module).toBe('main');
    expect(result.entries[0].message).toBe('Parsing /path/to/file.ltlf');
    expect(result.entries[0].timestamp.year).toBe(2026);
    expect(result.entries[0].timestamp.month).toBe(2);
    expect(result.entries[0].timestamp.day).toBe(10);
  });

  it('should parse a debug log entry', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112';
    const result = parseLog(line, 'test.log');

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].level).toBe(LogLevel.DEBUG);
    expect(result.entries[0].module).toBe('cynthia');
    expect(result.entries[0].message).toBe('State 112');
  });

  it('should parse multiple log entries', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] First message
[2026-02-10 09:45:07.118] [cynthia] [debug] [cynthia] State 112
[2026-02-10 09:45:07.119] [cynthia] [info] [main] Second message`;

    const result = parseLog(content, 'test.log');

    expect(result.entries).toHaveLength(3);
    expect(result.metadata.parsedLines).toBe(3);
    expect(result.metadata.failedLines).toBe(0);
  });

  it('should handle empty lines gracefully', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] Message

[2026-02-10 09:45:07.118] [cynthia] [info] [main] Another message`;

    const result = parseLog(content, 'test.log');

    expect(result.entries).toHaveLength(2);
    expect(result.metadata.totalLines).toBe(3);
  });

  it('should handle malformed lines', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] Valid message
This is not a valid log line
[2026-02-10 09:45:07.118] [cynthia] [info] [main] Another valid message`;

    const result = parseLog(content, 'test.log');

    expect(result.entries).toHaveLength(2);
    expect(result.metadata.failedLines).toBe(1);
  });
});

describe('Parser - State Extraction', () => {
  it('should extract state from log entry', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112';
    const result = parseLog(line, 'test.log');

    expect(result.states.size).toBe(1);
    expect(result.states.get(112)).toBeDefined();
    expect(result.states.get(112)?.id).toBe(112);
  });

  it('should extract failure state', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [debug] [cynthia] State 112 is failure';
    const result = parseLog(line, 'test.log');

    expect(result.states.get(112)?.isFailure).toBe(true);
  });

  it('should extract loop detection and update state', () => {
    const content = `[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] State 300
[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] Loop detected for node 300, tagging the node`;
    const result = parseLog(content, 'test.log');

    expect(result.states.get(300)?.isLoop).toBe(true);
    expect(result.loopDetections).toHaveLength(1);
    expect(result.loopDetections[0].nodeId).toBe(300);
  });

  it('should merge state information from multiple entries', () => {
    const content = `[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] State 300
[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] Loop detected for node 300, tagging the node
[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] State 300 is failure`;

    const result = parseLog(content, 'test.log');

    const state = result.states.get(300);
    expect(state?.isLoop).toBe(true);
    expect(state?.isFailure).toBe(true);
  });
});

describe('Parser - Transition Extraction', () => {
  it('should extract AND to OR transition', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 7, 176 OR node)';
    const result = parseLog(line, 'test.log');

    expect(result.transitions).toHaveLength(1);
    expect(result.transitions[0].fromNodeId).toBe(111);
    expect(result.transitions[0].fromNodeType).toBe('AND');
    expect(result.transitions[0].toNodeId).toBe(176);
    expect(result.transitions[0].toNodeType).toBe('OR');
  });

  it('should extract OR to AND transition', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (299 OR node, 8, 300 AND node)';
    const result = parseLog(line, 'test.log');

    expect(result.transitions).toHaveLength(1);
    expect(result.transitions[0].fromNodeId).toBe(299);
    expect(result.transitions[0].fromNodeType).toBe('OR');
    expect(result.transitions[0].toNodeId).toBe(300);
    expect(result.transitions[0].toNodeType).toBe('AND');
  });

  it('should extract multiple transitions', () => {
    const content = `[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 7, 176 OR node)
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 8, 300 OR node)`;

    const result = parseLog(content, 'test.log');

    expect(result.transitions).toHaveLength(2);
  });
});

describe('Parser - System/Environment Moves', () => {
  it('should extract system move', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] checking system move: p1';
    const result = parseLog(line, 'test.log');

    expect(result.systemMoves).toHaveLength(1);
    expect(result.systemMoves[0].formula).toBe('p1');
  });

  it('should extract complex system move formula', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] checking system move: (p1) & (p2)';
    const result = parseLog(line, 'test.log');

    expect(result.systemMoves[0].formula).toBe('(p1) & (p2)');
  });

  it('should extract environment move', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env move: !p0';
    const result = parseLog(line, 'test.log');

    expect(result.environmentMoves).toHaveLength(1);
    expect(result.environmentMoves[0].formula).toBe('!p0');
  });

  it('should extract both system and environment moves from content', () => {
    const content = `[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] checking system move: p1
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env move: !p0
[2026-02-10 09:45:07.120] [cynthia] [debug] [cynthia] checking system move: !p1`;

    const result = parseLog(content, 'test.log');

    expect(result.systemMoves).toHaveLength(2);
    expect(result.environmentMoves).toHaveLength(1);
  });
});

describe('Parser - Realizability Checks', () => {
  it('should detect zero-step realizability check', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [info] [cynthia] Check zero-step realizability';
    const result = parseLog(line, 'test.log');

    expect(result.realizabilityChecks).toHaveLength(1);
    expect(result.realizabilityChecks[0].type).toBe('zero-step');
  });

  it('should detect one-step realizability check', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [info] [cynthia] Check one-step realizability';
    const result = parseLog(line, 'test.log');

    expect(result.realizabilityChecks).toHaveLength(1);
    expect(result.realizabilityChecks[0].type).toBe('one-step');
  });

  it('should detect one-step unrealizability check', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [info] [cynthia] Check one-step unrealizability';
    const result = parseLog(line, 'test.log');

    expect(result.realizabilityChecks).toHaveLength(1);
    expect(result.realizabilityChecks[0].type).toBe('one-step-unrealizability');
  });

  it('should detect successful realizability check in env look-ahead', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env look-ahead: one-step realizability check was successful';
    const result = parseLog(line, 'test.log');

    expect(result.realizabilityChecks).toHaveLength(1);
    expect(result.realizabilityChecks[0].type).toBe('one-step');
    expect(result.realizabilityChecks[0].status).toBe('success');
  });
});

describe('Parser - Statistics Extraction', () => {
  it('should extract explored states count', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [info] [cynthia] Explored states: 3';
    const result = parseLog(line, 'test.log');

    expect(result.statistics.exploredStates).toBe(3);
  });

  it('should extract time elapsed in milliseconds', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [info] [main] Overall time elapsed: 3.122875ms';
    const result = parseLog(line, 'test.log');

    expect(result.statistics.timeElapsed).toBe(3.122875);
  });

  it('should extract time elapsed in seconds and convert to ms', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [info] [main] Overall time elapsed: 1.5s';
    const result = parseLog(line, 'test.log');

    expect(result.statistics.timeElapsed).toBe(1500);
  });

  it('should extract unrealizable result', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [info] [main] unrealizable.';
    const result = parseLog(line, 'test.log');

    expect(result.statistics.result).toBe('unrealizable');
  });

  it('should extract realizable result', () => {
    const line = '[2026-02-10 09:45:07.121] [cynthia] [info] [main] realizable.';
    const result = parseLog(line, 'test.log');

    expect(result.statistics.result).toBe('realizable');
  });

  it('should extract all statistics from complete log', () => {
    const content = `[2026-02-10 09:45:07.121] [cynthia] [info] [cynthia] Explored states: 3
[2026-02-10 09:45:07.121] [cynthia] [info] [main] unrealizable.
[2026-02-10 09:45:07.121] [cynthia] [info] [main] Overall time elapsed: 3.122875ms`;

    const result = parseLog(content, 'test.log');

    expect(result.statistics.exploredStates).toBe(3);
    expect(result.statistics.result).toBe('unrealizable');
    expect(result.statistics.timeElapsed).toBe(3.122875);
  });
});

describe('Parser - Look-Ahead Extraction', () => {
  it('should extract system look-ahead for non-state node', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] system look-ahead: 111 is not a state node';
    const result = parseLog(line, 'test.log');

    expect(result.lookAheads).toHaveLength(1);
    expect(result.lookAheads[0].nodeId).toBe(111);
    expect(result.lookAheads[0].isStateNode).toBe(false);
    expect(result.lookAheads[0].type).toBe('system');
  });

  it('should extract system look-ahead for state node', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] system look-ahead: 111 is a state node';
    const result = parseLog(line, 'test.log');

    expect(result.lookAheads[0].isStateNode).toBe(true);
  });

  it('should extract env look-ahead for undiscovered state', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env look-ahead: next state 109 not discovered yet';
    const result = parseLog(line, 'test.log');

    expect(result.lookAheads).toHaveLength(1);
    expect(result.lookAheads[0].nodeId).toBe(109);
    expect(result.lookAheads[0].type).toBe('env');
    expect(result.lookAheads[0].result).toBe('not discovered yet');
  });

  it('should extract env look-ahead for already discovered state', () => {
    const line = '[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env look-ahead: next state 176 already discovered, success, ignoring';
    const result = parseLog(line, 'test.log');

    expect(result.lookAheads[0].nodeId).toBe(176);
    expect(result.lookAheads[0].result).toBe('already discovered, success, ignoring');
  });
});

describe('Parser - Serialization', () => {
  it('should serialize and deserialize parsed log', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] Parsing /path/to/file.ltlf
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 7, 176 OR node)`;

    const parsed = parseLog(content, 'test.log');
    const serialized = serializeParsedLog(parsed);
    const deserialized = deserializeParsedLog(serialized);

    expect(deserialized.entries).toEqual(parsed.entries);
    expect(deserialized.transitions).toEqual(parsed.transitions);

    // Check states Map is correctly restored
    expect(deserialized.states.get(112)).toEqual(parsed.states.get(112));
    expect(deserialized.states.size).toBe(parsed.states.size);
  });

  it('should produce JSON-serializable output', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] Test message
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112`;

    const parsed = parseLog(content, 'test.log');
    const serialized = serializeParsedLog(parsed);

    // Should be able to stringify to JSON without errors
    expect(() => JSON.stringify(serialized)).not.toThrow();
    const jsonString = JSON.stringify(serialized);

    // Should be able to parse back
    const parsedFromJson = JSON.parse(jsonString);
    expect(parsedFromJson.entries).toBeDefined();
    expect(parsedFromJson.states).toBeDefined();
  });
});

describe('Parser - Metadata', () => {
  it('should include parsing metadata', () => {
    const content = `[2026-02-10 09:45:07.117] [cynthia] [info] [main] Valid line
Invalid line without proper format
[2026-02-10 09:45:07.118] [cynthia] [info] [main] Another valid line`;

    const result = parseLog(content, 'test.log');

    expect(result.metadata.totalLines).toBe(3);
    expect(result.metadata.parsedLines).toBe(2);
    expect(result.metadata.failedLines).toBe(1);
    expect(result.metadata.filePath).toBe('test.log');
    expect(result.metadata.parsedAt).toBeInstanceOf(Date);
  });
});
