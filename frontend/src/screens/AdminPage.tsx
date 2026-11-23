import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarDays,
  Check,
  Gift,
  LockKeyhole,
  LogOut,
  RotateCcw,
  Save,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react'
import { ApiError, api, getErrorMessage } from '../api/client'
import { useAdminSettings, useAdminStats } from '../api/hooks'
import type { AdminSettings, UpdateSettingsRequest } from '../api/types'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { ErrorBanner } from '../components/ErrorBanner'
import { LoadingState } from '../components/LoadingState'
import { Stepper } from '../components/Stepper'
import { CapIcon, CupIcon } from '../components/icons'

// El PIN vive solo en sessionStorage: se borra al cerrar la pestaña.
const STORAGE_KEY = 'luifa.admin.pin'

function readStoredPin(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storePin(pin: string | null) {
  try {
    if (pin) {
      sessionStorage.setItem(STORAGE_KEY, pin)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // sessionStorage puede no estar disponible; el PIN vive solo en memoria.
  }
}

function toForm(settings: AdminSettings): UpdateSettingsRequest {
  return {
    totalRounds: settings.totalRounds,
    requiredCorrect: settings.requiredCorrect,
    questionSeconds: settings.questionSeconds,
    stockHats: settings.stockHats,
    stockCups: settings.stockCups,
  }
}

const numberFormat = new Intl.NumberFormat('es-AR')
const dateFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

interface StatCardProps {
  label: string
  value: number | string
  detail: string
  icon: typeof Users
}

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted">{label}</p>
        <Icon className="size-4 text-led/80" aria-hidden="true" />
      </div>
      <p className="stat-value mt-2 text-chalk">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  )
}

