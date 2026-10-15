import { useState } from 'react'
import type { PayloadAction } from '@reduxjs/toolkit'
import { ChevronLeft, ChevronRight, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { ExpenseForm } from '../components/ExpenseForm'
import { Modal } from '../components/Modal'
import { ResourceStatus } from '../components/ResourceStatus'
import { useApiMutation, useResource } from '../hooks/useResource'
import { errorMessage } from '../lib/api'
import { loadCategories, loadExpenses } from '../lib/data'
import { formatDate, formatMoney, moneyToCents } from '../lib/dashboard'
import { resetFilters, setCategoryId, setEndDate, setPaymentMethod, setSearchQuery, setSortBy, setSortOrder, setStartDate } from '../store/FilterSlice'
import { filterExpenses } from '../store/filter-expenses'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import type { Expense } from '../types'

const pageSize = 10

export function ExpenseList() {
  const expenses = useResource(loadExpenses)
  const categories = useResource(loadCategories)
  const mutate = useApiMutation()
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)
  const [page, setPage] = useState(1)
  const [editor, setEditor] = useState<{ expense: Expense | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const paymentMethods = [...new Set((expenses.data ?? []).map((expense) => expense.paymentMethod))].sort()
  const filtered = filterExpenses(expenses.data ?? [], filters)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index)
  const loading = expenses.loading || categories.loading
  const error = expenses.error || categories.error
  const rangeError = filters.startDate && filters.endDate && filters.startDate > filters.endDate

  function updateFilter(action: PayloadAction<string>) {
    dispatch(action)
    setPage(1)
  }

  async function deleteExpense() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      await mutate<void>(`/expenses/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      expenses.reload()
    } catch (failure) {
      setDeleteError(errorMessage(failure))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-semibold">Expenses</h1><button type="button" onClick={() => setEditor({ expense: null })} disabled={loading || Boolean(error) || !categories.data?.length} className="button-primary"><Plus className="size-4" aria-hidden="true" />Add expense</button></div>
      <ResourceStatus loading={loading} error={error} onRetry={() => { expenses.reload(); categories.reload() }} />
      {!loading && !error && <>
        <div className="mt-6 grid items-end gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-3 lg:col-span-2"><label htmlFor="expense-search" className="mb-1 block text-xs font-medium text-muted">Search expenses</label><div className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-5 text-muted" aria-hidden="true" /><input id="expense-search" type="search" maxLength={200} value={filters.searchQuery} onChange={(event) => updateFilter(setSearchQuery(event.target.value))} className="field pl-10" /></div></div>
          <div><label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-muted">Category</label><select id="filter-category" value={filters.categoryId} onChange={(event) => updateFilter(setCategoryId(event.target.value))} className="field"><option value="">All categories</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div><label htmlFor="filter-method" className="mb-1 block text-xs font-medium text-muted">Payment method</label><select id="filter-method" value={filters.paymentMethod} onChange={(event) => updateFilter(setPaymentMethod(event.target.value))} className="field"><option value="">All methods</option>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select></div>
          <div><label htmlFor="filter-start" className="mb-1 block text-xs font-medium text-muted">Start date</label><input id="filter-start" type="date" value={filters.startDate} onChange={(event) => updateFilter(setStartDate(event.target.value))} className="field" /></div>
          <div><label htmlFor="filter-end" className="mb-1 block text-xs font-medium text-muted">End date</label><input id="filter-end" type="date" value={filters.endDate} onChange={(event) => updateFilter(setEndDate(event.target.value))} className="field" /></div>
          <div><label htmlFor="filter-sort" className="mb-1 block text-xs font-medium text-muted">Sort by</label><select id="filter-sort" value={filters.sortBy} onChange={(event) => updateFilter(setSortBy(event.target.value === 'amount' ? 'amount' : 'date'))} className="field"><option value="date">Date</option><option value="amount">Amount</option></select></div>
          <div className="flex items-end gap-2"><div className="min-w-0 flex-1"><label htmlFor="filter-order" className="mb-1 block text-xs font-medium text-muted">Sort order</label><select id="filter-order" value={filters.sortOrder} onChange={(event) => updateFilter(setSortOrder(event.target.value === 'asc' ? 'asc' : 'desc'))} className="field"><option value="desc">Descending</option><option value="asc">Ascending</option></select></div><button type="button" onClick={() => { dispatch(resetFilters()); setPage(1) }} title="Reset filters" aria-label="Reset filters" className="icon-button"><RotateCcw className="size-5" /></button></div>
        </div>
        {rangeError && <p role="alert" className="mt-3 text-sm text-budget-danger">Start date must not be after end date.</p>}
        {!categories.data?.length && <p className="mt-4 text-sm text-muted">No categories available.</p>}
        <p aria-live="polite" className="mt-6 text-sm text-muted">{filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}</p>
        <div className="mt-3 overflow-x-auto border-y border-line bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Expenses, page {currentPage} of {totalPages}</caption>
            <thead className="bg-canvas text-xs text-muted"><tr><th scope="col" className="px-4 py-3 font-medium">Title</th><th scope="col" className="px-4 py-3 font-medium">Category</th><th scope="col" className="px-4 py-3 font-medium">Date</th><th scope="col" className="px-4 py-3 font-medium">Payment</th><th scope="col" className="px-4 py-3 text-right font-medium">Amount</th><th scope="col" className="px-4 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">
              {visible.map((expense) => <tr key={expense.id} className="hover:bg-canvas/60"><td className="max-w-64 break-words px-4 py-3 font-medium">{expense.title}</td><td className="max-w-48 break-words px-4 py-3 text-muted">{expense.category.name}</td><td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(expense.date)}</td><td className="max-w-40 break-words px-4 py-3 text-muted">{expense.paymentMethod}</td><td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">{formatMoney(moneyToCents(expense.amount))}</td><td className="px-2 py-1"><div className="flex justify-end"><button type="button" onClick={() => setEditor({ expense })} className="icon-button" title={`Edit ${expense.title}`} aria-label={`Edit ${expense.title}`}><Pencil className="size-4" /></button><button type="button" onClick={() => { setDeleteTarget(expense); setDeleteError('') }} className="icon-button hover:text-budget-danger" title={`Delete ${expense.title}`} aria-label={`Delete ${expense.title}`}><Trash2 className="size-4" /></button></div></td></tr>)}
              {visible.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted">{expenses.data?.length ? 'No matching expenses.' : 'No expenses yet.'}</td></tr>}
            </tbody>
          </table>
        </div>
        <nav aria-label="Expense pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">{filtered.length === 0 ? '0 results' : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} of ${filtered.length}`}</p>
          <div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="icon-button" title="Previous page" aria-label="Previous page"><ChevronLeft className="size-5" /></button>{pages.map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-label={`Page ${number}`} aria-current={number === currentPage ? 'page' : undefined} className={`flex size-11 items-center justify-center rounded-md text-sm font-medium ${number === currentPage ? 'bg-brand text-white' : 'text-muted hover:bg-white'}`}>{number}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="icon-button" title="Next page" aria-label="Next page"><ChevronRight className="size-5" /></button></div>
        </nav>
      </>}
      {editor && categories.data && <ExpenseForm expense={editor.expense} categories={categories.data} paymentMethods={paymentMethods} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); expenses.reload() }} />}
      {deleteTarget && <Modal title="Delete expense?" onClose={() => setDeleteTarget(null)} busy={deleting}><p className="break-words text-sm text-muted">{deleteTarget.title} · {formatMoney(moneyToCents(deleteTarget.amount))}</p>{deleteError && <p role="alert" className="mt-3 text-sm text-budget-danger">{deleteError}</p>}<div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="button-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" disabled={deleting} onClick={() => void deleteExpense()} className="button-primary bg-budget-danger hover:bg-red-700"><Trash2 className="size-4" aria-hidden="true" />{deleting ? 'Deleting...' : 'Delete expense'}</button></div></Modal>}
    </div>
  )
}