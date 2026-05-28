/**
 * Storage abstraction backed by localStorage.
 * Drop-in replacement for the Capacitor Preferences adapter.
 */

/** Gets a stored JSON value by key. Returns null if absent or unparseable. */
export async function get<T>(key: string): Promise<T | null> {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Stores a JSON-serializable value by key. */
export async function set<T>(key: string, value: T): Promise<void> {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Removes a stored value by key. */
export async function remove(key: string): Promise<void> {
  localStorage.removeItem(key);
}
