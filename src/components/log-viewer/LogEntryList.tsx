import { memo, useCallback, useRef, useMemo, useEffect, useState } from 'react'
import { VariableSizeList as List } from 'react-window'
import type { LogEntry, State } from '../../parser/types'
import type { LogEntryListProps } from './types'
import { LogEntryItem } from './LogEntryItem'
import { getEntryState } from './utils'

/**
 * Estimated base height for a log entry
 */
const ESTIMATED_ITEM_HEIGHT = 80

/**
 * Calculate height for a log entry based on its content
 */
function calculateItemHeight(entry: LogEntry): number {
  // Base height for padding and layout
  let height = 60 // min-height with padding

  // Add height for message content (approximate)
  const messageLines = Math.ceil(entry.message.length / 100) // rough estimate
  height += Math.min(messageLines * 20, 100) // cap at 100px for message

  // Extra height if state is present
  const stateInfo = entry.message.match(/State \d+/)
  if (stateInfo) {
    height += 24
  }

  return Math.max(height, ESTIMATED_ITEM_HEIGHT)
}

/**
 * Inner component for react-window to render items
 */
interface RowProps {
  index: number
  style: React.CSSProperties
  data: {
    entries: LogEntry[]
    states: Map<number, State>
    onEntryClick?: (entry: LogEntry, state?: State) => void
    itemSizeCache: Map<number, number>
    setItemSize: (index: number, size: number) => void
  }
}

const Row = memo(function Row({ index, style, data }: RowProps) {
  const { entries, states, onEntryClick, setItemSize } = data
  const entry = entries[index]
  const state = getEntryState(entry, states)
  const rowRef = useRef<HTMLDivElement>(null)

  // Measure actual height after render
  useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.offsetHeight
      setItemSize(index, height)
    }
  }, [index, setItemSize])

  const handleEntryClick = useCallback(() => {
    if (onEntryClick) {
      onEntryClick(entry, state)
    }
  }, [entry, state, onEntryClick])

  return (
    <div
      ref={rowRef}
      style={style}
      className="w-full"
    >
      <LogEntryItem
        key={`${entry.lineNumber}-${index}`}
        entry={entry}
        state={state}
        onClick={handleEntryClick}
        isClickable={Boolean(onEntryClick)}
      />
    </div>
  )
})

/**
 * Log entry list component with virtualization using react-window
 */
export const LogEntryList = memo(function LogEntryList({
  entries,
  states,
  onEntryClick,
  maxEntries,
}: LogEntryListProps) {
  const listRef = useRef<List>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemSizeCache = useRef<Map<number, number>>(new Map())
  const [containerHeight, setContainerHeight] = useState(600)

  // Limit entries if maxEntries is specified
  const displayEntries = useMemo(() => {
    return maxEntries ? entries.slice(0, maxEntries) : entries
  }, [entries, maxEntries])

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

  // Initialize size cache with estimates
  useMemo(() => {
    const newCache = new Map<number, number>()
    displayEntries.forEach((entry, index) => {
      newCache.set(index, calculateItemHeight(entry))
    })
    itemSizeCache.current = newCache
  }, [displayEntries])

  // Reset list when entries change
  useMemo(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0)
    }
  }, [displayEntries])

  // Get item size - use cached value
  const getItemSize = useCallback((index: number) => {
    return itemSizeCache.current.get(index) ?? ESTIMATED_ITEM_HEIGHT
  }, [])

  // Set the actual measured size
  const setItemSize = useCallback((index: number, size: number) => {
    if (itemSizeCache.current.get(index) !== size) {
      itemSizeCache.current.set(index, size)
      // Notify list that size changed
      if (listRef.current) {
        listRef.current.resetAfterIndex(index, false)
      }
    }
  }, [])

  // Prepare data for row renderer
  const rowData = useMemo(() => ({
    entries: displayEntries,
    states,
    onEntryClick,
    itemSizeCache: itemSizeCache.current,
    setItemSize,
  }), [displayEntries, states, onEntryClick, setItemSize])

  if (displayEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No log entries match the current filter.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      {/* Virtualized list */}
      <div role="list" aria-label="Log entries">
        <List
          ref={listRef}
          height={containerHeight}
          itemCount={displayEntries.length}
          itemSize={getItemSize}
          width="100%"
          itemData={rowData}
        >
          {Row}
        </List>
      </div>

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
