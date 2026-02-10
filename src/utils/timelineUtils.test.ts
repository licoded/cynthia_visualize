/**
 * Timeline utility functions tests
 */

import { describe, it, expect } from 'vitest';
import { ParsedLog } from '../parser/types';
import {
  createTimelineEvents,
  calculateTimelineStatistics,
  filterTimelineEvents,
  formatTimestamp,
  getEventTypeName,
  getEventTypeColor,
  EventType
} from './timelineUtils';

describe('timelineUtils', () => {
  describe('createTimelineEvents', () => {
    it('should convert parsed log to timeline events', () => {
      const mockParsedLog: ParsedLog = {
        entries: [
          {
            timestamp: {
              year: 2026,
              month: 2,
              day: 10,
              hours: 9,
              minutes: 45,
              seconds: 7,
              milliseconds: 117,
              raw: '[2026-02-10 09:45:07.117]',
              iso: '2026-02-10T09:45:07.117Z'
            },
            level: 'info' as const,
            module: 'cynthia',
            message: 'checking system move: p1',
            rawLine: '[2026-02-10 09:45:07.117] [cynthia] [info] [main] checking system move: p1',
            lineNumber: 1
          }
        ],
        states: new Map([
          [
            1,
            { id: 1, isFailure: false, lineNumber: 1 }
          ]
        ]),
        transitions: [],
        systemMoves: [
          { formula: 'p1', lineNumber: 1 }
        ],
        environmentMoves: [],
        realizabilityChecks: [],
        loopDetections: [],
        lookAheads: [],
        statistics: {},
        metadata: {
          totalLines: 1,
          parsedLines: 1,
          failedLines: 0,
          filePath: 'test.log',
          parsedAt: new Date()
        }
      };

      const events = createTimelineEvents(mockParsedLog);

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('system_move');
      expect(events[0].lineNumber).toBe(1);
    });

    it('should sort events by timestamp', () => {
      const mockParsedLog: ParsedLog = {
        entries: [
          {
            timestamp: {
              year: 2026,
              month: 2,
              day: 10,
              hours: 9,
              minutes: 45,
              seconds: 7,
              milliseconds: 117,
              raw: '[2026-02-10 09:45:07.117]',
              iso: '2026-02-10T09:45:07.117Z'
            },
            level: 'info' as const,
            module: 'cynthia',
            message: 'checking system move: p1',
            rawLine: '[2026-02-10 09:45:07.117] [cynthia] [info] [main] checking system move: p1',
            lineNumber: 1
          },
          {
            timestamp: {
              year: 2026,
              month: 2,
              day: 10,
              hours: 9,
              minutes: 45,
              seconds: 8,
              milliseconds: 118,
              raw: '[2026-02-10 09:45:08.118]',
              iso: '2026-02-10T09:45:08.118Z'
            },
            level: 'info' as const,
            module: 'cynthia',
            message: 'env move: !p0',
            rawLine: '[2026-02-10 09:45:08.118] [cynthia] [info] [main] env move: !p0',
            lineNumber: 2
          }
        ],
        states: new Map(),
        transitions: [],
        systemMoves: [{ formula: 'p1', lineNumber: 1 }],
        environmentMoves: [{ formula: '!p0', lineNumber: 2 }],
        realizabilityChecks: [],
        loopDetections: [],
        lookAheads: [],
        statistics: {},
        metadata: {
          totalLines: 2,
          parsedLines: 2,
          failedLines: 0,
          filePath: 'test.log',
          parsedAt: new Date()
        }
      };

      const events = createTimelineEvents(mockParsedLog);

      expect(events.length).toBe(2);
      expect(events[0].lineNumber).toBeLessThan(events[1].lineNumber);
    });
  });

  describe('calculateTimelineStatistics', () => {
    it('should calculate statistics for events', () => {
      const mockEvents = [
        {
          id: 'system_move-1-0',
          timestamp: {
            year: 2026,
            month: 2,
            day: 10,
            hours: 9,
            minutes: 45,
            seconds: 7,
            milliseconds: 117,
            raw: '[2026-02-10 09:45:07.117]',
            iso: '2026-02-10T09:45:07.117Z'
          },
          lineNumber: 1,
          type: 'system_move' as EventType,
          data: { formula: 'p1', lineNumber: 1 },
          expanded: false
        },
        {
          id: 'environment_move-2-0',
          timestamp: {
            year: 2026,
            month: 2,
            day: 10,
            hours: 9,
            minutes: 45,
            seconds: 8,
            milliseconds: 118,
            raw: '[2026-02-10 09:45:08.118]',
            iso: '2026-02-10T09:45:08.118Z'
          },
          lineNumber: 2,
          type: 'environment_move' as EventType,
          data: { formula: '!p0', lineNumber: 2 },
          expanded: false
        }
      ];

      const stats = calculateTimelineStatistics(mockEvents);

      expect(stats.totalEvents).toBe(2);
      expect(stats.eventsByType['system_move']).toBe(1);
      expect(stats.eventsByType['environment_move']).toBe(1);
      expect(stats.timeRange).not.toBeNull();
    });

    it('should return null time range for empty events', () => {
      const stats = calculateTimelineStatistics([]);

      expect(stats.totalEvents).toBe(0);
      expect(stats.timeRange).toBeNull();
    });
  });

  describe('filterTimelineEvents', () => {
    const mockEvents = [
      {
        id: 'system_move-1-0',
        timestamp: {
          year: 2026,
          month: 2,
          day: 10,
          hours: 9,
          minutes: 45,
          seconds: 7,
          milliseconds: 117,
          raw: '[2026-02-10 09:45:07.117]',
          iso: '2026-02-10T09:45:07.117Z'
        },
        lineNumber: 1,
        type: 'system_move' as EventType,
        data: { formula: 'p1', lineNumber: 1 },
        expanded: false
      },
      {
        id: 'environment_move-2-0',
        timestamp: {
          year: 2026,
          month: 2,
          day: 10,
          hours: 9,
          minutes: 45,
          seconds: 8,
          milliseconds: 118,
          raw: '[2026-02-10 09:45:08.118]',
          iso: '2026-02-10T09:45:08.118Z'
        },
        lineNumber: 2,
        type: 'environment_move' as EventType,
        data: { formula: '!p0', lineNumber: 2 },
        expanded: false
      }
    ];

    it('should filter by event type', () => {
      const filtered = filterTimelineEvents(mockEvents, {
        eventTypes: ['system_move']
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe('system_move');
    });

    it('should filter by line range', () => {
      const filtered = filterTimelineEvents(mockEvents, {
        lineRange: { start: 1, end: 1 }
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].lineNumber).toBe(1);
    });

    it('should filter by search query', () => {
      const filtered = filterTimelineEvents(mockEvents, {
        searchQuery: 'p1'
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].data).toEqual({ formula: 'p1', lineNumber: 1 });
    });

    it('should return all events when no filters applied', () => {
      const filtered = filterTimelineEvents(mockEvents, {});

      expect(filtered.length).toBe(2);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = {
        hours: 9,
        minutes: 45,
        seconds: 7,
        milliseconds: 117
      };

      const formatted = formatTimestamp(timestamp);

      expect(formatted).toBe('09:45:07.117');
    });
  });

  describe('getEventTypeName', () => {
    it('should return correct name for each event type', () => {
      expect(getEventTypeName('system_move')).toBe('System Move');
      expect(getEventTypeName('environment_move')).toBe('Environment Move');
      expect(getEventTypeName('realizability_check')).toBe('Realizability Check');
      expect(getEventTypeName('loop_detection')).toBe('Loop Detection');
      expect(getEventTypeName('transition')).toBe('State Transition');
      expect(getEventTypeName('look_ahead')).toBe('Look-Ahead');
      expect(getEventTypeName('state_discovery')).toBe('State Discovery');
    });
  });

  describe('getEventTypeColor', () => {
    it('should return correct color for each event type', () => {
      expect(getEventTypeColor('system_move')).toBe('bg-blue-500');
      expect(getEventTypeColor('environment_move')).toBe('bg-green-500');
      expect(getEventTypeColor('realizability_check')).toBe('bg-purple-500');
      expect(getEventTypeColor('loop_detection')).toBe('bg-red-500');
      expect(getEventTypeColor('transition')).toBe('bg-gray-500');
      expect(getEventTypeColor('look_ahead')).toBe('bg-yellow-500');
      expect(getEventTypeColor('state_discovery')).toBe('bg-indigo-500');
    });
  });
});
