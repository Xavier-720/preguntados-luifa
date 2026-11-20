import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function NotFoundPage() {
  return (
    <AppShell>
      <section className="screen flex w-full max-w-lg flex-col items-center gap-4 text-center">
        <p className="eyebrow">Fuera de juego</p>
        <h1 className="text-[clamp(3rem,10vw,6rem)]">404</h1>
        <p className="lead">
          Esta página no existe. Volvé al estadio para girar la ruleta y jugar.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">
          Volver al inicio
        </Link>
      </section>
    </AppShell>
  )
}
