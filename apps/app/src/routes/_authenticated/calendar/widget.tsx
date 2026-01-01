import { Layout } from '@/components/Layout';
import { Text } from '@/components/Text';
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

    if (!document.head.querySelector('#ahpatuh-widget-stylesheet')) {
      const link = document.createElement('link');
      link.id = 'ahpatuh-widget-stylesheet';
      link.href =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:8888/ahpatuh-widget.css'
          : '/embeds/ahpatuh-widget.css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      document.head.appendChild(link);
    }

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

      <div>
        <Text el='h3'>Embed Code</Text>

        <Text el='p' className='mb-4'>
          In the Document head:
        </Text>
        <pre>
          {`<link href="https://mycdn.com/embeds/ahpatuh-widget.css" rel="stylesheet" type="text/css" />`}
        </pre>

        <Text el='p' className='mt-10 mb-4'>
          In the body
        </Text>
        <pre>
          {`<div id="ahpatuh-widget"></div>
<script src="https://mycdn.com/embeds/ahpatuh-widget.js"></script>
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
