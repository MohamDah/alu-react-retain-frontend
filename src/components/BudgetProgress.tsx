import { budgetStatus } from '../lib/dashboard'

const tones = {
  unset: 'bg-line',
  safe: 'bg-budget-safe',
  warning: 'bg-budget-warning',
  over: 'bg-budget-danger',
}

export function BudgetProgress({
  spentCents,
  budgetCents,
}: {
  spentCents: number
  budgetCents: number | null
}) {
  const { percentage, tone } = budgetStatus(spentCents, budgetCents)
  return (
    <div className="mt-4">
      <div
        role="progressbar"
        aria-label="Budget usage"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, percentage)}
        aria-valuetext={
          tone === 'unset'
            ? 'No budget set'
            : `${percentage.toFixed(1)}% of budget spent`
        }
        className="h-2 w-full overflow-hidden rounded bg-line"
      >
        <div
          className={`h-full ${tones[tone]}`}
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {tone === 'unset'
          ? 'No budget set'
          : `${percentage.toFixed(1)}% spent${tone === 'over' ? ' · Over budget' : tone === 'warning' ? ' · Approaching budget' : ''}`}
      </p>
    </div>
  )
}
