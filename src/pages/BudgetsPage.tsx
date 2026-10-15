import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Save, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { ResourceStatus } from '../components/ResourceStatus'
import { useApiMutation, useResource } from '../hooks/useResource'
import { errorMessage } from '../lib/api'
import { loadBudgets } from '../lib/data'
import { currentMonth, formatMoney, moneyToCents } from '../lib/dashboard'
import type { Budget } from '../types'

const budgetPeriod = (budget: Budget) =>
  `${budget.year}-${String(budget.month).padStart(2, '0')}`

export function BudgetsPage() {
  const budgets = useResource(loadBudgets)
  const mutate = useApiMutation()
  const [period, setPeriod] = useState(currentMonth)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null)
  const selected = budgets.data?.find(
    (budget) => budgetPeriod(budget) === period,
  )

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const [year, month] = period.split('-').map(Number)
      await mutate<Budget>(selected ? `/budgets/${selected.id}` : '/budgets', {
        method: selected ? 'PATCH' : 'POST',
        body: JSON.stringify({
          amount: moneyToCents(String(form.get('amount'))) / 100,
          month,
          year,
        }),
      })
      setMessage('Budget saved.')
      budgets.reload()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setSaving(false)
    }
  }

  async function deleteBudget() {
    if (!deleteTarget || saving) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await mutate<void>(`/budgets/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      setMessage('Budget deleted.')
      budgets.reload()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <ResourceStatus
        loading={budgets.loading}
        error={budgets.error}
        onRetry={budgets.reload}
      />
      {message && (
        <p role="status" className="mt-4 text-sm text-brand">
          {message}
        </p>
      )}
      {!budgets.loading && !budgets.error && (
        <>
          <form
            onSubmit={handleSave}
            className="mt-6 flex max-w-2xl flex-col items-stretch gap-4 md:flex-row md:items-end"
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="budget-month"
                className="mb-1 block text-sm font-medium"
              >
                Month
              </label>
              <input
                id="budget-month"
                type="month"
                required
                min="1900-01"
                max="9999-12"
                value={period}
                disabled={saving}
                onChange={(event) => {
                  setPeriod(event.target.value)
                  setError('')
                  setMessage('')
                }}
                className="field"
              />
            </div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="budget-amount"
                className="mb-1 block text-sm font-medium"
              >
                Budget amount (USD)
              </label>
              <input
                key={`${period}:${selected?.amount ?? ''}`}
                id="budget-amount"
                name="amount"
                type="number"
                required
                min="0.01"
                max="9999999999.99"
                step="0.01"
                defaultValue={selected?.amount ?? ''}
                disabled={saving}
                className="field"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !period}
              className="button-primary"
            >
              <Save className="size-4" aria-hidden="true" />
              {saving
                ? 'Saving...'
                : selected
                  ? 'Update budget'
                  : 'Save budget'}
            </button>
          </form>
          {!deleteTarget && error && (
            <p role="alert" className="mt-3 text-sm text-budget-danger">
              {error}
            </p>
          )}
          <div className="mt-10 overflow-x-auto border-y border-line bg-white">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Monthly budgets</caption>
              <thead className="bg-canvas text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Month
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Budget
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {budgets.data?.map((budget) => (
                  <tr key={budget.id}>
                    <td className="whitespace-nowrap px-4 py-3">
                      {budgetPeriod(budget)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                      {formatMoney(moneyToCents(budget.amount))}
                    </td>
                    <td className="px-2 py-1">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={saving}
                          title={`Edit budget ${budgetPeriod(budget)}`}
                          aria-label={`Edit budget ${budgetPeriod(budget)}`}
                          onClick={() => {
                            setPeriod(budgetPeriod(budget))
                            setError('')
                            setMessage('')
                          }}
                          className="icon-button"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          title={`Delete budget ${budgetPeriod(budget)}`}
                          aria-label={`Delete budget ${budgetPeriod(budget)}`}
                          onClick={() => {
                            setDeleteTarget(budget)
                            setError('')
                          }}
                          className="icon-button hover:text-budget-danger"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!budgets.data?.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-10 text-center text-muted"
                    >
                      No budgets yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {deleteTarget && (
        <Modal
          title="Delete budget?"
          busy={saving}
          onClose={() => {
            setDeleteTarget(null)
            setError('')
          }}
        >
          <p className="text-sm text-muted">
            {budgetPeriod(deleteTarget)} |{' '}
            {formatMoney(moneyToCents(deleteTarget.amount))}
          </p>
          {error && (
            <p role="alert" className="mt-3 text-sm text-budget-danger">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={saving}
              className="button-secondary"
              onClick={() => {
                setDeleteTarget(null)
                setError('')
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              className="button-primary bg-budget-danger hover:bg-red-700"
              onClick={() => void deleteBudget()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {saving ? 'Deleting...' : 'Delete budget'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
