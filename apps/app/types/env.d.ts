declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      CONVEX_DEPLOYMENT: string;
      VITE_CONVEX_URL: string;
      VITE_CONVEX_SITE_URL: string;
      VITE_BETTER_AUTH_URL: string;
      VITE_BASE_URL: string;
      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;
    }
  }
}

export {};
