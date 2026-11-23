import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link
      to="/"
      aria-label="Las Camisetas de Luifa, ir al inicio"
      className="group flex min-h-11 items-center gap-2.5 rounded-lg"
    >
      <img
        src="/logo-luifa.png"
        alt=""
        className="h-9 w-auto drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] sm:h-11"
        width={48}
        height={64}
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.65rem] font-black uppercase leading-none tracking-[0.04em] text-chalk sm:text-[2rem]">
          Luifa
        </span>
        <span className="text-[0.58rem] font-bold uppercase leading-none tracking-[0.32em] text-led sm:text-[0.65rem]">
          Camisetas
        </span>
      </span>
      <span className="sr-only">Las Camisetas de Luifa</span>
    </Link>
  )
}
