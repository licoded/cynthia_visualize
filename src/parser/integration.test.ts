/**
 * Integration tests for Cynthia Log Parser with real log files
 */

import { describe, it, expect } from 'vitest';
import { parseLog, serializeParsedLog } from './parser';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Parser - Integration Tests with Real Log File', () => {
  it('should parse the bench1_f7.log example file', () => {
    // Read the example log file
    const logPath = join(__dirname, '../../examples/bench1_f7.log');
    const logContent = readFileSync(logPath, 'utf-8');

    const result = parseLog(logContent, 'bench1_f7.log');

    // Verify basic parsing
    expect(result.entries.length).toBeGreaterThan(0);
    expect(result.metadata.parsedLines).toBeGreaterThan(0);
    expect(result.metadata.filePath).toBe('bench1_f7.log');

    // Verify states were extracted
    expect(result.states.size).toBeGreaterThan(0);

    // Check specific states from the example log
    expect(result.states.has(112)).toBe(true);
    expect(result.states.has(300)).toBe(true);
    expect(result.states.has(359)).toBe(true);

    // Verify state 112 is marked as failure
    expect(result.states.get(112)?.isFailure).toBe(true);

    // Verify state 300 has loop detection
    expect(result.states.get(300)?.isLoop).toBe(true);

    // Verify state 359 has loop detection
    expect(result.states.get(359)?.isLoop).toBe(true);

    // Verify transitions were extracted
    expect(result.transitions.length).toBeGreaterThan(0);

    // Check for specific transitions from the example
    const transitionTo176 = result.transitions.find(t => t.toNodeId === 176);
    expect(transitionTo176).toBeDefined();
    expect(transitionTo176?.toNodeType).toBe('OR');

    const transitionTo300 = result.transitions.find(t => t.toNodeId === 300);
    expect(transitionTo300).toBeDefined();

    // Verify system moves were extracted
    expect(result.systemMoves.length).toBeGreaterThan(0);

    // Check for specific system moves from the example
    const p1Move = result.systemMoves.find(m => m.formula === 'p1');
    expect(p1Move).toBeDefined();

    const notP1Move = result.systemMoves.find(m => m.formula === '!p1');
    expect(notP1Move).toBeDefined();

    // Verify environment moves were extracted
    expect(result.environmentMoves.length).toBeGreaterThan(0);

    // Check for environment moves
    const notP0Move = result.environmentMoves.find(m => m.formula === '!p0');
    expect(notP0Move).toBeDefined();

    // Verify realizability checks were detected
    expect(result.realizabilityChecks.length).toBeGreaterThan(0);

    const zeroStepCheck = result.realizabilityChecks.find(c => c.type === 'zero-step');
    expect(zeroStepCheck).toBeDefined();

    const oneStepCheck = result.realizabilityChecks.find(c => c.type === 'one-step');
    expect(oneStepCheck).toBeDefined();

    // Verify loop detections
    expect(result.loopDetections.length).toBeGreaterThan(0);

    const loop300 = result.loopDetections.find(l => l.nodeId === 300);
    expect(loop300).toBeDefined();

    const loop359 = result.loopDetections.find(l => l.nodeId === 359);
    expect(loop359).toBeDefined();

    // Verify statistics
    expect(result.statistics.exploredStates).toBe(3);
    expect(result.statistics.result).toBe('unrealizable');
    expect(result.statistics.timeElapsed).toBeDefined();
    expect(result.statistics.timeElapsed).toBeGreaterThan(0);

    // Verify metadata
    expect(result.metadata.totalLines).toBe(92); // 91 log lines + 1 empty line at end
    expect(result.metadata.parsedLines).toBe(91); // All valid log entries
    // Note: Empty lines are skipped before being counted as failed, so failedLines is 0
  });

  it('should serialize and deserialize the full example log', () => {
    const logPath = join(__dirname, '../../examples/bench1_f7.log');
    const logContent = readFileSync(logPath, 'utf-8');

    const parsed = parseLog(logContent, 'bench1_f7.log');
    const serialized = serializeParsedLog(parsed);

    // Verify serialization produces valid JSON
    expect(() => JSON.stringify(serialized)).not.toThrow();
    const jsonString = JSON.stringify(serialized);

    // Verify the JSON string is not empty
    expect(jsonString.length).toBeGreaterThan(0);

    // Verify the JSON contains expected top-level properties
    const parsedJson = JSON.parse(jsonString);
    expect(parsedJson.entries).toBeDefined();
    expect(parsedJson.states).toBeDefined();
    expect(parsedJson.transitions).toBeDefined();
    expect(parsedJson.statistics).toBeDefined();
    expect(parsedJson.metadata).toBeDefined();

    // Verify we can deserialize and get the same data
    // (Note: Map becomes Array, so we compare the array length)
    expect(parsedJson.states.length).toBe(parsed.states.size);
    expect(parsedJson.entries.length).toBe(parsed.entries.length);
    expect(parsedJson.transitions.length).toBe(parsed.transitions.length);
  });

  it('should extract all unique states from the example log', () => {
    const logPath = join(__dirname, '../../examples/bench1_f7.log');
    const logContent = readFileSync(logPath, 'utf-8');

    const result = parseLog(logContent, 'bench1_f7.log');

    // Collect all unique state IDs mentioned in the log
    const allStateIds = new Set<number>();

    // From explicit state entries
    result.states.forEach((state) => {
      allStateIds.add(state.id);
    });

    // From transitions (source and target nodes)
    result.transitions.forEach((transition) => {
      allStateIds.add(transition.fromNodeId);
      allStateIds.add(transition.toNodeId);
    });

    // From look-aheads
    result.lookAheads.forEach((lookAhead) => {
      if (lookAhead.nodeId > 0) {
        allStateIds.add(lookAhead.nodeId);
      }
    });

    // Verify we have a reasonable number of unique states
    expect(allStateIds.size).toBeGreaterThan(10);

    // Verify specific states from the example are present
    expect(allStateIds.has(112)).toBe(true);
    expect(allStateIds.has(300)).toBe(true);
    expect(allStateIds.has(359)).toBe(true);
    expect(allStateIds.has(176)).toBe(true);
    expect(allStateIds.has(31)).toBe(true);
    expect(allStateIds.has(33)).toBe(true);
  });

  it('should correctly parse log levels from example log', () => {
    const logPath = join(__dirname, '../../examples/bench1_f7.log');
    const logContent = readFileSync(logPath, 'utf-8');

    const result = parseLog(logContent, 'bench1_f7.log');

    // Count entries by level
    const infoCount = result.entries.filter(e => e.level === 'info').length;
    const debugCount = result.entries.filter(e => e.level === 'debug').length;

    // The example log should have both info and debug entries
    expect(infoCount).toBeGreaterThan(0);
    expect(debugCount).toBeGreaterThan(0);
  });

  it('should correctly parse timestamps from example log', () => {
    const logPath = join(__dirname, '../../examples/bench1_f7.log');
    const logContent = readFileSync(logPath, 'utf-8');

    const result = parseLog(logContent, 'bench1_f7.log');

    // Check first entry has correct timestamp
    const firstEntry = result.entries[0];
    expect(firstEntry.timestamp.year).toBe(2026);
    expect(firstEntry.timestamp.month).toBe(2);
    expect(firstEntry.timestamp.day).toBe(10);
    expect(firstEntry.timestamp.hours).toBe(9);
    expect(firstEntry.timestamp.minutes).toBe(45);
    expect(firstEntry.timestamp.seconds).toBe(7);

    // Check all entries have valid timestamps
    result.entries.forEach(entry => {
      expect(entry.timestamp.year).toBeGreaterThanOrEqual(2020);
      expect(entry.timestamp.year).toBeLessThanOrEqual(2100);
      expect(entry.timestamp.iso).toBeDefined();
      expect(typeof entry.timestamp.iso).toBe('string');
    });
  });
});
