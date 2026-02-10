import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the parseLogFile function
vi.mock('./parser', () => ({
  parseLogFile: vi.fn()
}))

describe('App Integration', () => {
  it('renders the upload screen when no log is loaded', () => {
    render(<App />)

    expect(screen.getByText('Cynthia Visualize')).toBeInTheDocument()
    expect(screen.getByText('Upload Log File')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop a .log file here/)).toBeInTheDocument()
  })

  it('displays loading state while parsing', async () => {
    const { parseLogFile } = await import('./parser')
    vi.mocked(parseLogFile).mockImplementation(() => new Promise(() => {}))

    render(<App />)

    const fileInput = screen.getByLabelText(/Browse Files/i).closest('input')
    if (fileInput) {
      const file = new File([''], 'test.log', { type: 'text/plain' })
      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Parsing log file...')).toBeInTheDocument()
      })
    }
  })

  it('displays error message when parsing fails', async () => {
    const { parseLogFile } = await import('./parser')
    vi.mocked(parseLogFile).mockRejectedValue(new Error('Invalid log format'))

    render(<App />)

    const fileInput = screen.getByLabelText(/Browse Files/i).closest('input')
    if (fileInput) {
      const file = new File([''], 'test.log', { type: 'text/plain' })
      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Invalid log format')).toBeInTheDocument()
      })
    }
  })

  it('renders dashboard tab after successful file upload', async () => {
    const { parseLogFile } = await import('./parser')
    vi.mocked(parseLogFile).mockResolvedValue({
      entries: [],
      states: new Map(),
      transitions: [],
      systemMoves: [],
      environmentMoves: [],
      realizabilityChecks: [],
      loopDetections: [],
      lookAheads: [],
      statistics: { result: 'realizable' as const },
      metadata: {
        totalLines: 100,
        parsedLines: 95,
        failedLines: 5,
        filePath: 'test.log',
        parsedAt: new Date()
      }
    })

    render(<App />)

    const fileInput = screen.getByLabelText(/Browse Files/i).closest('input')
    if (fileInput) {
      const file = new File([''], 'test.log', { type: 'text/plain' })
      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Timeline')).toBeInTheDocument()
        expect(screen.getByText('State Graph')).toBeInTheDocument()
        expect(screen.getByText('Log Viewer')).toBeInTheDocument()
      })
    }
  })

  it('switches between tabs correctly', async () => {
    const { parseLogFile } = await import('./parser')
    vi.mocked(parseLogFile).mockResolvedValue({
      entries: [],
      states: new Map(),
      transitions: [],
      systemMoves: [],
      environmentMoves: [],
      realizabilityChecks: [],
      loopDetections: [],
      lookAheads: [],
      statistics: {},
      metadata: {
        totalLines: 100,
        parsedLines: 95,
        failedLines: 5,
        filePath: 'test.log',
        parsedAt: new Date()
      }
    })

    render(<App />)

    const fileInput = screen.getByLabelText(/Browse Files/i).closest('input')
    if (fileInput) {
      const file = new File([''], 'test.log', { type: 'text/plain' })
      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })

      // Click on Timeline tab
      await userEvent.click(screen.getByText('Timeline'))
      expect(screen.getByText('Execution Timeline')).toBeInTheDocument()

      // Click on State Graph tab
      await userEvent.click(screen.getByText('State Graph'))

      // Click on Log Viewer tab
      await userEvent.click(screen.getByText('Log Viewer'))
      expect(screen.getByText('Log Viewer')).toBeInTheDocument()
    }
  })

  it('clears log data when Clear Log button is clicked', async () => {
    const { parseLogFile } = await import('./parser')
    vi.mocked(parseLogFile).mockResolvedValue({
      entries: [],
      states: new Map(),
      transitions: [],
      systemMoves: [],
      environmentMoves: [],
      realizabilityChecks: [],
      loopDetections: [],
      lookAheads: [],
      statistics: {},
      metadata: {
        totalLines: 100,
        parsedLines: 95,
        failedLines: 5,
        filePath: 'test.log',
        parsedAt: new Date()
      }
    })

    render(<App />)

    const fileInput = screen.getByLabelText(/Browse Files/i).closest('input')
    if (fileInput) {
      const file = new File([''], 'test.log', { type: 'text/plain' })
      await userEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
      })

      const clearButton = screen.getByText('Clear Log')
      await userEvent.click(clearButton)

      expect(screen.getByText('Upload Log File')).toBeInTheDocument()
    }
  })
})
