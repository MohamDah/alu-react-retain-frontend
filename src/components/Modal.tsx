import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])
  return (
    <dialog ref={ref} aria-labelledby={headingId} onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }} className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg border border-line bg-white p-5 text-ink shadow-xl backdrop:bg-black/40 md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id={headingId} className="text-lg font-semibold">{title}</h2>
        <button type="button" className="icon-button" onClick={onClose} disabled={busy} title="Close" aria-label="Close"><X className="size-5" /></button>
      </div>
      {children}
    </dialog>
  )
}