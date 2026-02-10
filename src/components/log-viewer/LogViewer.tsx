import { useState, useMemo, useCallback } from 'react'
import type { LogEntry, State } from '../../parser/types'
import type { LogViewerProps, LogFilter } from './types'
import { LogFilterBar } from './LogFilterBar'
import { LogEntryList } from './LogEntryList'
import { DEFAULT_FILTER, extractModules, filterEntries } from './utils'
import { cn } from '../../lib/utils'

/**
 * Main log viewer component with search, filter, and state graph linking
 *
 * Features:
 * - Search by text, line number
 * - Filter by log level (info, debug, warn, error, trace)
 * - Filter by module
 * - Color-coded log levels
 * - Click-to-link to state graph nodes
 * - Expandable/collapsible sections
 * - Virtualized list for performance with large logs
 */
export function LogViewer({
  parsedLog,
  onEntryClick,
  initialFilter,
  maxEntries = 1000,
  className,
}: LogViewerProps) {
  // Initialize filter state
  const [filter, setFilter] = useState<LogFilter>(() => ({
    ...DEFAULT_FILTER,
    ...initialFilter,
  }))

  // Extract available modules
  const availableModules = useMemo(() => {
    return extractModules(parsedLog.entries)
  }, [parsedLog.entries])

  // Filter entries
  const filteredEntries = useMemo(() => {
    return filterEntries(parsedLog.entries, filter)
  }, [parsedLog.entries, filter])

  // Handle entry click with state lookup
  const handleEntryClick = useCallback((entry: LogEntry, state?: State) => {
    onEntryClick?.(entry, state)
  }, [onEntryClick])

  return (
    <div
      className={cn(
        'flex flex-col h-dvh bg-background border border-border rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-lg font-semibold text-foreground text-balance">
          Log Viewer
        </h2>
        <div className="text-sm text-muted-foreground">
          {parsedLog.metadata.filePath}
        </div>
      </div>

      {/* Filter bar */}
      <LogFilterBar
        filter={filter}
        onFilterChange={setFilter}
        totalEntries={parsedLog.entries.length}
        filteredEntries={filteredEntries.length}
        availableModules={availableModules}
      />

      {/* Log entries list */}
      <div className="flex-1 min-h-0">
        <LogEntryList
          entries={filteredEntries}
          states={parsedLog.states}
          onEntryClick={handleEntryClick}
          maxEntries={maxEntries}
        />
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
        <div>
          Parsed {parsedLog.metadata.parsedLines} of {parsedLog.metadata.totalLines} lines
          {parsedLog.metadata.failedLines > 0 && (
            <span className="ml-2 text-yellow-600 dark:text-yellow-400">
              ({parsedLog.metadata.failedLines} failed)
            </span>
          )}
        </div>
        <div>
          {parsedLog.states.size} states, {parsedLog.transitions.length} transitions
        </div>
      </div>
    </div>
  )
}
