/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@fontsource-variable/big-shoulders-display'
declare module '@fontsource/barlow/400.css'
declare module '@fontsource/barlow/500.css'
declare module '@fontsource/barlow/600.css'
declare module '@fontsource/barlow/700.css'
