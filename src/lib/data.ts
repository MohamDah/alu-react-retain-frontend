import { apiRequest } from './api'
import type {
  AdminInsights,
  Budget,
  Category,
  Expense,
  PaginatedResponse,
} from '../types'

export async function loadExpenses(
  token: string,
  signal: AbortSignal,
): Promise<Expense[]> {
  const first = await apiRequest<PaginatedResponse<Expense>>(
    '/expenses?limit=100&page=1',
    { signal },
    token,
  )
  const items = [...first.items]
  for (let page = 2; page <= first.totalPages; page += 1) {
    const result = await apiRequest<PaginatedResponse<Expense>>(
      `/expenses?limit=100&page=${page}`,
      { signal },
      token,
    )
    items.push(...result.items)
  }
  return [...new Map(items.map((expense) => [expense.id, expense])).values()]
}

export const loadCategories = (token: string, signal: AbortSignal) =>
  apiRequest<Category[]>('/categories', { signal }, token)
export const loadBudgets = (token: string, signal: AbortSignal) =>
  apiRequest<Budget[]>('/budgets', { signal }, token)
export const loadInsights = (token: string, signal: AbortSignal) =>
  apiRequest<AdminInsights>('/admin/insights', { signal }, token)
