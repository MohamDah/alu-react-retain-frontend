import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, LockKeyhole, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { Modal } from '../components/Modal'
import { ResourceStatus } from '../components/ResourceStatus'
import { useApiMutation, useResource } from '../hooks/useResource'
import { errorMessage } from '../lib/api'
import { loadCategories } from '../lib/data'
import type { Category } from '../types'

function CategoryForm({ category, onClose, onSaved }: { category: Category | null; onClose: () => void; onSaved: () => void }) {
  const mutate = useApiMutation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    setSaving(true)
    setError('')
    try {
      await mutate<Category>(category ? `/categories/${category.id}` : '/categories', {
        method: category ? 'PATCH' : 'POST',
        body: JSON.stringify({ name: String(form.get('name')).trim(), isDefault: form.get('isDefault') === 'on' }),
      })
      onSaved()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setSaving(false)
    }
  }
  return <Modal title={category ? 'Edit category' : 'Add category'} busy={saving} onClose={onClose}><form onSubmit={handleSubmit} className="space-y-4"><div><label htmlFor="category-name" className="mb-1 block text-sm font-medium">Name</label><input id="category-name" name="name" required minLength={1} maxLength={100} defaultValue={category?.name ?? ''} disabled={saving} className="field" /></div><label className="flex min-h-11 items-center gap-3 text-sm"><input name="isDefault" type="checkbox" defaultChecked={category?.isDefault ?? false} disabled={saving} className="size-4 accent-brand" />Default category</label>{error && <p role="alert" className="text-sm text-budget-danger">{error}</p>}<div className="flex flex-wrap justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="button-secondary">Cancel</button><button type="submit" disabled={saving} className="button-primary"><Save className="size-4" aria-hidden="true" />{saving ? 'Saving...' : 'Save category'}</button></div></form></Modal>
}

export function AdminCategories() {
  const categories = useResource(loadCategories)
  const mutate = useApiMutation()
  const [editor, setEditor] = useState<{ category: Category | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function deleteCategory() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setError('')
    try {
      await mutate<void>(`/categories/${deleteTarget.id}`, { method: 'DELETE' })
      setDeleteTarget(null)
      categories.reload()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-semibold">Categories</h1><button type="button" onClick={() => setEditor({ category: null })} className="button-primary"><Plus className="size-4" aria-hidden="true" />Add category</button></div>
      <ResourceStatus loading={categories.loading} error={categories.error} onRetry={categories.reload} />
      {!categories.loading && !categories.error && <div className="mt-6 overflow-x-auto border-y border-line bg-white">
        <table className="w-full text-left text-sm"><caption className="sr-only">Expense categories</caption><thead className="bg-canvas text-xs text-muted"><tr><th scope="col" className="px-4 py-3 font-medium">Name</th><th scope="col" className="px-4 py-3 font-medium">Default</th><th scope="col" className="px-4 py-3 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y divide-line">
          {categories.data?.map((category) => {
            const protectedCategory = category.name.toLowerCase() === 'uncategorized'
            return <tr key={category.id}><td className="max-w-64 break-words px-4 py-3 font-medium"><span className="flex items-start gap-2">{protectedCategory && <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted" aria-label="Protected category" />}<span className="min-w-0 break-words">{category.name}</span></span></td><td className="px-4 py-3">{category.isDefault ? <Check className="size-4 text-brand" aria-label="Default" /> : <span className="text-muted">No</span>}</td><td className="px-2 py-1"><div className="flex justify-end"><button type="button" disabled={protectedCategory} onClick={() => setEditor({ category })} className="icon-button" title={protectedCategory ? 'Protected category' : `Edit ${category.name}`} aria-label={`Edit ${category.name}`}><Pencil className="size-4" /></button><button type="button" disabled={protectedCategory} onClick={() => { setDeleteTarget(category); setError('') }} className="icon-button hover:text-budget-danger" title={protectedCategory ? 'Protected category' : `Delete ${category.name}`} aria-label={`Delete ${category.name}`}><Trash2 className="size-4" /></button></div></td></tr>
          })}
          {!categories.data?.length && <tr><td colSpan={3} className="px-4 py-10 text-center text-muted">No categories yet.</td></tr>}
        </tbody></table>
      </div>}
      {editor && <CategoryForm category={editor.category} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); categories.reload() }} />}
      {deleteTarget && <Modal title="Delete category?" busy={deleting} onClose={() => setDeleteTarget(null)}><p className="break-words text-sm font-medium">{deleteTarget.name}</p><p className="mt-2 text-sm text-muted">Expenses in this category will become Uncategorized.</p>{error && <p role="alert" className="mt-3 text-sm text-budget-danger">{error}</p>}<div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" className="button-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="button-primary bg-budget-danger hover:bg-red-700" disabled={deleting} onClick={() => void deleteCategory()}><Trash2 className="size-4" aria-hidden="true" />{deleting ? 'Deleting...' : 'Delete category'}</button></div></Modal>}
    </div>
  )
}