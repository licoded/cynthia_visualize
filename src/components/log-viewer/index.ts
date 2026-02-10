/**
 * Log Viewer Module
 *
 * Provides interactive log viewing with search, filter, and state graph linking
 * for Cynthia execution logs.
 */

// Main component
export { LogViewer } from './LogViewer'

// Sub-components (exported for testing and custom compositions)
export { LogFilterBar } from './LogFilterBar'
export { LogEntryList } from './LogEntryList'
export { LogEntryItem } from './LogEntryItem'

// Types
export type {
  LogFilter,
  LogLevel,
  LogLevelColors,
  LogViewerProps,
  LogFilterBarProps,
  LogEntryItemProps,
  LogEntryListProps,
} from './types'

// Utilities
export {
  matchesFilter,
  filterEntries,
  extractModules,
  getEntryState,
  getModuleStats,
  getLevelDistribution,
} from './utils'

// Constants
export {
  LOG_LEVEL_COLORS,
  LOG_LEVEL_LABELS,
  DEFAULT_FILTER,
  AVAILABLE_LOG_LEVELS,
} from './constants'
