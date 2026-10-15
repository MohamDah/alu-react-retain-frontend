import type { Expense, ExpenseFilters } from '../types'

export function filterExpenses(
  expenses: readonly Expense[],
  filters: ExpenseFilters,
): Expense[] {
  const query = filters.searchQuery.trim().toLocaleLowerCase()
  const direction = filters.sortOrder === 'asc' ? 1 : -1
  return expenses
    .filter((expense) => {
      const date = expense.date.slice(0, 10)
      return (
        (!query || expense.title.toLocaleLowerCase().includes(query)) &&
        (!filters.categoryId || expense.categoryId === filters.categoryId) &&
        (!filters.paymentMethod ||
          expense.paymentMethod === filters.paymentMethod) &&
        (!filters.startDate || date >= filters.startDate) &&
        (!filters.endDate || date <= filters.endDate)
      )
    })
    .sort((left, right) => {
      const comparison =
        filters.sortBy === 'amount'
          ? Number(left.amount) - Number(right.amount)
          : left.date.localeCompare(right.date)
      return comparison * direction || left.id.localeCompare(right.id)
    })
}
