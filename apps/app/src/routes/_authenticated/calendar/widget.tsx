import { Layout } from '@/components/Layout';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';

export const Route = createFileRoute('/_authenticated/calendar/widget')({
  component: RouteComponent,
});

export const useCalendarWidget = (config: {
  primaryColor: string;
  secondaryColor: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const containerId = 'ahpatuh-widget';

    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    const loadWidget = () => {
      if (window.AhpatuhBookingWidget && containerRef.current) {
        window.AhpatuhBookingWidget.init(containerRef.current.id, config);
        setIsLoaded(true);
      }
    };

    // Load script if not already loaded
    if (!document.querySelector('#calendar-widget-script')) {
      const script = document.createElement('script');
      script.id = 'calendar-widget-script';
      script.src =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8888/ahpatuh-widget.js'
          : '/embeds/calendar-widget.js';

      script.onload = loadWidget;
      document.head.appendChild(script);
    } else {
      loadWidget();
    }
  }, []);

  // Update config when it changes
  useEffect(() => {
    if (isLoaded && window.AhpatuhBookingWidget && containerRef.current) {
      window.AhpatuhBookingWidget.updateConfig(containerRef.current.id, config);
    }
  }, [config, isLoaded]);

  return {
    containerRef,
    isLoaded,
  };
};

const CalendarThemeConfig = () => {
  const [theme, setTheme] = useState({
    primaryColor: '#007bff',
    secondaryColor: '#ffffff',
  });

  const { containerRef, isLoaded } = useCalendarWidget({
    ...theme,
  });

  const handleThemeChange = (key: keyof typeof theme, value: string) => {
    setTheme((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      <div>
        <h3>Customize Calendar Theme</h3>
        <div>
          <label>Primary Color:</label>
          <input
            type='color'
            value={theme.primaryColor}
            onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
          />
        </div>
        <div>
          <label>Secondary Color:</label>
          <input
            type='color'
            value={theme.secondaryColor}
            onChange={(e) =>
              handleThemeChange('secondaryColor', e.target.value)
            }
          />
        </div>
      </div>

      <div>
        <h3>Preview</h3>
        <div
          ref={containerRef}
          className='min-h-[400px] border border-gray-400 rounded-md'
        >
          {isLoaded ? <p>Loading</p> : null}
        </div>
      </div>

      <div className='embed-code'>
        <h3>Embed Code</h3>
        <pre>
          {`<div id="booking-calendar"></div>
<script src="${window.location.origin}/embeds/calendar-widget.js"></script>
<script>
  BookingCalendar.init('booking-calendar', ${JSON.stringify(theme, null, 2)});
</script>`}
        </pre>
      </div>
    </div>
  );
};

function RouteComponent() {
  return (
    <Layout>
      <CalendarThemeConfig />
    </Layout>
  );
}
