import { memo, useState, useCallback, useRef, useEffect } from 'react'
import type { LogEntry } from '../../parser/types'
import type { LogEntryListProps } from './types'
import { LogEntryItem } from './LogEntryItem'
import { getEntryState } from './utils'

/**
 * Constants for virtualization
 */
const ITEM_HEIGHT = 80 // Approximate height of each log entry
const BUFFER_SIZE = 5 // Number of items to render above/below viewport

/**
 * Log entry list component with virtualization for performance
 */
export const LogEntryList = memo(function LogEntryList({
  entries,
  states,
  onEntryClick,
  maxEntries,
}: LogEntryListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)

  // Limit entries if maxEntries is specified
  const displayEntries = maxEntries ? entries.slice(0, maxEntries) : entries

  // Update container height on resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Handle scroll for virtualization
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Calculate visible range for virtualization
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
  const endIndex = Math.min(
    displayEntries.length,
    Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
  )

  const visibleEntries = displayEntries.slice(startIndex, endIndex)
  const totalHeight = displayEntries.length * ITEM_HEIGHT
  const offsetY = startIndex * ITEM_HEIGHT

  // Handle entry click with state lookup
  const handleEntryClick = useCallback((entry: LogEntry) => {
    const state = getEntryState(entry, states)
    onEntryClick?.(entry, state)
  }, [states, onEntryClick])

  if (displayEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No log entries match the current filter.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto"
      onScroll={handleScroll}
      role="list"
      aria-label="Log entries"
    >
      {/* Virtual spacer for items above viewport */}
      <div style={{ height: offsetY }} aria-hidden="true" />

      {/* Visible items */}
      <div style={{ height: totalHeight - offsetY }}>
        {visibleEntries.map((entry) => {
          const state = getEntryState(entry, states)
          const globalIndex = displayEntries.indexOf(entry)

          return (
            <LogEntryItem
              key={`${entry.lineNumber}-${globalIndex}`}
              entry={entry}
              state={state}
              onClick={() => handleEntryClick(entry)}
              isClickable={Boolean(onEntryClick)}
            />
          )
        })}
      </div>

      {/* Virtual spacer for items below viewport */}
      <div
        style={{ height: Math.max(0, totalHeight - endIndex * ITEM_HEIGHT) }}
        aria-hidden="true"
      />

      {/* Entry count indicator */}
      {maxEntries && displayEntries.length < entries.length && (
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur border-t border-border text-sm text-center text-muted-foreground">
          Showing {displayEntries.length} of {entries.length} entries
          {entries.length > maxEntries && (
            <span className="ml-2">
              (Limited for performance)
            </span>
          )}
        </div>
      )}
    </div>
  )
})
