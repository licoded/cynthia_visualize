import { useState, useCallback, useMemo } from 'react'
import type { LogFilterBarProps, LogLevel } from './types'
import { AVAILABLE_LOG_LEVELS, LOG_LEVEL_COLORS, LOG_LEVEL_LABELS } from './constants'
import { cn } from '../../lib/utils'

/**
 * Filter bar component with search, level filters, and module filters
 */
export function LogFilterBar({
  filter,
  onFilterChange,
  totalEntries,
  filteredEntries,
  availableModules,
}: LogFilterBarProps) {
  const [expanded, setExpanded] = useState(false)

  // Handle search term change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, searchTerm: e.target.value })
  }, [filter, onFilterChange])

  // Toggle log level filter
  const toggleLevel = useCallback((level: LogLevel) => {
    const newLevels = filter.levels.includes(level)
      ? filter.levels.filter(l => l !== level)
      : [...filter.levels, level]

    // Ensure at least one level is selected
    if (newLevels.length > 0) {
      onFilterChange({ ...filter, levels: newLevels })
    }
  }, [filter, onFilterChange])

  // Toggle module filter
  const toggleModule = useCallback((module: string) => {
    const newModules = filter.modules.includes(module)
      ? filter.modules.filter(m => m !== module)
      : [...filter.modules, module]

    onFilterChange({ ...filter, modules: newModules })
  }, [filter, onFilterChange])

  // Clear all filters
  const clearFilters = useCallback(() => {
    onFilterChange({
      searchTerm: '',
      levels: AVAILABLE_LOG_LEVELS,
      modules: [],
    })
  }, [onFilterChange])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filter.searchTerm) count++
    if (filter.levels.length < AVAILABLE_LOG_LEVELS.length) count++
    if (filter.modules.length > 0) count++
    return count
  }, [filter])

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="border-b border-border bg-muted/30">
      {/* Main filter bar */}
      <div className="flex items-center gap-3 p-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={filter.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search logs... (message, line number)"
            className={cn(
              'w-full px-3 py-2 pl-9 text-sm rounded-md border border-input',
              'bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
              'placeholder:text-muted-foreground'
            )}
            aria-label="Search log entries"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Expand/collapse button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'px-3 py-2 text-sm rounded-md border border-input bg-background',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring',
            'flex items-center gap-2 transition-colors'
          )}
          aria-expanded={expanded}
          aria-label="Toggle advanced filters"
        >
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <svg
            className={cn('w-4 h-4 transition-transform', expanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm rounded-md border border-input bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        )}

        {/* Entry count */}
        <div className="text-sm text-muted-foreground tabular-nums">
          {filteredEntries === totalEntries ? (
            <span>{totalEntries.toLocaleString()} entries</span>
          ) : (
            <span>
              {filteredEntries.toLocaleString()} of {totalEntries.toLocaleString()} entries
            </span>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="border-t border-border p-3 space-y-4">
          {/* Log level filters */}
          <div>
            <label className="text-sm font-medium mb-2 block">Log Levels</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LOG_LEVELS.map((level) => {
                const isSelected = filter.levels.includes(level)
                const colors = LOG_LEVEL_COLORS[level]

                return (
                  <button
                    key={level}
                    onClick={() => toggleLevel(level)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-md border transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      isSelected
                        ? cn(colors.bg, colors.text, colors.border, 'border-opacity-100')
                        : 'bg-background text-muted-foreground border-border opacity-60 hover:opacity-100'
                    )}
                    aria-pressed={isSelected}
                  >
                    {LOG_LEVEL_LABELS[level]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Module filters */}
          {availableModules.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Modules</label>
              <div className="flex flex-wrap gap-2">
                {availableModules.map((module) => {
                  const isSelected = filter.modules.includes(module)

                  return (
                    <button
                      key={module}
                      onClick={() => toggleModule(module)}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-md border transition-all',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-muted-foreground border-border opacity-60 hover:opacity-100'
                      )}
                      aria-pressed={isSelected}
                    >
                      {module}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
