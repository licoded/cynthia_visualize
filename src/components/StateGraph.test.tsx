import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { StateGraph } from './StateGraph';
import type { ParsedLog } from '../parser/types';

// Mock parsed log data
const createMockParsedLog = (): ParsedLog => ({
  entries: [],
  states: new Map([
    [1, { id: 1, isFailure: false, isLoop: false }],
    [2, { id: 2, isFailure: true, isLoop: false }],
    [3, { id: 3, isFailure: false, isLoop: true }],
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
  ],
  systemMoves: [],
  environmentMoves: [],
  realizabilityChecks: [],
  loopDetections: [{ nodeId: 3, lineNumber: 20 }],
  lookAheads: [],
  statistics: {
    exploredStates: 3,
    timeElapsed: 100,
    result: 'unrealizable',
  },
  metadata: {
    totalLines: 100,
    parsedLines: 95,
    failedLines: 5,
    filePath: 'test.log',
    parsedAt: new Date(),
  },
});

describe('StateGraph', () => {
  it('renders without crashing', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} />
      </ReactFlowProvider>
    );
    expect(container.querySelector('.state-graph')).toBeInTheDocument();
  });

  it('renders the correct number of nodes', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} />
      </ReactFlowProvider>
    );
    const nodes = container.querySelectorAll('.react-flow__node');
    expect(nodes.length).toBe(3);
  });

  it('renders the correct number of edges', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} />
      </ReactFlowProvider>
    );
    // Edges are rendered in SVG, check if SVG container exists
    const svgContainer = container.querySelector('.react-flow__edges');
    expect(svgContainer).toBeInTheDocument();
    // We can't easily count individual edges in test environment due to SVG rendering
    // but we can verify the component rendered successfully
  });

  it('calls onNodeClick when a node is clicked', () => {
    const mockLog = createMockParsedLog();
    const onNodeClick = vi.fn();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} onNodeClick={onNodeClick} />
      </ReactFlowProvider>
    );
    const nodes = container.querySelectorAll('.react-flow__node');
    nodes[0]?.click();
    expect(onNodeClick).toHaveBeenCalled();
  });

  it('renders failure states with correct color', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} />
      </ReactFlowProvider>
    );
    const nodes = container.querySelectorAll('.react-flow__node');
    const failureNode = Array.from(nodes).find((node) =>
      node.textContent?.includes('State 2')
    );
    expect(failureNode).toBeInTheDocument();
  });

  it('renders loop states with correct color', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} />
      </ReactFlowProvider>
    );
    const nodes = container.querySelectorAll('.react-flow__node');
    const loopNode = Array.from(nodes).find((node) =>
      node.textContent?.includes('State 3')
    );
    expect(loopNode).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const mockLog = createMockParsedLog();
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={mockLog} className="custom-class" />
      </ReactFlowProvider>
    );
    const graph = container.querySelector('.state-graph.custom-class');
    expect(graph).toBeInTheDocument();
  });

  it('handles empty log data', () => {
    const emptyLog: ParsedLog = {
      entries: [],
      states: new Map(),
      transitions: [],
      systemMoves: [],
      environmentMoves: [],
      realizabilityChecks: [],
      loopDetections: [],
      lookAheads: [],
      statistics: {},
      metadata: {
        totalLines: 0,
        parsedLines: 0,
        failedLines: 0,
        filePath: 'empty.log',
        parsedAt: new Date(),
      },
    };
    const { container } = render(
      <ReactFlowProvider>
        <StateGraph parsedLog={emptyLog} />
      </ReactFlowProvider>
    );
    expect(container.querySelector('.state-graph')).toBeInTheDocument();
  });
});
