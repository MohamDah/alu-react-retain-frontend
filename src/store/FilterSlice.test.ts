import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import reducer, {
  initialFilters,
  resetFilters,
  setCategoryId,
  setEndDate,
  setPaymentMethod,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setStartDate,
} from './FilterSlice'
import { filterExpenses } from './filter-expenses'

const expenses: Expense[] = [
  {
    id: 'a',
    title: 'Coffee',
    amount: '9.50',
    date: '2026-10-01T00:00:00.000Z',
    paymentMethod: 'Cash',
    categoryId: 'food',
  },
  {
    id: 'b',
    title: 'Train',
    amount: '100.00',
    date: '2026-10-02T00:00:00.000Z',
    paymentMethod: 'Card',
    categoryId: 'travel',
  },
  {
    id: 'c',
    title: 'COFFEE beans',
    amount: '12.00',
    date: '2026-10-03T00:00:00.000Z',
    paymentMethod: 'Card',
    categoryId: 'food',
  },
].map((expense) => ({
  ...expense,
  category: {
    id: expense.categoryId,
    name: expense.categoryId,
    isDefault: false,
  },
  notes: null,
  userId: 'user',
  createdAt: expense.date,
}))

describe('FilterSlice', () => {
  it('stores only the required filters with newest-first defaults', () => {
    expect(reducer(undefined, { type: 'init' })).toEqual(initialFilters)
    expect(Object.keys(initialFilters)).toEqual([
      'searchQuery',
      'categoryId',
      'paymentMethod',
      'startDate',
      'endDate',
      'sortBy',
      'sortOrder',
    ])
  })

  it('updates all fields and resets them without mutating defaults', () => {
    let state = reducer(undefined, setSearchQuery('coffee'))
    state = reducer(state, setCategoryId('food'))
    state = reducer(state, setPaymentMethod('Card'))
    state = reducer(state, setStartDate('2026-10-01'))
    state = reducer(state, setEndDate('2026-10-03'))
    state = reducer(state, setSortBy('amount'))
    state = reducer(state, setSortOrder('asc'))
    expect(state).toEqual({
      searchQuery: 'coffee',
      categoryId: 'food',
      paymentMethod: 'Card',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      sortBy: 'amount',
      sortOrder: 'asc',
    })
    expect(reducer(state, resetFilters())).toEqual(initialFilters)
    expect(initialFilters.searchQuery).toBe('')
  })
})

describe('filterExpenses', () => {
  it('combines case-insensitive search, category, payment and inclusive dates', () => {
    const result = filterExpenses(expenses, {
      ...initialFilters,
      searchQuery: ' COFFEE ',
      categoryId: 'food',
      paymentMethod: 'Card',
      startDate: '2026-10-03',
      endDate: '2026-10-03',
    })
    expect(result.map((expense) => expense.id)).toEqual(['c'])
  })

  it('sorts decimal strings numerically in both directions', () => {
    expect(
      filterExpenses(expenses, {
        ...initialFilters,
        sortBy: 'amount',
        sortOrder: 'asc',
      }).map((expense) => expense.id),
    ).toEqual(['a', 'c', 'b'])
    expect(
      filterExpenses(expenses, {
        ...initialFilters,
        sortBy: 'amount',
        sortOrder: 'desc',
      }).map((expense) => expense.id),
    ).toEqual(['b', 'c', 'a'])
  })

  it('sorts dates both ways without changing the original array', () => {
    const original = structuredClone(expenses)
    expect(
      filterExpenses(expenses, initialFilters).map((expense) => expense.id),
    ).toEqual(['c', 'b', 'a'])
    expect(
      filterExpenses(expenses, { ...initialFilters, sortOrder: 'asc' }).map(
        (expense) => expense.id,
      ),
    ).toEqual(['a', 'b', 'c'])
    expect(expenses).toEqual(original)
  })

  it('handles empty results and inverted date ranges', () => {
    expect(
      filterExpenses(expenses, { ...initialFilters, searchQuery: 'missing' }),
    ).toEqual([])
    expect(
      filterExpenses(expenses, {
        ...initialFilters,
        startDate: '2026-10-03',
        endDate: '2026-10-01',
      }),
    ).toEqual([])
  })
})
