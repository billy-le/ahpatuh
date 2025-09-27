/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import 'solid-devtools';
import CalendarWidget, { type CalendarWidgetProps } from './CalendarWidget';
import { setupConvex, ConvexProvider } from 'convex-solidjs';

class AhpatuhBookingWidget {
  private _client: ReturnType<typeof setupConvex> | null;
  private _container: HTMLElement | null;
  private _config: CalendarWidgetProps | null;

  constructor() {
    this._client = null;
    this._container = null;
    this._config = null;
  }

  public async init(containerId: string, config: CalendarWidgetProps) {
    this._config = config;
    const container = this._container || document.getElementById(containerId);
    if (!container) throw new Error('Ahpatuh container not found');
    if (!this._container) {
      this._container = container;
    }
    this._container.innerHTML = '';
    // authenticate domain then render
    return this.renderNotConfigured();
  }

  public updateConfig(containerId: string, newConfig: CalendarWidgetProps) {
    return this.init(containerId, newConfig);
  }

  private initializeConvex() {
    this._client = setupConvex(import.meta.env.VITE_CONVEX_URL);
  }

  private render() {
    if (this._container == null) throw new Error('Ahpatuh container not found');
    if (this._config == null) throw new Error('Ahpatuh config not found');
    if (this._client == null) throw new Error('Ahpatuh convex not configured');
    return render(
      () => (
        <ConvexProvider client={this._client!}>
          <CalendarWidget {...this._config!} isLoaded={true} />
        </ConvexProvider>
      ),
      this._container,
    );
  }

  private renderNotConfigured() {
    return render(
      () => <CalendarWidget {...this._config!} isLoaded={false} />,
      this._container!,
    );
  }
}

declare global {
  interface Window {
    AhpatuhBookingWidget: AhpatuhBookingWidget;
  }
}

if (!window.AhpatuhBookingWidget) {
  const widget = new AhpatuhBookingWidget();
  window.AhpatuhBookingWidget = widget;
  // for local development
  if (import.meta.env.DEV) {
    widget.init('ahpatuh-widget', {
      primaryColor: 'blue',
      secondaryColor: 'white',
      isLoaded: true,
    });
  }
}
