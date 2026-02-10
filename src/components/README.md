# State Graph Visualization Components

React components for visualizing Cynthia synthesis state graphs using React Flow.

## Overview

This module provides interactive graph visualization for Cynthia synthesis output, showing:
- **States as nodes**: Color-coded by type (normal, failure, loop)
- **Transitions as edges**: AND/OR node connections with labels
- **Interactive features**: Zoom, pan, click to inspect
- **Auto-layouting**: Hierarchical layout for better readability

## Components

### StateGraph

Main component for rendering state graphs.

**Props:**
- `parsedLog: ParsedLog` - Parsed Cynthia log data from the parser module
- `onNodeClick?: (nodeId: number) => void` - Callback when a node is clicked
- `className?: string` - Additional CSS classes

**Example:**
```tsx
import { StateGraphWrapper } from './components';
import { parseLogFile } from './parser';

function App() {
  const [parsedLog, setParsedLog] = useState<ParsedLog | null>(null);

  const handleFileUpload = async (file: File) => {
    const result = await parseLogFile(file);
    setParsedLog(result);
  };

  const handleNodeClick = (nodeId: number) => {
    console.log('Clicked state:', nodeId);
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      {parsedLog && (
        <StateGraphWrapper parsedLog={parsedLog} onNodeClick={handleNodeClick} />
      )}
    </div>
  );
}
```

### StateGraphWrapper

Wrapper component that provides ReactFlow context to StateGraph.

**Props:** Same as StateGraph

## Color Coding

- **Blue (#3b82f6)**: Normal states
- **Red (#ef4444)**: Failure states
- **Green (#22c55e)**: Success states (non-failure, non-loop)
- **Amber (#fbbf24)**: Loop states

## Features

### Interactive Controls
- **Zoom/Pan**: Use mouse wheel to zoom, click and drag to pan
- **Minimap**: Small overview map in bottom-right corner
- **Controls**: Buttons for zoom in/out, fit view, and reset

### Node Information
- State ID displayed prominently
- Node type (AND/OR) shown below state ID
- Color coding based on state properties

### Edge Styling
- Blue edges for AND → OR transitions
- Purple edges for other transitions
- Animated edges for AND → OR transitions
- Arrow markers at end of edges

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Performance

The component efficiently handles:
- Up to 1000+ nodes and edges
- Auto-layouting with hierarchical positioning
- Smooth interactions even with large graphs

## Dependencies

- React 18+
- React Flow 11+
- TypeScript 5+

## Integration with Parser

The StateGraph component works seamlessly with the parser module:

```tsx
import { parseLog } from './parser';
import { StateGraphWrapper } from './components';

const logContent = `
[2026-02-10 09:45:07.117] [cynthia] [info] [main] Parsing file.ltlf
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 7, 176 OR node)
`;

const parsedLog = parseLog(logContent, 'example.log');
```

## Future Enhancements

- Custom node templates
- Export graph as image/SVG
- Filter by state type
- Search functionality
- State inspection panel
- Animation controls
