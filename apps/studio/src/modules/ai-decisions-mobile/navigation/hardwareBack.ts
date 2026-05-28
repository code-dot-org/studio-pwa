/**
 * Hardware-back button handler stub for the web build.
 *
 * On native Capacitor, this would intercept the Android back button and
 * apply navigation rules (lesson → journey → seats). Web browsers handle
 * history natively, so this is a no-op in the ejected GH Pages build.
 */

import type {AnyRouter} from '@tanstack/react-router';

/** No-op on web. Returns cleanup function compatible with useEffect. */
export function registerHardwareBack(_router: AnyRouter): () => void {
  return () => undefined;
}
