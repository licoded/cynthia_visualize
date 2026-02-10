import type { LogEntry, ParsedLog, State } from '../../parser/types'

/**
 * Filter options for log viewer
 */
export interface LogFilter {
  searchTerm: string
  levels: LogLevel[]
  modules: string[]
  startTime?: Date
  endTime?: Date
}

/**
 * Log level enum for UI
 */
export type LogLevel = 'info' | 'debug' | 'warn' | 'error' | 'trace'

/**
 * Color configuration for log levels
 */
export interface LogLevelColors {
  bg: string
  text: string
  border: string
}

/**
 * Props for LogViewer component
 */
export interface LogViewerProps {
  /** Parsed log data to display */
  parsedLog: ParsedLog
  /** Optional callback when a log entry is clicked */
  onEntryClick?: (entry: LogEntry, state?: State) => void
  /** Optional initial filter state */
  initialFilter?: Partial<LogFilter>
  /** Optional maximum number of entries to display (for performance) */
  maxEntries?: number
  /** Optional custom class names */
  className?: string
}

/**
 * Props for LogFilterBar component
 */
export interface LogFilterBarProps {
  filter: LogFilter
  onFilterChange: (filter: LogFilter) => void
  totalEntries: number
  filteredEntries: number
  availableModules: string[]
}

/**
 * Props for LogEntryItem component
 */
export interface LogEntryItemProps {
  entry: LogEntry
  state?: State
  onClick?: () => void
  isClickable: boolean
}

/**
 * Props for LogEntryList component
 */
export interface LogEntryListProps {
  entries: LogEntry[]
  states: Map<number, State>
  onEntryClick?: (entry: LogEntry, state?: State) => void
  maxEntries?: number
}
