import { useState } from 'react'
import type { FormEvent } from 'react'
import { Save } from 'lucide-react'
import { useApiMutation } from '../hooks/useResource'
import { errorMessage } from '../lib/api'
import { moneyToCents } from '../lib/dashboard'
import type { Category, Expense } from '../types'
import { Modal } from './Modal'

export function ExpenseForm({ expense, categories, paymentMethods, onClose, onSaved }: { expense: Expense | null; categories: Category[]; paymentMethods: string[]; onClose: () => void; onSaved: () => void }) {
  const mutate = useApiMutation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [initialDate] = useState(() => expense?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      await mutate<Expense>(expense ? `/expenses/${expense.id}` : '/expenses', {
        method: expense ? 'PATCH' : 'POST',
        body: JSON.stringify({
          title: String(form.get('title')).trim(),
          amount: moneyToCents(String(form.get('amount'))) / 100,
          categoryId: String(form.get('categoryId')),
          date: String(form.get('date')),
          paymentMethod: String(form.get('paymentMethod')).trim(),
          notes: String(form.get('notes') ?? '').trim() || null,
        }),
      })
      onSaved()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={expense ? 'Edit expense' : 'Add expense'} onClose={onClose} busy={saving}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={saving} className="space-y-4">
          <div><label htmlFor="expense-title" className="mb-1 block text-sm font-medium">Title</label><input id="expense-title" name="title" required minLength={1} maxLength={200} defaultValue={expense?.title ?? ''} className="field" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label htmlFor="expense-amount" className="mb-1 block text-sm font-medium">Amount (USD)</label><input id="expense-amount" name="amount" type="number" required min="0.01" max="9999999999.99" step="0.01" defaultValue={expense?.amount ?? ''} className="field" /></div>
            <div><label htmlFor="expense-date" className="mb-1 block text-sm font-medium">Date</label><input id="expense-date" name="date" type="date" required defaultValue={initialDate} className="field" /></div>
          </div>
          <div><label htmlFor="expense-category" className="mb-1 block text-sm font-medium">Category</label><select id="expense-category" name="categoryId" required defaultValue={expense?.categoryId ?? ''} className="field"><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label htmlFor="expense-method" className="mb-1 block text-sm font-medium">Payment method</label><input id="expense-method" name="paymentMethod" list="payment-methods" required maxLength={50} defaultValue={expense?.paymentMethod ?? ''} className="field" /><datalist id="payment-methods">{[...new Set(['Cash', 'Debit card', 'Credit card', 'Bank transfer', ...paymentMethods])].map((method) => <option key={method} value={method} />)}</datalist></div>
          <div><label htmlFor="expense-notes" className="mb-1 block text-sm font-medium">Notes</label><textarea id="expense-notes" name="notes" maxLength={2000} rows={3} defaultValue={expense?.notes ?? ''} className="field resize-y" /></div>
        </fieldset>
        {error && <p role="alert" className="text-sm text-budget-danger">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={onClose} disabled={saving} className="button-secondary">Cancel</button><button type="submit" disabled={saving} className="button-primary"><Save className="size-4" aria-hidden="true" />{saving ? 'Saving...' : 'Save expense'}</button></div>
      </form>
    </Modal>
  )
}