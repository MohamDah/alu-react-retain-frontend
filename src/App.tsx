import { Wallet } from 'lucide-react'

function App() {
  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-5 md:px-6 lg:px-8">
          <Wallet className="size-6 shrink-0 text-brand" aria-hidden="true" />
          <span className="text-xl font-semibold text-ink">Retain</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      </main>
    </div>
  )
}

export default App
