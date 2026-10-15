import type { Budget, DecimalAmount, Expense } from '../types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export function moneyToCents(amount: DecimalAmount): number {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) throw new Error('Invalid monetary value')
  const [whole, fraction = ''] = amount.split('.')
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents)) throw new Error('Monetary value is too large')
  return cents
}

export const formatMoney = (cents: number) => currency.format(cents / 100)
export const formatDate = (date: string) => dateFormat.format(new Date(date))
export const currentMonth = () => new Date().toISOString().slice(0, 7)

export function budgetStatus(spentCents: number, budgetCents: number | null): { percentage: number; tone: 'unset' | 'safe' | 'warning' | 'over' } {
  if (budgetCents === null || budgetCents <= 0) return { percentage: 0, tone: 'unset' as const }
  const percentage = spentCents / budgetCents * 100
  const tone = percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'safe'
  return { percentage, tone }
}

export function monthlySummary(expenses: readonly Expense[], budgets: readonly Budget[], period: string) {
  const [year, month] = period.split('-').map(Number)
  const monthly = expenses.filter((expense) => expense.date.slice(0, 7) === period)
  const totalCents = monthly.reduce((sum, expense) => sum + moneyToCents(expense.amount), 0)
  const budget = budgets.find((entry) => entry.month === month && entry.year === year)
  const budgetCents = budget ? moneyToCents(budget.amount) : null
  const highest = monthly.reduce<Expense | null>((result, expense) => !result || moneyToCents(expense.amount) > moneyToCents(result.amount) ? expense : result, null)
  const categories = new Map<string, { id: string; name: string; cents: number; count: number }>()
  for (const expense of monthly) {
    const entry = categories.get(expense.categoryId) ?? { id: expense.categoryId, name: expense.category.name, cents: 0, count: 0 }
    entry.cents += moneyToCents(expense.amount)
    entry.count += 1
    categories.set(entry.id, entry)
  }
  return {
    totalCents,
    budgetCents,
    remainingCents: budgetCents === null ? null : budgetCents - totalCents,
    highest,
    categories: [...categories.values()].sort((left, right) => right.cents - left.cents || left.name.localeCompare(right.name)),
    recent: [...expenses].sort((left, right) => right.date.localeCompare(left.date) || left.id.localeCompare(right.id)).slice(0, 5),
    count: monthly.length,
  }
}