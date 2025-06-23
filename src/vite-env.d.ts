/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUMIT_API_KEY: string
  readonly VITE_SUMIT_API_URL: string
  readonly VITE_SUMIT_ORGANIZATION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 