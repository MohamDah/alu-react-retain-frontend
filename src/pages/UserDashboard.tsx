import { useState } from 'react'
import { ArrowUpRight, PiggyBank, Receipt, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BudgetProgress } from '../components/BudgetProgress'
import { ResourceStatus } from '../components/ResourceStatus'
import { useResource } from '../hooks/useResource'
import { loadBudgets, loadExpenses } from '../lib/data'
import { currentMonth, formatDate, formatMoney, moneyToCents, monthlySummary } from '../lib/dashboard'

const categoryColors = ['bg-emerald-500', 'bg-sky-500', 'bg-rose-400', 'bg-amber-400', 'bg-gray-400']

export function UserDashboard() {
  const expenses = useResource(loadExpenses)
  const budgets = useResource(loadBudgets)
  const [period, setPeriod] = useState(currentMonth)
  const loading = expenses.loading || budgets.loading
  const error = expenses.error || budgets.error
  const summary = monthlySummary(expenses.data ?? [], budgets.data ?? [], period)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div>
          <label htmlFor="dashboard-month" className="mb-1 block text-xs font-medium text-muted">Month</label>
          <input id="dashboard-month" type="month" min="1900-01" max="9999-12" value={period} onChange={(event) => { if (/^\d{4}-\d{2}$/.test(event.target.value)) setPeriod(event.target.value) }} className="field w-auto" />
        </div>
      </div>
      <ResourceStatus loading={loading} error={error} onRetry={() => { expenses.reload(); budgets.reload() }} />
      {!loading && !error && <>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article aria-label="Monthly total spent" className="min-w-0 rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-muted">Monthly total spent</h2><Receipt className="size-5 text-brand" aria-hidden="true" /></div>
            <p className="mt-4 break-words text-2xl font-semibold tabular-nums">{formatMoney(summary.totalCents)}</p>
            <p className="mt-2 text-xs text-muted">{summary.count} {summary.count === 1 ? 'expense' : 'expenses'}</p>
          </article>
          <article aria-label="Remaining budget" className="min-w-0 rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-muted">Remaining budget</h2><PiggyBank className="size-5 text-sky-600" aria-hidden="true" /></div>
            <p className={`mt-4 break-words text-2xl font-semibold tabular-nums ${summary.remainingCents !== null && summary.remainingCents < 0 ? 'text-budget-danger' : ''}`}>
              {summary.remainingCents === null ? 'Not set' : formatMoney(summary.remainingCents)}
            </p>
            <BudgetProgress spentCents={summary.totalCents} budgetCents={summary.budgetCents} />
            {summary.budgetCents === null && <Link to="/budgets" className="mt-3 inline-block text-sm font-medium text-brand underline underline-offset-4">Set budget</Link>}
          </article>
          <article aria-label="Highest individual expense" className="min-w-0 rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-muted">Highest individual expense</h2><TrendingUp className="size-5 text-rose-500" aria-hidden="true" /></div>
            <p className="mt-4 break-words text-2xl font-semibold tabular-nums">{summary.highest ? formatMoney(moneyToCents(summary.highest.amount)) : formatMoney(0)}</p>
            <p className="mt-2 break-words text-xs text-muted">{summary.highest?.title ?? 'No expenses this month'}</p>
          </article>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="category-heading" className="min-w-0">
            <h2 id="category-heading" className="text-base font-semibold">Spending by category</h2>
            {summary.categories.length === 0 ? <p className="py-6 text-sm text-muted">No expenses this month.</p> :
              <ul className="mt-4 space-y-5">
                {summary.categories.map((category, index) => <li key={category.id}>
                  <div className="flex items-start justify-between gap-4 text-sm"><span className="min-w-0 break-words font-medium">{category.name}</span><span className="shrink-0 tabular-nums">{formatMoney(category.cents)}</span></div>
                  <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded bg-line"><div className={`h-full ${categoryColors[index % categoryColors.length]}`} style={{ width: `${summary.totalCents === 0 ? 0 : category.cents / summary.totalCents * 100}%` }} /></div>
                  <p className="mt-1 text-xs text-muted">{summary.totalCents === 0 ? 0 : (category.cents / summary.totalCents * 100).toFixed(1)}% · {category.count} {category.count === 1 ? 'expense' : 'expenses'}</p>
                </li>)}
              </ul>}
          </section>
          <section aria-labelledby="recent-heading" className="min-w-0">
            <div className="flex items-center justify-between gap-4"><h2 id="recent-heading" className="text-base font-semibold">Recent expenses</h2><Link to="/expenses" className="inline-flex items-center gap-1 text-sm font-medium text-brand">View all<ArrowUpRight className="size-4" aria-hidden="true" /></Link></div>
            {summary.recent.length === 0 ? <p className="py-6 text-sm text-muted">No expenses yet.</p> : <ul className="mt-3 divide-y divide-line">
              {summary.recent.map((expense) => <li key={expense.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0"><p className="break-words text-sm font-medium">{expense.title}</p><p className="mt-1 break-words text-xs text-muted">{expense.category.name} · {formatDate(expense.date)}</p></div>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(moneyToCents(expense.amount))}</span>
              </li>)}
            </ul>}
          </section>
        </div>
      </>}
    </div>
  )
}