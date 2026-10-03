import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Action,
  Progress,
  initialProgress,
  parseProgress,
  progressReducer,
} from './progress';
const KEY = '@chicken-highway/progress-v1';
type Store = {
  state: Progress;
  ready: boolean;
  error: string | null;
  dispatch: (action: Action) => void;
  retry: () => void;
};
const Context = createContext<Store | null>(null);
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialProgress);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(state);
  const queue = useRef(Promise.resolve());
  const hydrate = () => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        const saved = parseProgress(raw);
        ref.current = saved;
        setState(saved);
        setReady(true);
        setError(null);
      })
      .catch(() =>
        setError('Your progress could not be loaded. Please retry.'),
      );
  };
  useEffect(() => {
    hydrate();
  }, []);
  const save = (value: Progress) => {
    queue.current = queue.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(value)))
      .then(() => setError(null))
      .catch(() =>
        setError(
          'Progress could not be saved. Please retry before closing the app.',
        ),
      );
  };
  const dispatch = (action: Action) => {
    const next = progressReducer(ref.current, action);
    ref.current = next;
    setState(next);
    save(next);
  };
  return (
    <Context.Provider
      value={{
        state,
        ready,
        error,
        dispatch,
        retry: () => (ready ? save(ref.current) : hydrate()),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) {
    throw new Error('ProgressProvider missing');
  }
  return value;
}
