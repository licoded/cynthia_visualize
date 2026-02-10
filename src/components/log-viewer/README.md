# Log Viewer Component

Interactive log viewer for Cynthia execution logs with search, filter, and state graph linking capabilities.

## Features

- **Search & Filter**: Search by text, line number, or filter by log level and module
- **Log Level Highlighting**: Color-coded entries (INFO, DEBUG, WARN, ERROR, TRACE)
- **State Graph Linking**: Click entries to navigate to corresponding state graph nodes
- **Expandable Sections**: Group entries by time for better organization
- **Virtualization**: Efficient rendering of large log files (1000+ entries)
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Automatic dark mode detection

## Installation

The component is part of the `cynthia_visualize` project. Dependencies:

```bash
npm install clsx tailwind-merge
```

## Usage

```tsx
import { LogViewer } from './components/log-viewer'
import { parseLogFile } from './parser'

function App() {
  const [parsedLog, setParsedLog] = useState<ParsedLog | null>(null)

  const handleFileUpload = async (file: File) => {
    const result = await parseLogFile(file)
    setParsedLog(result)
  }

  const handleEntryClick = (entry: LogEntry, state?: State) => {
    console.log('Clicked entry:', entry)
    console.log('Associated state:', state)
    // Navigate to state in graph visualization
  }

  return (
    <LogViewer
      parsedLog={parsedLog}
      onEntryClick={handleEntryClick}
      maxEntries={1000}
    />
  )
}
```

## API

### LogViewer Props

| Prop | Type | Description |
|------|------|-------------|
| `parsedLog` | `ParsedLog` | Parsed log data from the parser |
| `onEntryClick` | `(entry, state?) => void` | Optional callback when entry is clicked |
| `initialFilter` | `Partial<LogFilter>` | Optional initial filter state |
| `maxEntries` | `number` | Max entries to display (default: 1000) |
| `className` | `string` | Additional CSS classes |

### LogFilter

```typescript
interface LogFilter {
  searchTerm: string
  levels: LogLevel[]
  modules: string[]
  startTime?: Date
  endTime?: Date
}
```

## Component Structure

```
LogViewer
├── LogFilterBar          # Search and filter controls
├── LogEntryList          # Virtualized entry list
│   └── LogEntryItem      # Individual log entry
└── Footer                # Metadata and stats
```

## Accessibility

- Keyboard navigation with Enter/Space keys
- ARIA labels and roles
- Focus management
- WCAG AA compliant color contrast

## Performance

- Virtualized rendering for large lists
- Memoized components to prevent re-renders
- Efficient filtering with useMemo
- Lazy state lookup on click

## Customization

### Colors

Edit `src/components/log-viewer/constants.ts` to customize log level colors:

```typescript
export const LOG_LEVEL_COLORS: Record<LogLevel, LogLevelColors> = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  // ...
}
```

### Styling

The component uses Tailwind CSS with CSS custom properties for theming. Override in your CSS:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

## Testing

```bash
npm run test -- LogViewer.test.tsx
```

## Examples

See `src/components/log-viewer/example.tsx` for a complete file upload example.
