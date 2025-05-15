/// <reference types="vite/client" />

// Only keeping this for compatibility with Vite's built-in typing
interface ImportMetaEnv {
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
