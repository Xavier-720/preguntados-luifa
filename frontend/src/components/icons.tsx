import type { SVGProps } from 'react'

export function CapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4.4 13.2a7.6 7.6 0 0 1 15.2 0" />
      <path d="M3.2 13.2h17.6a1.2 1.2 0 0 1 0 2.4H3.2a1.2 1.2 0 0 1 0-2.4Z" />
      <path d="M12 5.6V3.2" />
      <path d="M10.6 3.2h2.8" />
      <path d="M6.5 17.2c1.5 1.6 3.3 2.4 5.5 2.4s4-.8 5.5-2.4" opacity=".45" />
    </svg>
  )
}

export function CupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6.4 3.5h11.2l-1.1 14.2a2.6 2.6 0 0 1-2.6 2.4H10.1a2.6 2.6 0 0 1-2.6-2.4L6.4 3.5Z" />
      <path d="M6.9 8.2h10.2" />
      <path d="M13.8 3.5 15.3 1" />
      <path d="M9.4 20.5h5.2" opacity=".45" />
    </svg>
  )
}
