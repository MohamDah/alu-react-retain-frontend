import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Expense } from '../types'
import { ApiError, apiRequest } from './api'
import { loadExpenses } from './data'

const fetchMock = vi.fn<typeof fetch>()
const expense = (id: string): Expense => ({
  id,
  title: id,
  amount: '1.00',
  categoryId: 'category',
  category: { id: 'category', name: 'Food', isDefault: false },
  date: '2026-10-11T00:00:00.000Z',
  paymentMethod: 'Cash',
  notes: null,
  userId: 'user',
  createdAt: '2026-10-11T00:00:00.000Z',
})

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('API resource loading', () => {
  it('loads every API page and deduplicates IDs without losing token or signal', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ items: [expense('first')], totalPages: 2 }),
    )
    fetchMock.mockResolvedValueOnce(
      Response.json({
        items: [expense('second'), expense('first')],
        totalPages: 2,
      }),
    )
    const controller = new AbortController()
    expect(
      (await loadExpenses('test-token', controller.signal)).map(
        (item) => item.id,
      ),
    ).toEqual(['first', 'second'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]?.[0]).toBe('/api/expenses?limit=100&page=2')
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBe(controller.signal)
    expect(
      new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization'),
    ).toBe('Bearer test-token')
  })

  it('preserves HTTP status and validation messages', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: ['Bad amount', 'Bad date'] }, { status: 400 }),
    )
    await expect(apiRequest('/expenses')).rejects.toMatchObject({
      status: 400,
      message: 'Bad amount. Bad date',
    })
    fetchMock.mockResolvedValueOnce(
      Response.json({ message: 'Unauthorized' }, { status: 401 }),
    )
    await expect(apiRequest('/expenses')).rejects.toBeInstanceOf(ApiError)
  })

  it('handles empty delete responses and non-JSON server errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await expect(
      apiRequest('/expenses/id', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
    fetchMock.mockResolvedValueOnce(
      new Response('Bad Gateway', { status: 502 }),
    )
    await expect(apiRequest('/expenses')).rejects.toMatchObject({
      status: 502,
      message: 'The server is unavailable. Please try again.',
    })
  })

  it('propagates cancellation for the resource hook to ignore', async () => {
    fetchMock.mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
    await expect(
      loadExpenses('test-token', new AbortController().signal),
    ).rejects.toHaveProperty('name', 'AbortError')
  })
})
