import type { LogEntry, State } from '../../parser/types'
import type { LogFilter } from './types'
import { AVAILABLE_LOG_LEVELS } from './constants'

/**
 * Default filter state
 */
export const DEFAULT_FILTER: LogFilter = {
  searchTerm: '',
  levels: AVAILABLE_LOG_LEVELS,
  modules: [],
}

/**
 * Check if a log entry matches the current filter criteria
 */
export function matchesFilter(entry: LogEntry, filter: LogFilter): boolean {
  // Check log level
  if (!filter.levels.includes(entry.level as any)) {
    return false
  }

  // Check module
  if (filter.modules.length > 0 && !filter.modules.includes(entry.module as string)) {
    return false
  }

  // Check search term (case-insensitive, searches message and raw line)
  if (filter.searchTerm) {
    const term = filter.searchTerm.toLowerCase()
    const messageMatch = entry.message.toLowerCase().includes(term)
    const rawMatch = entry.rawLine.toLowerCase().includes(term)
    const lineNumberMatch = entry.lineNumber.toString().includes(term)

    if (!messageMatch && !rawMatch && !lineNumberMatch) {
      return false
    }
  }

  // Check time range
  if (filter.startTime || filter.endTime) {
    const entryDate = new Date(entry.timestamp.iso)

    if (filter.startTime && entryDate < filter.startTime) {
      return false
    }

    if (filter.endTime && entryDate > filter.endTime) {
      return false
    }
  }

  return true
}

/**
 * Filter log entries based on filter criteria
 */
export function filterEntries(entries: LogEntry[], filter: LogFilter): LogEntry[] {
  return entries.filter(entry => matchesFilter(entry, filter))
}

/**
 * Extract unique modules from log entries
 */
export function extractModules(entries: LogEntry[]): string[] {
  const modules = new Set<string>()
  entries.forEach(entry => {
    modules.add(entry.module as string)
  })
  return Array.from(modules).sort()
}

/**
 * Check if a log entry has an associated state
 */
export function getEntryState(entry: LogEntry, states: Map<number, State>): State | undefined {
  // Try to extract state ID from message
  const stateMatch = entry.message.match(/^State (\d+)/)
  if (stateMatch) {
    const stateId = parseInt(stateMatch[1], 10)
    return states.get(stateId)
  }

  // Check for loop detection
  const loopMatch = entry.message.match(/Loop detected for node (\d+)/)
  if (loopMatch) {
    const stateId = parseInt(loopMatch[1], 10)
    return states.get(stateId)
  }

  return undefined
}

/**
 * Get unique modules with counts
 */
export function getModuleStats(entries: LogEntry[]): Map<string, number> {
  const stats = new Map<string, number>()

  entries.forEach(entry => {
    const module = entry.module as string
    stats.set(module, (stats.get(module) || 0) + 1)
  })

  return stats
}

/**
 * Get log level distribution
 */
export function getLevelDistribution(entries: LogEntry[]): Map<string, number> {
  const distribution = new Map<string, number>()

  entries.forEach(entry => {
    const level = entry.level
    distribution.set(level, (distribution.get(level) || 0) + 1)
  })

  return distribution
}
