import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'

interface ConfettiProps {
  active: boolean
  duration?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  spin: number
  color: string
  life: number
}

const COLORS = ['#ffd23f', '#3ddc84', '#eef5ec', '#ff7a59', '#c58cff', '#6cc4ee']

export function Confetti({ active, duration = 4200 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!active || reducedMotion) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = window.innerWidth
    const height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.scale(dpr, dpr)

    const particles: Particle[] = Array.from({ length: 150 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 9
      return {
        x: width / 2 + (Math.random() - 0.5) * width * 0.25,
        y: height * 0.34 + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: 5 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 1,
      }
    })

    let frame = 0
    let start = performance.now()

    const render = (now: number) => {
      const elapsed = now - start
      context.clearRect(0, 0, width, height)

      for (const particle of particles) {
        particle.vy += 0.22
        particle.vx *= 0.995
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.spin
        particle.life = Math.max(0, 1 - elapsed / duration)

        context.save()
        context.globalAlpha = particle.life
        context.translate(particle.x, particle.y)
        context.rotate(particle.rotation)
        context.fillStyle = particle.color
        context.fillRect(-particle.size / 2, -particle.size / 3, particle.size, particle.size * 0.66)
        context.restore()
      }

      frame = window.requestAnimationFrame(render)
    }

    frame = window.requestAnimationFrame(render)
    start = performance.now()

    const timeout = window.setTimeout(() => {
      window.cancelAnimationFrame(frame)
      context.clearRect(0, 0, width, height)
    }, duration)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      context.clearRect(0, 0, width, height)
    }
  }, [active, duration, reducedMotion])

  if (!active) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50"
    />
  )
}
