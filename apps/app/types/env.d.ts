declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      VITE_CONVEX_URL: string;
      VITE_CONVEX_SITE_URL: string;
      VITE_BASE_URL: string;
    }
  }
}

export {};
