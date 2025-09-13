import { render } from 'preact';
import { App } from './app.tsx';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { SessionProvider } from 'convex-helpers/react/sessions';
import './assets/globals.css';

const convexClient = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

render(
  <ConvexProvider client={convexClient}>
    <SessionProvider storageKey='mysess'>
      <App />
    </SessionProvider>
  </ConvexProvider>,
  document.getElementById('ahpatuh')!,
);
