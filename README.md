# Cynthia Visualize

Visualization tools for Cynthia, an SDD-based LTLf Synthesis system. This project provides visualization and analysis capabilities for synthesis output logs and state graphs.

## Features

- **Dashboard**: Comprehensive statistics and metrics visualization
- **Timeline**: Interactive execution timeline with filtering capabilities
- **State Graph**: Visual representation of state transitions using React Flow
- **Log Viewer**: Searchable and filterable log viewer with state graph linking

## Tech Stack

- **React 19.2+** - Latest React with concurrent features
- **TypeScript 5.9+** - Type-safe development
- **Vite 7.3+** - Fast build tool with HMR
- **Tailwind CSS 4.1+** - Utility-first CSS framework
- **React Flow 11.11+** - Interactive graph visualization
- **Vitest 4.0+** - Unit testing framework

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building

```bash
npm run build
```

The built files will be in the `dist` directory.

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Usage

1. **Upload a Log File**: Drag and drop a `.log` or `.txt` file, or click "Browse Files"
   - A sample log file is included in `examples/sample.txt`
2. **View Dashboard**: See summary statistics and visualizations
3. **Explore Timeline**: View execution events in chronological order
4. **Analyze State Graph**: Visualize state transitions and relationships
5. **Browse Logs**: Search and filter through raw log entries

## Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Statistics dashboard components
│   ├── log-viewer/     # Log viewer components
│   ├── Timeline.tsx    # Timeline component
│   ├── StateGraph.tsx  # State graph visualization
│   └── index.ts        # Component exports
├── parser/             # Log parsing utilities
│   ├── parser.ts       # Main parser implementation
│   └── types.ts        # Parser type definitions
├── types/              # Shared type definitions
├── utils/              # Utility functions
├── lib/                # Library utilities
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Component Integration

The main app integrates four major components:

1. **StatisticsDashboard** (from bd-cynthia_visualize-tey.6)
   - Displays summary metrics
   - Shows visual charts (line, donut, bar)
   - Provides parsing information

2. **Timeline** (from bd-cynthia_visualize-tey.4)
   - Shows execution events chronologically
   - Supports filtering by event type
   - Expandable/collapsible events

3. **StateGraph** (from bd-cynthia_visualize-tey.9)
   - Visualizes state transitions
   - Interactive node selection
   - Auto-layout with React Flow

4. **LogViewer** (from bd-cynthia_visualize-tey.8)
   - Displays raw log entries
   - Search and filter capabilities
   - Links to state graph nodes

## Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## Loading States

- Spinner animation during file parsing
- Disabled UI states during processing
- Error messages with detailed feedback

## Error Handling

- File type validation (.log files only)
- Parse error reporting with messages
- Graceful fallbacks for missing data

## License

This project is part of the Cynthia synthesis system.