export function AdminPage() {
  const queryClient = useQueryClient()
  const [pin, setPin] = useState<string | null>(readStoredPin)
  const [draftPin, setDraftPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [form, setForm] = useState<UpdateSettingsRequest | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const settingsQuery = useAdminSettings(pin)
  const statsQuery = useAdminStats(pin)

  const unauthorized =
    (settingsQuery.error instanceof ApiError && settingsQuery.error.status === 401) ||
    (statsQuery.error instanceof ApiError && statsQuery.error.status === 401)

  useEffect(() => {
    if (!unauthorized) {
      return
    }
    storePin(null)
    // oxlint-disable-next-line react/set-state-in-effect
    setPin(null)
    setPinError('PIN incorrecto. Probá de nuevo.')
    queryClient.removeQueries({ queryKey: ['admin'] })
  }, [unauthorized, queryClient])

  useEffect(() => {
    if (settingsQuery.data) {
      // oxlint-disable-next-line react/set-state-in-effect
      setForm(toForm(settingsQuery.data))
    }
  }, [settingsQuery.data])

  useEffect(() => {
    if (!justSaved) {
      return
    }
    const timeout = window.setTimeout(() => setJustSaved(false), 2600)
    return () => window.clearTimeout(timeout)
  }, [justSaved])

  const saveMutation = useMutation({
    mutationFn: (values: UpdateSettingsRequest) =>
      api.updateAdminSettings(pin as string, values),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'settings', pin], data)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'stats', pin] })
      void queryClient.invalidateQueries({ queryKey: ['config'] })
      setJustSaved(true)
    },
  })

  useEffect(() => {
    if (saveMutation.error instanceof ApiError && saveMutation.error.status === 401) {
      storePin(null)
      // oxlint-disable-next-line react/set-state-in-effect
      setPin(null)
      setPinError('La sesión expiró. Ingresá el PIN nuevamente.')
      queryClient.removeQueries({ queryKey: ['admin'] })
    }
  }, [saveMutation.error, queryClient])

  const submitPin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = draftPin.trim()
    if (!/^\d{4,12}$/.test(value)) {
      setPinError('Ingresá un PIN de 4 a 12 dígitos.')
      return
    }
    setPinError(null)
    storePin(value)
    setPin(value)
    setDraftPin('')
  }

  const logout = () => {
    storePin(null)
    setPin(null)
    setForm(null)
    setPinError(null)
    queryClient.removeQueries({ queryKey: ['admin'] })
  }

  const gate = !pin || unauthorized

  if (gate) {
    return (
      <AppShell mode="admin">
        <section className="screen flex w-full max-w-md flex-col items-center">
          <div className="panel w-full p-6 text-center sm:p-8">
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-led/30 bg-led/10 text-led">
              <LockKeyhole className="size-8" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-5">Acceso privado</p>
            <h1 className="mt-1 text-4xl">Administración</h1>
            <p className="lead mt-2 text-sm">
              Ingresá el PIN del local para editar reglas, stock y ver las estadísticas.
            </p>

            <form className="mt-6 flex flex-col gap-3" onSubmit={submitPin}>
              <label htmlFor="admin-pin" className="text-left text-xs font-bold uppercase tracking-[0.16em] text-muted">
                PIN de administrador
              </label>
              <input
                id="admin-pin"
                className="admin-input"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                autoFocus
                maxLength={12}
                value={draftPin}
                onChange={(event) => {
                  setDraftPin(event.target.value.replace(/\D/g, ''))
                  setPinError(null)
                }}
                placeholder="Ingresá el PIN"
                aria-invalid={Boolean(pinError)}
                aria-describedby={pinError ? 'pin-error' : undefined}
              />
              {pinError ? (
                <p id="pin-error" role="alert" className="text-sm text-bad">
                  {pinError}
                </p>
              ) : null}
              <Button type="submit" size="md" disabled={draftPin.length < 4}>
                Entrar
              </Button>
            </form>

            <p className="mt-5 text-xs text-muted">
              El PIN se guarda solo en esta pestaña mientras dure la sesión.
            </p>
          </div>
        </section>
      </AppShell>
    )
  }

  if (settingsQuery.isPending || statsQuery.isPending) {
    return (
      <AppShell mode="admin">
        <LoadingState label="Verificando PIN…" />
      </AppShell>
    )
  }

  if (settingsQuery.isError) {
    return (
      <AppShell mode="admin">
        <EmptyState
          title="No pudimos cargar la administración"
          message={getErrorMessage(settingsQuery.error)}
          onRetry={() => void settingsQuery.refetch()}
        />
      </AppShell>
    )
  }

  const settings = settingsQuery.data
  const stats = statsQuery.data
  const savedForm = toForm(settings)
  const dirty = form ? JSON.stringify(form) !== JSON.stringify(savedForm) : false
  const saving = saveMutation.isPending

  const updateForm = (patch: Partial<UpdateSettingsRequest>) => {
    setForm((current) => (current ? { ...current, ...patch } : current))
  }

  const updateTotalRounds = (totalRounds: number) => {
    setForm((current) =>
      current
        ? {
            ...current,
            totalRounds,
            requiredCorrect: Math.min(current.requiredCorrect, totalRounds),
          }
        : current,
    )
  }

  return (
    <AppShell
      mode="admin"
      stock={stats ? { hats: stats.stockHats, cups: stats.stockCups } : null}
    >
      <section className="screen flex w-full max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Panel del local</p>
            <h1 className="mt-1 text-[clamp(2.2rem,5vw,3.4rem)]">Administración</h1>
            <p className="mt-1 text-sm text-muted">
              Reglas, stock y estadísticas de la tablet. Los cambios se aplican a la próxima partida.
            </p>
          </div>
          <Button variant="ghost" size="md" onClick={logout} className="whitespace-nowrap">
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Partidas"
            value={stats ? numberFormat.format(stats.totalGames) : '—'}
            detail={stats ? `${numberFormat.format(stats.gamesToday)} hoy` : 'Sin datos'}
            icon={Users}
          />
          <StatCard
            label="Victorias"
            value={stats ? numberFormat.format(stats.totalWins) : '—'}
            detail={stats ? `${numberFormat.format(stats.winsToday)} hoy` : 'Sin datos'}
            icon={Trophy}
          />
          <StatCard
            label="Premios"
            value={stats ? numberFormat.format(stats.totalPrizes) : '—'}
            detail={stats ? `${numberFormat.format(stats.prizesToday)} hoy` : 'Sin datos'}
            icon={Gift}
          />
          <StatCard
            label="Stock"
            value={stats ? `${stats.stockHats} / ${stats.stockCups}` : '—'}
            detail="Gorras / vasos"
            icon={ShieldCheck}
          />
        </div>

        {statsQuery.isError ? (
          <ErrorBanner
            message={getErrorMessage(statsQuery.error)}
            onRetry={() => void statsQuery.refetch()}
          />
        ) : null}

        <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="panel p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl">Reglas y stock</h2>
                <p className="mt-1 text-xs text-muted">
                  Última actualización: {dateFormat.format(new Date(settings.updatedAt))}
                </p>
              </div>
              {justSaved ? (
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ok">
                  <Check className="size-4" aria-hidden="true" />
                  Guardado
                </span>
              ) : null}
            </div>

            {form ? (
              <form
                className="mt-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  saveMutation.mutate(form)
                }}
              >
                <Stepper
                  label="Rondas por partida"
                  hint="Cuántas preguntas responde cada jugador."
                  value={form.totalRounds}
                  min={1}
                  max={5}
                  onChange={updateTotalRounds}
                  disabled={saving}
                />
                <Stepper
                  label="Aciertos para ganar"
                  hint="No puede superar las rondas de la partida."
                  value={form.requiredCorrect}
                  min={1}
                  max={form.totalRounds}
                  onChange={(requiredCorrect) => updateForm({ requiredCorrect })}
                  disabled={saving}
                />
                <Stepper
                  label="Segundos por pregunta"
                  hint="Tiempo máximo para responder cada pregunta."
                  value={form.questionSeconds}
                  min={5}
                  max={60}
                  step={5}
                  suffix="s"
                  onChange={(questionSeconds) => updateForm({ questionSeconds })}
                  disabled={saving}
                />
                <Stepper
                  label="Stock de gorras"
                  hint="Se descuenta solo cuando sale una gorra."
                  value={form.stockHats}
                  min={0}
                  max={999}
                  onChange={(stockHats) => updateForm({ stockHats })}
                  disabled={saving}
                />
                <Stepper
                  label="Stock de vasos"
                  hint="Se descuenta solo cuando sale un vaso."
                  value={form.stockCups}
                  min={0}
                  max={999}
                  onChange={(stockCups) => updateForm({ stockCups })}
                  disabled={saving}
                />

                {saveMutation.error ? (
                  <ErrorBanner
                    message={getErrorMessage(saveMutation.error)}
                    onDismiss={() => saveMutation.reset()}
                    className="mt-4"
                  />
                ) : null}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setForm(savedForm)
                      saveMutation.reset()
                    }}
                    disabled={!dirty || saving}
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    Descartar
                  </Button>
                  <Button type="submit" loading={saving} disabled={!dirty}>
                    <Save className="size-4" aria-hidden="true" />
                    Guardar cambios
                  </Button>
                </div>
              </form>
            ) : (
              <LoadingState label="Cargando configuración…" />
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl">Categorías</h2>
                <CalendarDays className="size-5 text-led/80" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xs text-muted">Preguntas activas disponibles para la ruleta.</p>
              <ul className="mt-4 flex flex-col gap-2">
                {stats?.categories.map((category) => (
                  <li
                    key={category.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/6 bg-white/4 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-chalk">
                      <span
                        className="size-2.5 flex-none rounded-full"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{category.name}</span>
                    </span>
                    <span className="flex-none text-xs font-bold uppercase tracking-wide text-muted">
                      {category.questionCount} preguntas
                    </span>
                  </li>
                ))}
                {!stats ? <li className="text-sm text-muted">No disponible.</li> : null}
              </ul>
            </div>

            <div className="panel p-5 sm:p-6">
              <div className="flex items-center gap-2 text-led">
                <ShieldCheck className="size-5" aria-hidden="true" />
                <h2 className="text-2xl text-chalk">Cómo funciona</h2>
              </div>
              <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-muted">
                <li>El stock se descuenta únicamente al sortear un premio ganado.</li>
                <li>Las partidas y los premios quedan guardados en el servidor.</li>
                <li>El PIN protege esta pantalla; no se muestra a los jugadores.</li>
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="panel-soft flex items-center gap-2 px-3 py-2 text-sm font-semibold text-chalk">
                  <CapIcon className="size-4 text-led" />
                  {settings.stockHats} gorras
                </div>
                <div className="panel-soft flex items-center gap-2 px-3 py-2 text-sm font-semibold text-chalk">
                  <CupIcon className="size-4 text-led" />
                  {settings.stockCups} vasos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
