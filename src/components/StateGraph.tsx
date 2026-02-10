import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import type {
  Node,
  Edge,
  Connection,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ParsedLog } from '../parser/types';

// Custom node component for state visualization
const StateNode = ({ data }: { data: any }) => {
  const getNodeColor = () => {
    if (data.isLoop) return '#fbbf24'; // amber-400
    if (data.isFailure) return '#ef4444'; // red-500
    if (data.isSuccess) return '#22c55e'; // green-500
    return '#3b82f6'; // blue-500 (default)
  };

  const nodeStyle: React.CSSProperties = {
    padding: '10px 15px',
    borderRadius: '8px',
    width: '150px',
    background: getNodeColor(),
    color: 'white',
    border: '2px solid #1e293b',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  };

  return (
    <div style={nodeStyle}>
      <div>State {data.id}</div>
      {data.nodeType && (
        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
          {data.nodeType}
        </div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

export interface StateGraphProps {
  parsedLog: ParsedLog;
  onNodeClick?: (nodeId: number) => void;
  className?: string;
}

export const StateGraph: React.FC<StateGraphProps> = ({ parsedLog, onNodeClick, className = '' }) => {
  // Convert parsed log data to React Flow nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    const stateSet = new Set<number>();

    // Add nodes from transitions
    parsedLog.transitions.forEach((transition) => {
      if (!stateSet.has(transition.fromNodeId)) {
        stateSet.add(transition.fromNodeId);
        const state = parsedLog.states.get(transition.fromNodeId);
        nodes.push({
          id: transition.fromNodeId.toString(),
          type: 'stateNode',
          position: { x: 0, y: 0 }, // Will be auto-layouted
          data: {
            id: transition.fromNodeId,
            nodeType: transition.fromNodeType,
            isFailure: state?.isFailure,
            isLoop: state?.isLoop,
            isSuccess: !state?.isFailure && !state?.isLoop,
          },
        });
      }
      if (!stateSet.has(transition.toNodeId)) {
        stateSet.add(transition.toNodeId);
        const state = parsedLog.states.get(transition.toNodeId);
        nodes.push({
          id: transition.toNodeId.toString(),
          type: 'stateNode',
          position: { x: 0, y: 0 }, // Will be auto-layouted
          data: {
            id: transition.toNodeId,
            nodeType: transition.toNodeType,
            isFailure: state?.isFailure,
            isLoop: state?.isLoop,
            isSuccess: !state?.isFailure && !state?.isLoop,
          },
        });
      }
    });

    // Add any standalone states not in transitions
    parsedLog.states.forEach((state, id) => {
      if (!stateSet.has(id)) {
        nodes.push({
          id: id.toString(),
          type: 'stateNode',
          position: { x: 0, y: 0 },
          data: {
            id,
            nodeType: 'STATE',
            isFailure: state.isFailure,
            isLoop: state.isLoop,
            isSuccess: !state.isFailure && !state.isLoop,
          },
        });
      }
    });

    return nodes;
  }, [parsedLog]);

  const initialEdges: Edge[] = useMemo(() => {
    return parsedLog.transitions.map((transition, index) => ({
      id: `e${transition.fromNodeId}-${transition.toNodeId}-${index}`,
      source: transition.fromNodeId.toString(),
      target: transition.toNodeId.toString(),
      label: `${transition.fromNodeType} → ${transition.toNodeType}`,
      animated: transition.fromNodeType === 'AND' && transition.toNodeType === 'OR',
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: {
        stroke: transition.fromNodeType === 'AND' ? '#3b82f6' : '#8b5cf6',
        strokeWidth: 2,
      },
    }));
  }, [parsedLog]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(parseInt(node.id));
      }
    },
    [onNodeClick]
  );

  // Auto-layout nodes in a hierarchical layout
  const layoutedNodes = useMemo(() => {
    const nodeMap = new Map<string, Node>();
    initialNodes.forEach((node) => nodeMap.set(node.id, node));

    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevel = (nodeId: string, level: number): number => {
      if (visited.has(nodeId)) {
        return levels.get(nodeId) ?? 0;
      }
      visited.add(nodeId);

      const incomingEdges = initialEdges.filter((e) => e.target === nodeId);
      if (incomingEdges.length === 0) {
        levels.set(nodeId, 0);
        return 0;
      }

      let maxParentLevel = 0;
      incomingEdges.forEach((edge) => {
        const parentLevel = calculateLevel(edge.source, level + 1);
        maxParentLevel = Math.max(maxParentLevel, parentLevel);
      });

      const nodeLevel = maxParentLevel + 1;
      levels.set(nodeId, nodeLevel);
      return nodeLevel;
    };

    // Calculate levels for all nodes
    initialNodes.forEach((node) => calculateLevel(node.id, 0));

    // Group nodes by level
    const levelGroups = new Map<number, string[]>();
    levels.forEach((level, nodeId) => {
      if (!levelGroups.has(level)) {
        levelGroups.set(level, []);
      }
      levelGroups.get(level)?.push(nodeId);
    });

    // Position nodes
    const levelHeight = 150;
    const nodeWidth = 200;
    const horizontalGap = 50;

    const newNodes = initialNodes.map((node) => {
      const level = levels.get(node.id) ?? 0;
      const levelNodes = levelGroups.get(level) ?? [];
      const indexInLevel = levelNodes.indexOf(node.id);

      const x = indexInLevel * (nodeWidth + horizontalGap);
      const y = level * levelHeight;

      return {
        ...node,
        position: { x, y },
      };
    });

    return newNodes;
  }, [initialNodes, initialEdges]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      setNodes(layoutedNodes);
      hasInitialized.current = true;
    }
  }, [layoutedNodes, setNodes]);

  return (
    <div className={`state-graph ${className}`} style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.isLoop) return '#fbbf24';
            if (node.data.isFailure) return '#ef4444';
            if (node.data.isSuccess) return '#22c55e';
            return '#3b82f6';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

export default StateGraph;
