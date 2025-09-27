/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import 'solid-devtools';
import CalendarWidget, { type CalendarWidgetProps } from './CalendarWidget';

const AhpatuhBookingWidget = {
  init(containerId: string, config: CalendarWidgetProps) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error('bad');
    container.innerHTML = '';
    return render(() => CalendarWidget(config), container);
  },
  updateConfig(containerId: string, newConfig: CalendarWidgetProps) {
    return this.init(containerId, newConfig);
  },
};

export type AhpatuhBookingWidgetType = typeof AhpatuhBookingWidget;

declare global {
  interface Window {
    AhpatuhBookingWidget: AhpatuhBookingWidgetType;
  }
}

if (!window.AhpatuhBookingWidget) {
  window.AhpatuhBookingWidget = AhpatuhBookingWidget;
  // for local development
  if (import.meta.env.DEV) {
    AhpatuhBookingWidget.init('ahpatuh-widget', {
      primaryColor: 'blue',
      secondaryColor: 'white',
      accentColor: 'orange',
    });
  }
}
