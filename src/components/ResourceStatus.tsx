import { RefreshCw } from 'lucide-react'

export function ResourceStatus({ loading, error, onRetry }: { loading: boolean; error: string; onRetry: () => void }) {
  if (loading) return <p role="status" className="py-8 text-sm text-muted">Loading...</p>
  if (!error) return null
  return (
    <div className="flex flex-wrap items-center gap-3 py-6">
      <p role="alert" className="text-sm text-budget-danger">{error}</p>
      <button type="button" onClick={onRetry} className="button-secondary"><RefreshCw className="size-4" aria-hidden="true" />Retry</button>
    </div>
  )
}