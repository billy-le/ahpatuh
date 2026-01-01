import './index.css';
import { render as solidRender } from 'solid-js/web';
import 'solid-devtools';
import { type CalendarWidgetProps } from './CalendarWidget';
import { ConvexProvider } from 'convex-solidjs';
import { ConvexClient } from 'convex/browser';
import { App } from './App';

type AhpatuhBookingWidgetConfig = CalendarWidgetProps & {
  apiKey: string;
};

const _client: ConvexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL);
let _container: HTMLElement | null = null;
let _config: CalendarWidgetProps | null = null;
let _dispose: ReturnType<typeof render> | null = null;
let _authorized = false;

export async function init(
  containerId: string,
  config: AhpatuhBookingWidgetConfig,
) {
  _config = config;
  _container = document.getElementById(containerId);
  if (!_container) throw new Error('Ahpatuh container not found');

  if (_dispose) {
    _dispose();
    _dispose = null;
  }

  // make request once
  if (!_authorized) {
    await fetch(`${import.meta.env.VITE_CONVEX_SITE_URL}/api/widget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: config.apiKey,
      },
    })
      .then((res) => {
        _authorized = true;
        return res.json();
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  }

  // clear out any html before insertion
  _container.innerHTML = '';

  _dispose = _authorized ? render() : renderNotConfigured();
}

export function updateConfig(
  containerId: string,
  newConfig: AhpatuhBookingWidgetConfig,
) {
  init(containerId, newConfig);
}

function render() {
  if (_container == null) throw new Error('Ahpatuh container not found');
  if (_config == null) throw new Error('Ahpatuh config not found');
  return solidRender(
    () => (
      <ConvexProvider client={_client}>
        <App {..._config!} isLoaded={true} />
      </ConvexProvider>
    ),
    _container,
  );
}

function renderNotConfigured() {
  return solidRender(() => <App {..._config!} isLoaded={false} />, _container!);
}

export function destroy() {
  if (_dispose) {
    _dispose();
    _dispose = null;
  }
  if (_container) {
    _container.innerHTML = '';
    _container = null;
  }
}

if (import.meta.env.DEV) {
  // Use a small timeout or check document.readyState
  const start = () => {
    init('ahpatuh-widget', {
      apiKey: 'my_special_key',
      primaryColor: 'blue',
      secondaryColor: 'white',
      isLoaded: true,
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}
