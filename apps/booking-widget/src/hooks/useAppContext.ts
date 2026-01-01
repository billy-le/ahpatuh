import { useContext } from 'solid-js';
import { AppContext } from 'src/App';

export function useAppContext() {
  const context = useContext(AppContext);
  return context;
}
