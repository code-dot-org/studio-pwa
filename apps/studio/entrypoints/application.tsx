/// <reference types="vite-plugin-pwa/client" />
import {RouterProvider} from '@tanstack/react-router';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import {initializeCore} from '@code-dot-org/core';
import {localizationPlugin} from '@code-dot-org/core/plugins/localization';
import {observabilityPlugin} from '@code-dot-org/core/plugins/observability';
import {injectFontAwesome} from '@code-dot-org/fonts';

import router from '@/modules/router';

const mount = document.getElementById('vite-root');

if (typeof window !== 'undefined') {
  initializeCore({plugins: [localizationPlugin, observabilityPlugin]});
  injectFontAwesome();
  registerServiceWorker();
}

if (mount) {
  const root = createRoot(mount);

  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  import('virtual:pwa-register')
    .then(({registerSW}) => {
      registerSW({immediate: true});
    })
    .catch((error: unknown) => {
      console.warn('PWA service worker registration failed', error);
    });
}
