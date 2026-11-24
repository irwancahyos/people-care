// Replaced by the build script; defaults keep direct Angular CLI commands usable.
declare const __DEMO_USERNAME__: string;
declare const __DEMO_PASSWORD__: string;

export const DEMO_CREDENTIALS = {
  username: typeof __DEMO_USERNAME__ === 'undefined' ? 'admin' : __DEMO_USERNAME__,
  password: typeof __DEMO_PASSWORD__ === 'undefined' ? 'admin123' : __DEMO_PASSWORD__,
} as const;
