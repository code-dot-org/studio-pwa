import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import path from 'node:path';
import fs from 'node:fs';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

const BASE = process.env.PUBLIC_BASE ?? '/studio-pwa/';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';

  return {
    base: BASE,
    build: {
      outDir: 'dist',
    },
    // Radium (used by oceans-lab) references `global` in its CSS vendor-prefix
    // plugin; shim it to globalThis so the browser context doesn't throw.
    define: {
      global: 'globalThis',
    },
    server: {
      allowedHosts: isDev ? ['localhost-studio.code.org'] : undefined,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },
    optimizeDeps: {
      // Exclude notebook-lab from esbuild pre-bundling; it's resolved from
      // source via the alias above and Vite handles it as part of the app.
      exclude: ['@code-dot-org/notebook-lab'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Resolve notebook-lab from source so Vite handles the PyodideWorker
        // URL pattern correctly. The pre-built dist uses an absolute URL for
        // the worker ("/assets/PyodideWorker-*.js") which Rollup cannot
        // resolve as a file during production builds.
        '@code-dot-org/notebook-lab': path.resolve(
          __dirname,
          '../../packages/labs/notebook/src/index.ts',
        ),
      },
    },
    plugins: [
      // Serve pyodide binaries from the notebook package's public dir during
      // dev so the notebook lab can load Pyodide without a separate static server.
      {
        name: 'pyodide-dev-static',
        apply: 'serve' as const,
        configureServer(server) {
          const pyodideDir = path.resolve(
            __dirname,
            '../../packages/labs/notebook/public/pyodide',
          );
          server.middlewares.use((req, res, next) => {
            const urlPath = (req.url ?? '').split('?')[0];
            const idx = urlPath.indexOf('/pyodide/');
            if (idx === -1) return next();
            const relPath = urlPath.slice(idx + '/pyodide'.length);
            const filePath = path.join(pyodideDir, relPath);
            fs.stat(filePath, (err, stat) => {
              if (err || !stat.isFile()) return next();
              const ext = path.extname(filePath);
              const contentType =
                ext === '.mjs' || ext === '.js'
                  ? 'application/javascript'
                  : ext === '.wasm'
                    ? 'application/wasm'
                    : ext === '.zip'
                      ? 'application/zip'
                      : ext === '.json'
                        ? 'application/json'
                        : 'application/octet-stream';
              res.setHeader('Content-Type', contentType);
              fs.createReadStream(filePath).pipe(res);
            });
          });
        },
      },
      // Serve notebook-lab's pre-built worker assets in dev (fallback path).
      {
        name: 'notebook-assets-dev-static',
        apply: 'serve' as const,
        configureServer(server) {
          const notebookAssetsDir = path.resolve(
            __dirname,
            '../../packages/labs/notebook/dist/assets',
          );
          server.middlewares.use((req, res, next) => {
            const urlPath = req.url?.split('?')[0] ?? '';
            const fileName = path.basename(urlPath);
            if (!fileName || !fileName.endsWith('.js')) return next();
            const filePath = path.join(notebookAssetsDir, fileName);
            fs.stat(filePath, (err, stat) => {
              if (err || !stat.isFile()) return next();
              res.setHeader('Content-Type', 'application/javascript');
              fs.createReadStream(filePath).pipe(res);
            });
          });
        },
      },
      // Transform .ipynb files (JSON) so Vite resolves them as ES module
      // default exports rather than failing with a syntax error.
      {
        name: 'ipynb-json',
        transform(src: string, id: string) {
          if (!id.endsWith('.ipynb')) return;
          return {code: `export default ${src}`, map: null};
        },
      },
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        injectRegister: false,
        workbox: {
          globPatterns: ['**/*.{css,html,svg,png,webp,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/assets\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
        },
        manifest: {
          name: 'Code.org',
          short_name: 'Code.org',
          description: 'Learn computer science and AI with Code.org.',
          start_url: `${BASE}app`,
          scope: `${BASE}app`,
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#00adbc',
          icons: [
            {
              src: `${BASE}app/icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `${BASE}app/icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: `${BASE}app/icons/icon-maskable-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {enabled: false},
      }),
    ],
  };
});
