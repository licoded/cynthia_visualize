/**
 * Example usage of the LogViewer component
 *
 * This demonstrates how to load a log file and display it with the LogViewer
 */

import { useState, useCallback } from 'react'
import { LogViewer } from './index'
import { parseLogFile } from '../../parser'
import type { ParsedLog } from '../../parser/types'
import type { LogEntry, State } from '../../parser/types'

function LogViewerExample() {
  const [parsedLog, setParsedLog] = useState<ParsedLog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const result = await parseLogFile(file)
      setParsedLog(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse log file')
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle entry click - link to state graph
  const handleEntryClick = useCallback((entry: LogEntry, state?: State) => {
    console.log('Clicked entry:', entry)
    console.log('Associated state:', state)

    // TODO: Integrate with state graph visualization
    // Example: Scroll to or highlight the state in the graph
    if (state) {
      console.log(`Navigate to state ${state.id}`)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Parsing log file...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">Error parsing log file</div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setParsedLog(null)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!parsedLog) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-24 w-24 text-muted-foreground mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-4">Load Cynthia Log File</h2>
          <p className="text-muted-foreground mb-6">
            Upload a Cynthia execution log file to visualize states, transitions, and other information.
          </p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span>Choose File</span>
            <input
              type="file"
              accept=".log,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen p-4">
      <LogViewer
        parsedLog={parsedLog}
        onEntryClick={handleEntryClick}
        maxEntries={1000}
      />
    </div>
  )
}

export default LogViewerExample
