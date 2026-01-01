import { createContext } from 'solid-js';
import CalendarWidget from './CalendarWidget';
import { createStore } from 'solid-js/store';
import { Doc } from '@ahpatuh/convex/_generated/dataModel';

interface AppProps {
  isLoaded: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export const [store, setStore] = createStore<{
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  selectedEmployee: Doc<'employees'> | null;
  selectedServices: Doc<'services'>[];
  basket: {
    employee: Doc<'employees'>;
    service: Doc<'services'>;
    availability: Doc<'availabilitySlots'>;
  }[];
}>({
  selectedDate: null,
  selectedTimeSlot: null,
  selectedEmployee: null,
  selectedServices: [],
  basket: [],
});
export const AppContext = createContext({
  store,
  setStore,
});

export function App(props: AppProps) {
  return (
    <AppContext.Provider value={AppContext.defaultValue}>
      <CalendarWidget {...props} />
    </AppContext.Provider>
  );
}
