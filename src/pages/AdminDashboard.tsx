import { Banknote, Receipt, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ResourceStatus } from '../components/ResourceStatus'
import { useResource } from '../hooks/useResource'
import { loadInsights } from '../lib/data'
import { formatDate, formatMoney, moneyToCents } from '../lib/dashboard'
import type { CategoryInsight } from '../types'

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: LucideIcon; color: string }) {
  return <article aria-label={title} className="min-w-0 rounded-lg border border-line bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-muted">{title}</h2><Icon className={`size-5 shrink-0 ${color}`} aria-hidden="true" /></div><p className="mt-4 break-words text-2xl font-semibold tabular-nums">{value}</p></article>
}

function CategoryList({ title, items }: { title: string; items: CategoryInsight[] }) {
  return <section aria-label={title} className="min-w-0"><h2 className="text-base font-semibold">{title}</h2>{items.length === 0 ? <p className="py-6 text-sm text-muted">No categories yet.</p> : <ul className="mt-3 divide-y divide-line">{items.map((item) => <li key={item.categoryId} className="flex items-start justify-between gap-4 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-muted">{item.totalExpenses.toLocaleString()} expenses</p></div><span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(moneyToCents(item.totalValue))}</span></li>)}</ul>}</section>
}

export function AdminDashboard() {
  const insights = useResource(loadInsights)
  const data = insights.data
  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <ResourceStatus loading={insights.loading} error={insights.error} onRetry={insights.reload} />
      {data && !insights.loading && !insights.error && <>
        <p className="mt-2 text-sm text-muted">{data.currentMonth.year}-{String(data.currentMonth.month).padStart(2, '0')} | {data.currentMonth.totalExpenses.toLocaleString()} expenses this month</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard title="Total users" value={data.totalRegisteredUsers.toLocaleString()} icon={Users} color="text-brand" />
          <StatCard title="Total expenses" value={data.totalExpensesRecorded.toLocaleString()} icon={Receipt} color="text-sky-600" />
          <StatCard title="Current month volume" value={formatMoney(moneyToCents(data.currentMonth.totalValue))} icon={Banknote} color="text-rose-500" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <CategoryList title="Spending per category" items={data.spendingPerCategory} />
          <CategoryList title="Top 5 categories" items={data.top5Categories} />
          <CategoryList title="Bottom 5 categories" items={data.bottom5Categories} />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="admin-recent-expenses" className="min-w-0"><h2 id="admin-recent-expenses" className="text-base font-semibold">Recent expenses</h2>{data.recentExpenses.length === 0 ? <p className="py-6 text-sm text-muted">No expenses yet.</p> : <ul className="mt-3 divide-y divide-line">{data.recentExpenses.map((expense) => <li key={expense.id} className="flex items-start justify-between gap-4 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{expense.title}</p><p className="mt-1 break-words text-xs text-muted">{expense.user.email} | {expense.category.name} | {formatDate(expense.date)}</p></div><span className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(moneyToCents(expense.amount))}</span></li>)}</ul>}</section>
          <section aria-labelledby="admin-recent-users" className="min-w-0"><h2 id="admin-recent-users" className="text-base font-semibold">Recent users</h2>{data.recentUsers.length === 0 ? <p className="py-6 text-sm text-muted">No users yet.</p> : <ul className="mt-3 divide-y divide-line">{data.recentUsers.map((user) => <li key={user.id} className="flex items-start justify-between gap-4 py-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{user.email}</p><p className="mt-1 text-xs text-muted">{formatDate(user.createdAt)}</p></div><span className="text-xs text-muted">{user.role}</span></li>)}</ul>}</section>
        </div>
        <Link to="/admin/categories" className="mt-8 inline-block text-sm font-medium text-brand underline underline-offset-4">Manage categories</Link>
      </>}
    </div>
  )
}