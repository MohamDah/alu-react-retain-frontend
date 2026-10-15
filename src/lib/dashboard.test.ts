import { describe, expect, it } from 'vitest'
import type { Budget, Expense } from '../types'
import { budgetStatus, moneyToCents, monthlySummary } from './dashboard'

const expenses: Expense[] = ['0.10', '0.20', '12.00'].map((amount, index) => ({
  id: String(index), title: `Expense ${index}`, amount, categoryId: 'food',
  category: { id: 'food', name: 'Food', isDefault: false }, date: index === 2 ? '2026-09-30' : '2026-10-01',
  paymentMethod: 'Card', notes: null, userId: 'user', createdAt: '2026-10-01',
}))
const budgets: Budget[] = [{ id: 'budget', amount: '1.00', month: 10, year: 2026, userId: 'user' }]

describe('dashboard calculations', () => {
  it('adds integer cents and isolates the selected month', () => {
    const result = monthlySummary(expenses, budgets, '2026-10')
    expect(result.totalCents).toBe(30)
    expect(result.remainingCents).toBe(70)
    expect(result.highest?.amount).toBe('0.20')
    expect(result.categories).toEqual([{ id: 'food', name: 'Food', cents: 30, count: 2 }])
  })

  it('distinguishes no budget and no expenses from zero remaining', () => {
    expect(monthlySummary([], [], '2026-10')).toMatchObject({ totalCents: 0, budgetCents: null, remainingCents: null, highest: null, categories: [] })
  })

  it('uses the exact 80% and 100% rubric boundaries', () => {
    expect(budgetStatus(80, 100).tone).toBe('safe')
    expect(budgetStatus(81, 100).tone).toBe('warning')
    expect(budgetStatus(100, 100).tone).toBe('warning')
    expect(budgetStatus(101, 100).tone).toBe('over')
    expect(budgetStatus(1, null).tone).toBe('unset')
    expect(budgetStatus(1, 0).percentage).toBe(0)
  })

  it('validates monetary values without rounding away invalid input', () => {
    expect(moneyToCents('9999999999.99')).toBe(999999999999)
    expect(moneyToCents('12.5')).toBe(1250)
    expect(() => moneyToCents('not money')).toThrow()
    expect(() => moneyToCents('1.001')).toThrow()
  })
})