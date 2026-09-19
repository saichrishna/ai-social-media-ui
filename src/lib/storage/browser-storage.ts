type Listener = () => void;

const listenersByKey = new Map<string, Set<Listener>>();

function emit(key: string) {
  const listeners = listenersByKey.get(key);
  if (!listeners) return;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeBrowserStorage(key: string, onStoreChange: Listener) {
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listeners = new Set();
    listenersByKey.set(key, listeners);
  }
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function readBrowserStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
}

export function writeBrowserStorage(key: string, value: string | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (value === null) {
    window.localStorage.removeItem(key);
  } else {
    window.localStorage.setItem(key, value);
  }
  emit(key);
}
