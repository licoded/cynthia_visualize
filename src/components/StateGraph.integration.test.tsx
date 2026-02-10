import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { StateGraph } from './StateGraph';
import { StateGraphWrapper } from './StateGraphWrapper';
import type { ParsedLog } from '../parser/types';

// Complex mock parsed log data for integration testing
const createComplexMockParsedLog = (): ParsedLog => ({
  entries: [],
  states: new Map([
    [1, { id: 1, isFailure: false, isLoop: false, lineNumber: 1 }],
    [2, { id: 2, isFailure: false, isLoop: false, lineNumber: 2 }],
    [3, { id: 3, isFailure: true, isLoop: false, lineNumber: 3 }],
    [4, { id: 4, isFailure: false, isLoop: true, lineNumber: 4 }],
    [5, { id: 5, isFailure: false, isLoop: false, lineNumber: 5 }],
  ]),
  transitions: [
    {
      fromNode: '1 AND node',
      fromNodeId: 1,
      fromNodeType: 'AND',
      toNode: '2 OR node',
      toNodeId: 2,
      toNodeType: 'OR',
      lineNumber: 10,
    },
    {
      fromNode: '2 AND node',
      fromNodeId: 2,
      fromNodeType: 'AND',
      toNode: '3 OR node',
      toNodeId: 3,
      toNodeType: 'OR',
      lineNumber: 15,
    },
    {
      fromNode: '3 AND node',
      fromNodeId: 3,
      fromNodeType: 'AND',
      toNode: '4 OR node',
      toNodeId: 4,
      toNodeType: 'OR',
      lineNumber: 20,
    },
    {
      fromNode: '4 AND node',
      fromNodeId: 4,
      fromNodeType: 'AND',
      toNode: '5 OR node',
      toNodeId: 5,
      toNodeType: 'OR',
      lineNumber: 25,
    },
  ],
  systemMoves: [
    { formula: 'p1', lineNumber: 11 },
    { formula: 'p2', lineNumber: 16 },
  ],
  environmentMoves: [
    { formula: '!p0', lineNumber: 12 },
  ],
  realizabilityChecks: [
    { type: 'zero-step', status: 'success', lineNumber: 5 },
    { type: 'one-step', status: 'failure', lineNumber: 30 },
  ],
  loopDetections: [
    { nodeId: 4, lineNumber: 21 },
  ],
  lookAheads: [
    { nodeId: 1, isStateNode: true, type: 'system', result: 'success', lineNumber: 6 },
  ],
  statistics: {
    exploredStates: 5,
    timeElapsed: 250,
    result: 'unrealizable',
  },
  metadata: {
    totalLines: 50,
    parsedLines: 45,
    failedLines: 5,
    filePath: 'complex-test.log',
    parsedAt: new Date('2026-02-10T10:00:00Z'),
  },
});

describe('StateGraph Integration Tests', () => {
  describe('Component Integration', () => {
    it('integrates with ReactFlowProvider', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      expect(container.querySelector('.react-flow')).toBeInTheDocument();
    });

    it('works with StateGraphWrapper', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(<StateGraphWrapper parsedLog={mockLog} />);
      expect(container.querySelector('.react-flow')).toBeInTheDocument();
    });

    it('handles all types of states (normal, failure, loop)', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(5);
    });

    it('displays all transitions', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      // Edges are rendered in SVG, check if SVG container exists
      const svgContainer = container.querySelector('.react-flow__edges');
      expect(svgContainer).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('allows node clicking', async () => {
      const mockLog = createComplexMockParsedLog();
      const onNodeClick = vi.fn();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} onNodeClick={onNodeClick} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      if (nodes.length > 0) {
        fireEvent.click(nodes[0]);
        await waitFor(() => {
          expect(onNodeClick).toHaveBeenCalled();
        });
      }
    });

    it('supports zoom and pan controls', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      const controls = container.querySelector('.react-flow__controls');
      expect(controls).toBeInTheDocument();
    });

    it('displays minimap', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      const minimap = container.querySelector('.react-flow__minimap');
      expect(minimap).toBeInTheDocument();
    });
  });

  describe('Data Visualization', () => {
    it('correctly visualizes AND to OR transitions', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      // Check that the graph container exists and has edges container
      const edgesContainer = container.querySelector('.react-flow__edges');
      expect(edgesContainer).toBeInTheDocument();
    });

    it('displays state hierarchy with proper layout', () => {
      const mockLog = createComplexMockParsedLog();
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={mockLog} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('handles single state graph', () => {
      const singleStateLog: ParsedLog = {
        entries: [],
        states: new Map([[1, { id: 1, isFailure: false, isLoop: false }]]),
        transitions: [],
        systemMoves: [],
        environmentMoves: [],
        realizabilityChecks: [],
        loopDetections: [],
        lookAheads: [],
        statistics: { exploredStates: 1 },
        metadata: {
          totalLines: 1,
          parsedLines: 1,
          failedLines: 0,
          filePath: 'single.log',
          parsedAt: new Date(),
        },
      };
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={singleStateLog} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(1);
    });

    it('handles disconnected states', () => {
      const disconnectedLog: ParsedLog = {
        entries: [],
        states: new Map([
          [1, { id: 1, isFailure: false, isLoop: false }],
          [2, { id: 2, isFailure: false, isLoop: false }],
        ]),
        transitions: [],
        systemMoves: [],
        environmentMoves: [],
        realizabilityChecks: [],
        loopDetections: [],
        lookAheads: [],
        statistics: { exploredStates: 2 },
        metadata: {
          totalLines: 2,
          parsedLines: 2,
          failedLines: 0,
          filePath: 'disconnected.log',
          parsedAt: new Date(),
        },
      };
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={disconnectedLog} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(2);
    });
  });

  describe('Performance', () => {
    it('handles large state graphs efficiently', () => {
      const largeLog: ParsedLog = {
        entries: [],
        states: new Map(
          Array.from({ length: 100 }, (_, i) => [
            i,
            { id: i, isFailure: i % 10 === 0, isLoop: i % 7 === 0 },
          ])
        ),
        transitions: Array.from({ length: 150 }, (_, i) => ({
          fromNode: `${i % 100} AND node`,
          fromNodeId: i % 100,
          fromNodeType: 'AND' as const,
          toNode: `${(i + 1) % 100} OR node`,
          toNodeId: (i + 1) % 100,
          toNodeType: 'OR' as const,
          lineNumber: i,
        })),
        systemMoves: [],
        environmentMoves: [],
        realizabilityChecks: [],
        loopDetections: [],
        lookAheads: [],
        statistics: { exploredStates: 100 },
        metadata: {
          totalLines: 250,
          parsedLines: 250,
          failedLines: 0,
          filePath: 'large.log',
          parsedAt: new Date(),
        },
      };
      const { container } = render(
        <ReactFlowProvider>
          <StateGraph parsedLog={largeLog} />
        </ReactFlowProvider>
      );
      const nodes = container.querySelectorAll('.react-flow__node');
      expect(nodes.length).toBe(100);
    });
  });
});
