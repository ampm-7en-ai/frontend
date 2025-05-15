
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Note: No need to manually add each environment variable here anymore
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
