import type { ReactNode } from 'react'
import { Home, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from './Brand'
import { StockChips } from './StockChips'

interface AppShellProps {
  children: ReactNode
  stock?: { hats: number; cups: number } | null
  mode?: 'game' | 'admin'
}

export function AppShell({ children, stock, mode = 'game' }: AppShellProps) {
  return (
    <div className="stadium">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="floodlight floodlight-left" />
        <div className="floodlight floodlight-right" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 pb-1 pt-4 sm:px-6 sm:pt-5">
        <Brand />
        <div className="flex items-center gap-2">
          {stock ? <StockChips hats={stock.hats} cups={stock.cups} /> : null}
          <Link
            to={mode === 'admin' ? '/' : '/admin'}
            className="icon-btn"
            aria-label={mode === 'admin' ? 'Volver al juego' : 'Abrir administración'}
            title={mode === 'admin' ? 'Volver al juego' : 'Administración'}
          >
            {mode === 'admin' ? <Home className="size-5" /> : <Settings className="size-5" />}
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 pb-4 pt-2 sm:px-6 sm:pb-6">
        {children}
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted/60 sm:px-6 sm:pb-4">
        Las Camisetas de Luifa · Charata, Chaco
      </footer>
    </div>
  )
}
