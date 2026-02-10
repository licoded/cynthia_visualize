# Cynthia Log Parser

A TypeScript parser for converting Cynthia log files into structured JSON data.

## Overview

This parser extracts structured information from Cynthia synthesis logs, including:

- **Log Entries**: Timestamps, log levels, modules, and messages
- **States**: State IDs, failure states, and loop detections
- **Transitions**: State transitions with node types (AND/OR)
- **System/Environment Moves**: Player actions and opponent responses
- **Realizability Checks**: Zero-step and one-step realizability/unrealizability checks
- **Statistics**: Explored states, time elapsed, and synthesis results

## Usage

### Basic Parsing

```typescript
import { parseLog } from './parser';

const logContent = `
[2026-02-10 09:45:07.117] [cynthia] [info] [main] Parsing file.ltlf
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112
`;

const result = parseLog(logContent, 'example.log');

console.log(result.statistics);
// { exploredStates: ..., result: 'unrealizable', timeElapsed: ... }

console.log(result.states.get(112));
// { id: 112, isFailure: false, isLoop: false, lineNumber: 2 }
```

### File Parsing (Browser)

```typescript
import { parseLogFile } from './parser';

// In a file input handler
const file = event.target.files[0];
const result = await parseLogFile(file);
```

### Serialization

```typescript
import { serializeParsedLog, deserializeParsedLog } from './parser';

// Convert to JSON for storage/transmission
const serialized = serializeParsedLog(result);
const jsonString = JSON.stringify(serialized);

// Restore from JSON
const restored = deserializeParsedLog(JSON.parse(jsonString));
```

## Data Types

### ParsedLog

The main result type containing all parsed data:

```typescript
interface ParsedLog {
  entries: LogEntry[];              // All parsed log lines
  states: Map<number, State>;       // State ID -> State info
  transitions: Transition[];        // State transitions
  systemMoves: SystemMove[];        // System player actions
  environmentMoves: EnvironmentMove[]; // Environment player actions
  realizabilityChecks: RealizabilityCheck[]; // Realizability checks
  loopDetections: LoopDetection[];  // Loop detection events
  lookAheads: LookAhead[];          // Look-ahead information
  statistics: Statistics;           // Summary statistics
  metadata: ParsingMetadata;        // Parsing metadata
}
```

### State

```typescript
interface State {
  id: number;           // State ID
  isFailure?: boolean;  // Whether state is a failure state
  isLoop?: boolean;     // Whether state has a loop
  lineNumber?: number;  // Line number where state was found
}
```

### Transition

```typescript
interface Transition {
  fromNode: string;     // e.g., "111 AND node"
  fromNodeId: number;   // Source node ID
  fromNodeType: 'AND' | 'OR';
  toNode: string;       // e.g., "176 OR node"
  toNodeId: number;     // Target node ID
  toNodeType: 'AND' | 'OR';
  lineNumber: number;
}
```

## Log Format

The parser expects logs in the following format:

```
[YYYY-MM-DD HH:MM:SS.mmm] [cynthia] [LEVEL] [MODULE] MESSAGE
```

Example:

```
[2026-02-10 09:45:07.117] [cynthia] [info] [main] Parsing file.ltlf
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] State 112
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] Adding transition (111 AND node, 7, 176 OR node)
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] checking system move: p1
[2026-02-10 09:45:07.119] [cynthia] [debug] [cynthia] env move: !p0
[2026-02-10 09:45:07.121] [cynthia] [info] [cynthia] Explored states: 3
[2026-02-10 09:45:07.121] [cynthia] [info] [main] unrealizable.
[2026-02-10 09:45:07.121] [cynthia] [info] [main] Overall time elapsed: 3.122875ms
```

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with UI:

```bash
npm run test:ui
```

## Examples

See `examples/bench1_f7.log` for a complete example log file.

## API Reference

### Functions

- `parseLog(content: string, filePath?: string): ParsedLog` - Parse log content
- `parseLogFile(file: File): Promise<ParsedLog>` - Parse log file (browser)
- `serializeParsedLog(log: ParsedLog): SerializedParsedLog` - Convert to JSON-serializable format
- `deserializeParsedLog(serialized: SerializedParsedLog): ParsedLog` - Restore from JSON

### Types

See `types.ts` for complete type definitions.
