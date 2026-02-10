import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LogViewer } from '../index'
import type { ParsedLog, LogEntry } from '../../../parser/types'
import { LogLevel } from '../../../parser/types'

// Mock data
const createMockLogEntry = (
  lineNumber: number,
  level: LogLevel,
  message: string,
  module: string = 'main'
): LogEntry => ({
  timestamp: {
    year: 2026,
    month: 2,
    day: 10,
    hours: 9,
    minutes: 45,
    seconds: 7,
    milliseconds: 117,
    raw: '2026-02-10 09:45:07.117',
    iso: '2026-02-10T09:45:07.117Z',
  },
  level,
  module,
  message,
  rawLine: `[2026-02-10 09:45:07.117] [cynthia] [${level}] [${module}] ${message}`,
  lineNumber,
})

const createMockParsedLog = (): ParsedLog => ({
  entries: [
    createMockLogEntry(1, LogLevel.INFO, 'Starting synthesis', 'main'),
    createMockLogEntry(2, LogLevel.DEBUG, 'Parsing formula: p1 && p2', 'main'),
    createMockLogEntry(3, LogLevel.INFO, 'State 112', 'main'),
    createMockLogEntry(4, LogLevel.DEBUG, 'checking system move: p1', 'main'),
    createMockLogEntry(5, LogLevel.WARN, 'Loop detected for node 300', 'main'),
    createMockLogEntry(6, LogLevel.ERROR, 'State 300 is failure', 'main'),
    createMockLogEntry(7, LogLevel.TRACE, 'env look-ahead: one-step realizability check was successful', 'main'),
    createMockLogEntry(8, LogLevel.INFO, 'Adding transition (111 AND node, 7, 176 OR node)', 'main'),
    createMockLogEntry(9, LogLevel.INFO, 'Explored states: 112', 'main'),
    createMockLogEntry(10, LogLevel.INFO, 'realizable.', 'main'),
  ],
  states: new Map([
    [112, { id: 112, lineNumber: 3 }],
    [300, { id: 300, isFailure: true, isLoop: true, lineNumber: 6 }],
  ]),
  transitions: [
    {
      fromNode: '111 AND node',
      fromNodeId: 111,
      fromNodeType: 'AND',
      toNode: '176 OR node',
      toNodeId: 176,
      toNodeType: 'OR',
      lineNumber: 8,
    },
  ],
  systemMoves: [{ formula: 'p1', lineNumber: 4 }],
  environmentMoves: [],
  realizabilityChecks: [],
  loopDetections: [{ nodeId: 300, lineNumber: 5 }],
  lookAheads: [],
  statistics: {
    exploredStates: 112,
    result: 'realizable',
  },
  metadata: {
    totalLines: 10,
    parsedLines: 10,
    failedLines: 0,
    filePath: 'test.log',
    parsedAt: new Date('2026-02-10T09:45:07.117Z'),
  },
})

describe('LogViewer', () => {
  it('renders log viewer with all entries', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    expect(screen.getByText('Log Viewer')).toBeInTheDocument()
    expect(screen.getByText('10 entries')).toBeInTheDocument()
  })

  it('filters entries by search term', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'State' } })

    expect(screen.getByText(/2 of 10 entries/)).toBeInTheDocument()
  })

  it('filters entries by log level', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    // Expand filters
    const filtersButton = screen.getByLabelText('Toggle advanced filters')
    fireEvent.click(filtersButton)

    // Uncheck DEBUG level
    const debugButton = screen.getByRole('button', { name: 'DEBUG' })
    fireEvent.click(debugButton)

    // Should show fewer entries (we had 2 DEBUG entries)
    expect(screen.getByText(/8 of 10 entries/)).toBeInTheDocument()
  })

  it('calls onEntryClick when entry is clicked', () => {
    const mockLog = createMockParsedLog()
    const handleClick = vi.fn()

    render(<LogViewer parsedLog={mockLog} onEntryClick={handleClick} />)

    // Find a state entry and click it
    const stateEntries = screen.getAllByText(/State \d+/)
    fireEvent.click(stateEntries[0])

    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'State 112' }),
      expect.objectContaining({ id: 112 })
    )
  })

  it('shows entry count indicator when limited', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} maxEntries={5} />)

    expect(screen.getByText(/Showing 5 of 10 entries/)).toBeInTheDocument()
  })

  it('displays metadata in footer', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    expect(screen.getByText(/Parsed 10 of 10 lines/)).toBeInTheDocument()
    expect(screen.getByText(/2 states, 1 transitions/)).toBeInTheDocument()
    expect(screen.getByText('test.log')).toBeInTheDocument()
  })

  it('shows no results message when filter matches nothing', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No log entries match the current filter.')).toBeInTheDocument()
  })

  it('displays all log levels with correct colors', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    expect(screen.getByText('INFO')).toHaveClass('text-blue-700')
    expect(screen.getByText('DEBUG')).toHaveClass('text-gray-600')
    expect(screen.getByText('WARN')).toHaveClass('text-yellow-700')
    expect(screen.getByText('ERROR')).toHaveClass('text-red-700')
    expect(screen.getByText('TRACE')).toHaveClass('text-slate-500')
  })

  it('shows state indicator for entries with associated states', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    // State 112 should have a state indicator
    const stateIndicators = screen.getAllByText(/State \d+/, { selector: '.bg-primary\\/10' })
    expect(stateIndicators.length).toBeGreaterThan(0)
  })

  it('clears all filters when clear button is clicked', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    // Set a search term
    const searchInput = screen.getByPlaceholderText('Search logs...')
    fireEvent.change(searchInput, { target: { value: 'State' } })

    // Clear filters
    const clearButton = screen.getByRole('button', { name: 'Clear' })
    fireEvent.click(clearButton)

    // Search should be cleared
    expect(searchInput).toHaveValue('')
    expect(screen.getByText('10 entries')).toBeInTheDocument()
  })

  it('filters by module when modules are available', () => {
    const mockLog = createMockParsedLog()
    render(<LogViewer parsedLog={mockLog} />)

    // Expand filters
    const filtersButton = screen.getByLabelText('Toggle advanced filters')
    fireEvent.click(filtersButton)

    // All entries have 'main' module, so clicking it should show results
    const moduleButton = screen.getByRole('button', { name: 'main' })
    fireEvent.click(moduleButton)

    // Should filter to main module entries (all 10)
    expect(screen.getByText(/10 of 10 entries/)).toBeInTheDocument()
  })
})

describe('LogViewer utils', () => {
  it('extracts modules from entries', async () => {
    const { extractModules } = await import('../utils')
    const mockLog = createMockParsedLog()

    const modules = extractModules(mockLog.entries)

    expect(modules).toEqual(['main'])
  })

  it('gets entry state correctly', async () => {
    const { getEntryState } = await import('../utils')
    const mockLog = createMockParsedLog()

    const state = getEntryState(mockLog.entries[2], mockLog.states)

    expect(state).toEqual({ id: 112, lineNumber: 3 })
  })

  it('filters entries by multiple criteria', async () => {
    const { filterEntries } = await import('../utils')
    const mockLog = createMockParsedLog()

    const filtered = filterEntries(mockLog.entries, {
      searchTerm: '',
      levels: ['info', 'warn'],
      modules: [],
    })

    expect(filtered).toHaveLength(6) // 5 INFO + 1 WARN
  })
})
