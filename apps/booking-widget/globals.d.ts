import type { AhpatuhBookingWidget } from 'src/index';

declare global {
  interface Window {
    AhpatuhBookingWidget: AhpatuhBookingWidget;
  }
}
