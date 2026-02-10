import { useState, useCallback, useMemo } from 'react'
import {
  StateGraph,
  Timeline,
  LogViewer,
  StatisticsDashboard,
} from './components'
import { parseLogFile } from './parser'
import type { ParsedLog } from './parser/types'
import type { AnyTimelineEvent } from './types/timeline'
import { createTimelineEvents } from './utils/timelineUtils'
import { cn } from './lib/utils'

type ViewTab = 'dashboard' | 'timeline' | 'graph' | 'logs'

function App() {
  const [parsedLog, setParsedLog] = useState<ParsedLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard')
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>()

  // Generate timeline events from parsed log
  const timelineEvents = useMemo(() => {
    if (!parsedLog) return []
    return createTimelineEvents(parsedLog)
  }, [parsedLog])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setParsedLog(null)

    try {
      const log = await parseLogFile(file)
      setParsedLog(log)
      setActiveTab('dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse log file'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.log')) {
      handleFileUpload(file)
    } else {
      setError('Please upload a .log file')
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  // Handle event selection from timeline
  const handleEventSelect = useCallback((event: AnyTimelineEvent) => {
    setSelectedEventId(event.id)
  }, [])

  // Handle log entry click
  const handleLogEntryClick = useCallback((_entry: any, state?: any) => {
    if (state) {
      // Could scroll to state in graph or highlight it
      console.log('State clicked:', state)
    }
  }, [])

  // Handle state node click
  const handleStateNodeClick = useCallback((nodeId: number) => {
    console.log('State node clicked:', nodeId)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Cynthia Visualize
              </h1>
              <p className="text-sm text-muted-foreground">
                Visualization tools for Cynthia synthesis logs
              </p>
            </div>
            {parsedLog && (
              <button
                onClick={() => {
                  setParsedLog(null)
                  setError(null)
                  setActiveTab('dashboard')
                }}
                className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                Clear Log
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!parsedLog ? (
          /* Upload Screen */
          <div className="max-w-2xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                "border-border hover:border-primary/50 bg-card"
              )}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Upload Log File
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop a .log file here, or click to browse
                  </p>
                </div>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".log"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <span className="px-6 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors inline-block">
                    Browse Files
                  </span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Supports Cynthia log files with .log extension
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Parsing log file...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-destructive mt-0.5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-destructive">Error</h3>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Content with Tabs */
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-border">
              <nav className="flex gap-4 -mb-px">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === 'dashboard'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === 'timeline'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('graph')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === 'graph'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  State Graph
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === 'logs'
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  Log Viewer
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <StatisticsDashboard data={parsedLog} />
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="border border-border rounded-lg overflow-hidden bg-card">
                  <Timeline
                    events={timelineEvents}
                    onEventSelect={handleEventSelect}
                    selectedEventId={selectedEventId}
                    className="h-[600px]"
                  />
                </div>
              )}

              {activeTab === 'graph' && (
                <div className="border border-border rounded-lg overflow-hidden bg-card p-4">
                  <StateGraph
                    parsedLog={parsedLog}
                    onNodeClick={handleStateNodeClick}
                  />
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <LogViewer
                    parsedLog={parsedLog}
                    onEntryClick={handleLogEntryClick}
                  />
                </div>
              )}
            </div>

            {/* Quick Stats Footer */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border pt-4">
              <div>
                <span className="font-medium">States:</span> {parsedLog.states.size}
              </div>
              <div>
                <span className="font-medium">Transitions:</span> {parsedLog.transitions.length}
              </div>
              <div>
                <span className="font-medium">Events:</span> {timelineEvents.length}
              </div>
              <div>
                <span className="font-medium">Result:</span>{' '}
                <span className={cn(
                  parsedLog.statistics.result === 'realizable' ? "text-green-600 dark:text-green-400" :
                  parsedLog.statistics.result === 'unrealizable' ? "text-red-600 dark:text-red-400" :
                  "text-muted-foreground"
                )}>
                  {parsedLog.statistics.result || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Cynthia Visualize - Visualization tools for Cynthia synthesis logs</p>
        </div>
      </footer>
    </div>
  )
}

export default App
