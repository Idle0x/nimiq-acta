# Acta Codebase

*Note: All sensitive files, environment variables, dependencies, and binaries have been strictly excluded.* 

## `.gitignore`
```html
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Hackathon Admin Strategy Docs
.admin/

```

## `AGENTS.md`
```html
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

```

## `CLAUDE.md`
```html
@AGENTS.md

```

## `LICENSE`
```html
MIT License

Copyright (c) 2026 Acta Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## `README.md`
```html
# Acta — Money moves when reality changes

> A verifiable proof-of-action protocol for Nimiq Pay that locks NIM for peer-to-peer borrowing and real-world bounties.

## What It Does

Acta turns Nimiq Pay into a zero-trust neighborhood economy. Borrow a drill from your neighbor by locking NIM as collateral. When you return it, they scan a cryptographic QR code on your phone to instantly release your locked funds back to you. 

Beyond borrowing, Acta scales into community micro-work with **Bounties**. Creators can fund challenges that pay out automatically when solvers prove reality through our **Four Oracles**:
- **ScanQuest (QR):** Discover and scan a cryptographically signed QR token hidden in the physical world.
- **CheckIn (Geo):** Physically visit a GPS coordinate to unlock funds.
- **PhotoProof (Vision):** Snap a picture and let advanced AI (Qwen3.6 Vision) verify it.
- **CreatorVerified:** Perform custom labor and get a manual sign-off via QR scan (or through the Creator Inbox).

Every verified action builds your transparent on-chain **Trust Score v2**, which persistently reduces your future collateral requirements.

### Treasury Mechanics
A small network fee (e.g., 0.1 NIM) is levied on every successful action. These fees accumulate in the global **Treasury Vault**. Over time, the protocol distributes these collected funds to highly trusted participants, creating a cyclic token economy.

## How It Uses Nimiq

Acta is a native Nimiq Pay Mini App, leveraging the `window.nimiq` provider:
- `sendBasicTransaction()` — Locks collateral or funds bounties.
- `sign()` — Provides cryptographic proof for zero-trust state changes.

## Disclosed Limitations (Hackathon Build)

1. **GPS Spoofing:** Uses HTML5 geolocation. Production requires a hardened anti-spoofing SDK.
2. **AI Hallucinations:** Vision oracle could be tricked by screens. Production requires live-camera-only pipelines.
3. **Asset Volatility:** Uses native NIM. While we investigated Nimiq Pay's OASIS/Polygon bridge for USDT stablecoin collateral, the Mini-App SDK currently only supports native NIM transaction triggers.
4. **Hot-Wallet Escrow:** Escrow payouts are currently managed by a backend hot-wallet. This requires trusting the Acta backend to disburse funds correctly upon oracle verification, pending true HTLC/Smart Contract support on Nimiq for multi-sig programmatic release.

## Submission Checklist
- [x] MIT LICENSE file
- [x] .gitignore excludes secrets
- [x] Public GitHub repo
- [x] Live deployment URL (Vercel)
- [x] README.md with 250-word description
- [ ] Demo video

## License
MIT

```

## `eslint.config.mjs`
```html
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

```

## `next-env.d.ts`
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.

```

## `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@nimiq/core"],
};

export default nextConfig;

```

## `package.json`
```json
{
  "name": "acta",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@neondatabase/serverless": "^1.1.0",
    "@nimiq/core": "^2.21.0",
    "@nimiq/hub-api": "^1.15.0",
    "@nimiq/mini-app-sdk": "^0.1.0",
    "@noble/ed25519": "^3.2.0",
    "@noble/hashes": "^2.4.0",
    "@vercel/analytics": "^2.0.1",
    "date-fns": "^4.4.0",
    "fake-indexeddb": "^6.2.5",
    "html5-qrcode": "^2.3.8",
    "lucide-react": "^1.46.0",
    "next": "16.3.5",
    "openai": "^7.16.0",
    "qrcode.react": "^4.2.0",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "react-qr-code": "^2.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}

```

## `postcss.config.mjs`
```html
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

```

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}

```

## `tsconfig.tsbuildinfo`
```html
{"fileNames":["./node_modules/typescript/lib/lib.es5.d.ts","./node_modules/typescript/lib/lib.es2015.d.ts","./node_modules/typescript/lib/lib.es2016.d.ts","./node_modules/typescript/lib/lib.es2017.d.ts","./node_modules/typescript/lib/lib.es2018.d.ts","./node_modules/typescript/lib/lib.es2019.d.ts","./node_modules/typescript/lib/lib.es2020.d.ts","./node_modules/typescript/lib/lib.es2021.d.ts","./node_modules/typescript/lib/lib.es2022.d.ts","./node_modules/typescript/lib/lib.es2023.d.ts","./node_modules/typescript/lib/lib.es2024.d.ts","./node_modules/typescript/lib/lib.esnext.d.ts","./node_modules/typescript/lib/lib.dom.d.ts","./node_modules/typescript/lib/lib.dom.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.core.d.ts","./node_modules/typescript/lib/lib.es2015.collection.d.ts","./node_modules/typescript/lib/lib.es2015.generator.d.ts","./node_modules/typescript/lib/lib.es2015.iterable.d.ts","./node_modules/typescript/lib/lib.es2015.promise.d.ts","./node_modules/typescript/lib/lib.es2015.proxy.d.ts","./node_modules/typescript/lib/lib.es2015.reflect.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.d.ts","./node_modules/typescript/lib/lib.es2015.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2016.array.include.d.ts","./node_modules/typescript/lib/lib.es2016.intl.d.ts","./node_modules/typescript/lib/lib.es2017.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2017.date.d.ts","./node_modules/typescript/lib/lib.es2017.object.d.ts","./node_modules/typescript/lib/lib.es2017.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2017.string.d.ts","./node_modules/typescript/lib/lib.es2017.intl.d.ts","./node_modules/typescript/lib/lib.es2017.typedarrays.d.ts","./node_modules/typescript/lib/lib.es2018.asyncgenerator.d.ts","./node_modules/typescript/lib/lib.es2018.asynciterable.d.ts","./node_modules/typescript/lib/lib.es2018.intl.d.ts","./node_modules/typescript/lib/lib.es2018.promise.d.ts","./node_modules/typescript/lib/lib.es2018.regexp.d.ts","./node_modules/typescript/lib/lib.es2019.array.d.ts","./node_modules/typescript/lib/lib.es2019.object.d.ts","./node_modules/typescript/lib/lib.es2019.string.d.ts","./node_modules/typescript/lib/lib.es2019.symbol.d.ts","./node_modules/typescript/lib/lib.es2019.intl.d.ts","./node_modules/typescript/lib/lib.es2020.bigint.d.ts","./node_modules/typescript/lib/lib.es2020.date.d.ts","./node_modules/typescript/lib/lib.es2020.promise.d.ts","./node_modules/typescript/lib/lib.es2020.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2020.string.d.ts","./node_modules/typescript/lib/lib.es2020.symbol.wellknown.d.ts","./node_modules/typescript/lib/lib.es2020.intl.d.ts","./node_modules/typescript/lib/lib.es2020.number.d.ts","./node_modules/typescript/lib/lib.es2021.promise.d.ts","./node_modules/typescript/lib/lib.es2021.string.d.ts","./node_modules/typescript/lib/lib.es2021.weakref.d.ts","./node_modules/typescript/lib/lib.es2021.intl.d.ts","./node_modules/typescript/lib/lib.es2022.array.d.ts","./node_modules/typescript/lib/lib.es2022.error.d.ts","./node_modules/typescript/lib/lib.es2022.intl.d.ts","./node_modules/typescript/lib/lib.es2022.object.d.ts","./node_modules/typescript/lib/lib.es2022.string.d.ts","./node_modules/typescript/lib/lib.es2022.regexp.d.ts","./node_modules/typescript/lib/lib.es2023.array.d.ts","./node_modules/typescript/lib/lib.es2023.collection.d.ts","./node_modules/typescript/lib/lib.es2023.intl.d.ts","./node_modules/typescript/lib/lib.es2024.arraybuffer.d.ts","./node_modules/typescript/lib/lib.es2024.collection.d.ts","./node_modules/typescript/lib/lib.es2024.object.d.ts","./node_modules/typescript/lib/lib.es2024.promise.d.ts","./node_modules/typescript/lib/lib.es2024.regexp.d.ts","./node_modules/typescript/lib/lib.es2024.sharedmemory.d.ts","./node_modules/typescript/lib/lib.es2024.string.d.ts","./node_modules/typescript/lib/lib.esnext.array.d.ts","./node_modules/typescript/lib/lib.esnext.collection.d.ts","./node_modules/typescript/lib/lib.esnext.intl.d.ts","./node_modules/typescript/lib/lib.esnext.disposable.d.ts","./node_modules/typescript/lib/lib.esnext.promise.d.ts","./node_modules/typescript/lib/lib.esnext.decorators.d.ts","./node_modules/typescript/lib/lib.esnext.iterator.d.ts","./node_modules/typescript/lib/lib.esnext.float16.d.ts","./node_modules/typescript/lib/lib.esnext.error.d.ts","./node_modules/typescript/lib/lib.esnext.sharedmemory.d.ts","./node_modules/typescript/lib/lib.decorators.d.ts","./node_modules/typescript/lib/lib.decorators.legacy.d.ts","./node_modules/@types/react/global.d.ts","./node_modules/csstype/index.d.ts","./node_modules/@types/react/index.d.ts","./node_modules/next/dist/styled-jsx/types/css.d.ts","./node_modules/next/dist/styled-jsx/types/macro.d.ts","./node_modules/next/dist/styled-jsx/types/style.d.ts","./node_modules/next/dist/styled-jsx/types/global.d.ts","./node_modules/next/dist/styled-jsx/types/index.d.ts","./node_modules/next/dist/server/get-page-files.d.ts","./node_modules/@types/node/compatibility/disposable.d.ts","./node_modules/@types/node/compatibility/indexable.d.ts","./node_modules/@types/node/compatibility/iterators.d.ts","./node_modules/@types/node/compatibility/index.d.ts","./node_modules/@types/node/globals.typedarray.d.ts","./node_modules/@types/node/buffer.buffer.d.ts","./node_modules/@types/node/globals.d.ts","./node_modules/@types/node/web-globals/abortcontroller.d.ts","./node_modules/@types/node/web-globals/domexception.d.ts","./node_modules/@types/node/web-globals/events.d.ts","./node_modules/undici-types/header.d.ts","./node_modules/undici-types/readable.d.ts","./node_modules/undici-types/file.d.ts","./node_modules/undici-types/fetch.d.ts","./node_modules/undici-types/formdata.d.ts","./node_modules/undici-types/connector.d.ts","./node_modules/undici-types/client.d.ts","./node_modules/undici-types/errors.d.ts","./node_modules/undici-types/dispatcher.d.ts","./node_modules/undici-types/global-dispatcher.d.ts","./node_modules/undici-types/global-origin.d.ts","./node_modules/undici-types/pool-stats.d.ts","./node_modules/undici-types/pool.d.ts","./node_modules/undici-types/handlers.d.ts","./node_modules/undici-types/balanced-pool.d.ts","./node_modules/undici-types/agent.d.ts","./node_modules/undici-types/mock-interceptor.d.ts","./node_modules/undici-types/mock-agent.d.ts","./node_modules/undici-types/mock-client.d.ts","./node_modules/undici-types/mock-pool.d.ts","./node_modules/undici-types/mock-errors.d.ts","./node_modules/undici-types/proxy-agent.d.ts","./node_modules/undici-types/env-http-proxy-agent.d.ts","./node_modules/undici-types/retry-handler.d.ts","./node_modules/undici-types/retry-agent.d.ts","./node_modules/undici-types/api.d.ts","./node_modules/undici-types/interceptors.d.ts","./node_modules/undici-types/util.d.ts","./node_modules/undici-types/cookies.d.ts","./node_modules/undici-types/patch.d.ts","./node_modules/undici-types/websocket.d.ts","./node_modules/undici-types/eventsource.d.ts","./node_modules/undici-types/filereader.d.ts","./node_modules/undici-types/diagnostics-channel.d.ts","./node_modules/undici-types/content-type.d.ts","./node_modules/undici-types/cache.d.ts","./node_modules/undici-types/index.d.ts","./node_modules/@types/node/web-globals/fetch.d.ts","./node_modules/@types/node/assert.d.ts","./node_modules/@types/node/assert/strict.d.ts","./node_modules/@types/node/async_hooks.d.ts","./node_modules/@types/node/buffer.d.ts","./node_modules/@types/node/child_process.d.ts","./node_modules/@types/node/cluster.d.ts","./node_modules/@types/node/console.d.ts","./node_modules/@types/node/constants.d.ts","./node_modules/@types/node/crypto.d.ts","./node_modules/@types/node/dgram.d.ts","./node_modules/@types/node/diagnostics_channel.d.ts","./node_modules/@types/node/dns.d.ts","./node_modules/@types/node/dns/promises.d.ts","./node_modules/@types/node/domain.d.ts","./node_modules/@types/node/events.d.ts","./node_modules/@types/node/fs.d.ts","./node_modules/@types/node/fs/promises.d.ts","./node_modules/@types/node/http.d.ts","./node_modules/@types/node/http2.d.ts","./node_modules/@types/node/https.d.ts","./node_modules/@types/node/inspector.generated.d.ts","./node_modules/@types/node/module.d.ts","./node_modules/@types/node/net.d.ts","./node_modules/@types/node/os.d.ts","./node_modules/@types/node/path.d.ts","./node_modules/@types/node/perf_hooks.d.ts","./node_modules/@types/node/process.d.ts","./node_modules/@types/node/punycode.d.ts","./node_modules/@types/node/querystring.d.ts","./node_modules/@types/node/readline.d.ts","./node_modules/@types/node/readline/promises.d.ts","./node_modules/@types/node/repl.d.ts","./node_modules/@types/node/sea.d.ts","./node_modules/@types/node/stream.d.ts","./node_modules/@types/node/stream/promises.d.ts","./node_modules/@types/node/stream/consumers.d.ts","./node_modules/@types/node/stream/web.d.ts","./node_modules/@types/node/string_decoder.d.ts","./node_modules/@types/node/test.d.ts","./node_modules/@types/node/timers.d.ts","./node_modules/@types/node/timers/promises.d.ts","./node_modules/@types/node/tls.d.ts","./node_modules/@types/node/trace_events.d.ts","./node_modules/@types/node/tty.d.ts","./node_modules/@types/node/url.d.ts","./node_modules/@types/node/util.d.ts","./node_modules/@types/node/v8.d.ts","./node_modules/@types/node/vm.d.ts","./node_modules/@types/node/wasi.d.ts","./node_modules/@types/node/worker_threads.d.ts","./node_modules/@types/node/zlib.d.ts","./node_modules/@types/node/index.d.ts","./node_modules/@types/react/canary.d.ts","./node_modules/@types/react/experimental.d.ts","./node_modules/@types/react-dom/index.d.ts","./node_modules/@types/react-dom/client.d.ts","./node_modules/@types/react-dom/canary.d.ts","./node_modules/@types/react-dom/experimental.d.ts","./node_modules/next/dist/lib/fallback.d.ts","./node_modules/next/dist/server/api-utils/index.d.ts","./node_modules/next/dist/server/node-environment-baseline.d.ts","./node_modules/next/dist/server/node-environment-extensions/error-inspect.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-file.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-exit.d.ts","./node_modules/next/dist/server/node-environment-extensions/console-dim.external.d.ts","./node_modules/next/dist/server/node-environment-extensions/unhandled-rejection.external.d.ts","./node_modules/next/dist/server/node-environment-extensions/random.d.ts","./node_modules/next/dist/server/node-environment-extensions/date.d.ts","./node_modules/next/dist/server/node-environment-extensions/web-crypto.d.ts","./node_modules/next/dist/server/node-environment-extensions/node-crypto.d.ts","./node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.d.ts","./node_modules/next/dist/server/node-environment.d.ts","./node_modules/next/dist/server/require-hook.d.ts","./node_modules/next/dist/server/node-polyfill-crypto.d.ts","./node_modules/next/dist/compiled/webpack/webpack.d.ts","./node_modules/next/dist/shared/lib/modern-browserslist-target.d.ts","./node_modules/next/dist/shared/lib/entry-constants.d.ts","./node_modules/next/dist/shared/lib/constants.d.ts","./node_modules/next/dist/lib/bundler.d.ts","./node_modules/next/dist/server/config.d.ts","./node_modules/next/dist/lib/load-custom-routes.d.ts","./node_modules/next/dist/shared/lib/image-config.d.ts","./node_modules/next/dist/build/webpack/plugins/subresource-integrity-plugin.d.ts","./node_modules/next/dist/server/base-http/index.d.ts","./node_modules/next/dist/server/body-streams.d.ts","./node_modules/next/dist/server/request/search-params.d.ts","./node_modules/next/dist/server/app-render/vary-params.d.ts","./node_modules/next/dist/server/request/params.d.ts","./node_modules/next/dist/server/route-kind.d.ts","./node_modules/next/dist/server/route-definitions/route-definition.d.ts","./node_modules/next/dist/server/route-matches/route-match.d.ts","./node_modules/next/dist/client/components/app-router-headers.d.ts","./node_modules/next/dist/server/lib/cache-control.d.ts","./node_modules/next/dist/shared/lib/segment-cache/vary-params-decoding.d.ts","./node_modules/next/dist/shared/lib/app-router-types.d.ts","./node_modules/next/dist/server/lib/cache-handlers/types.d.ts","./node_modules/next/dist/server/use-cache/use-cache-wrapper.d.ts","./node_modules/next/dist/server/resume-data-cache/cache-store.d.ts","./node_modules/next/dist/server/resume-data-cache/resume-data-cache.d.ts","./node_modules/next/dist/lib/constants.d.ts","./node_modules/next/dist/server/render-result.d.ts","./node_modules/next/dist/server/response-cache/types.d.ts","./node_modules/next/dist/server/response-cache/index.d.ts","./node_modules/next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup.d.ts","./node_modules/next/dist/build/static-paths/types.d.ts","./node_modules/next/dist/server/route-definitions/app-page-route-definition.d.ts","./node_modules/next/dist/build/webpack/plugins/flight-manifest-plugin.d.ts","./node_modules/next/dist/build/adapter/setup-node-env.external.d.ts","./node_modules/next/dist/server/instrumentation/types.d.ts","./node_modules/next/dist/lib/setup-exception-listeners.d.ts","./node_modules/next/dist/lib/worker.d.ts","./node_modules/next/dist/server/lib/experimental/ppr.d.ts","./node_modules/next/dist/build/page-extensions-type.d.ts","./node_modules/next/dist/build/segment-config/app/app-segment-config.d.ts","./node_modules/next/dist/server/route-modules/app-page/module.compiled.d.ts","./node_modules/next/dist/server/route-definitions/app-route-route-definition.d.ts","./node_modules/next/dist/server/lib/i18n-provider.d.ts","./node_modules/next/dist/server/web/next-url.d.ts","./node_modules/next/dist/compiled/@edge-runtime/cookies/index.d.ts","./node_modules/next/dist/server/web/spec-extension/cookies.d.ts","./node_modules/next/dist/server/web/spec-extension/request.d.ts","./node_modules/next/dist/shared/lib/deep-readonly.d.ts","./node_modules/next/dist/server/lib/incremental-cache/index.d.ts","./node_modules/next/dist/shared/lib/router/utils/middleware-route-matcher.d.ts","./node_modules/next/dist/build/webpack/plugins/next-font-manifest-plugin.d.ts","./node_modules/next/dist/server/route-definitions/locale-route-definition.d.ts","./node_modules/next/dist/server/route-definitions/pages-route-definition.d.ts","./node_modules/next/dist/shared/lib/mitt.d.ts","./node_modules/next/dist/client/with-router.d.ts","./node_modules/next/dist/client/router.d.ts","./node_modules/next/dist/client/route-loader.d.ts","./node_modules/next/dist/client/page-loader.d.ts","./node_modules/next/dist/shared/lib/bloom-filter.d.ts","./node_modules/next/dist/shared/lib/router/router.d.ts","./node_modules/next/dist/shared/lib/router-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/loadable.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/image-config-context.shared-runtime.d.ts","./node_modules/next/dist/client/components/readonly-url-search-params.d.ts","./node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/head-manager-context.shared-runtime.d.ts","./node_modules/next/dist/client/flight-data-helpers.d.ts","./node_modules/next/dist/client/components/segment-cache/cache-key.d.ts","./node_modules/next/dist/client/components/router-reducer/fetch-server-response.d.ts","./node_modules/next/dist/client/components/segment-cache/types.d.ts","./node_modules/next/dist/client/components/segment-cache/vary-path.d.ts","./node_modules/next/dist/client/components/segment-cache/cache-map.d.ts","./node_modules/next/dist/client/components/segment-cache/navigation-testing-lock.d.ts","./node_modules/next/dist/shared/lib/segment-cache/segment-value-encoding.d.ts","./node_modules/next/dist/client/components/segment-cache/scheduler.d.ts","./node_modules/next/dist/client/components/segment-cache/cache.d.ts","./node_modules/next/dist/client/components/router-reducer/ppr-navigations.d.ts","./node_modules/next/dist/client/components/segment-cache/navigation.d.ts","./node_modules/next/dist/client/components/router-reducer/router-reducer-types.d.ts","./node_modules/next/dist/shared/lib/app-router-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/server-inserted-html.shared-runtime.d.ts","./node_modules/next/dist/server/route-modules/pages/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/server/route-modules/pages/module.compiled.d.ts","./node_modules/next/dist/build/templates/pages.d.ts","./node_modules/next/dist/server/route-modules/pages/module.d.ts","./node_modules/next/dist/server/render.d.ts","./node_modules/next/dist/build/webpack/plugins/pages-manifest-plugin.d.ts","./node_modules/next/dist/server/route-definitions/pages-api-route-definition.d.ts","./node_modules/next/dist/server/route-matches/pages-api-route-match.d.ts","./node_modules/next/dist/server/route-matchers/route-matcher.d.ts","./node_modules/next/dist/server/route-matcher-providers/route-matcher-provider.d.ts","./node_modules/next/dist/server/route-matcher-managers/route-matcher-manager.d.ts","./node_modules/next/dist/server/normalizers/normalizer.d.ts","./node_modules/next/dist/server/normalizers/locale-route-normalizer.d.ts","./node_modules/next/dist/server/normalizers/request/pathname-normalizer.d.ts","./node_modules/next/dist/server/normalizers/request/suffix.d.ts","./node_modules/next/dist/server/normalizers/request/rsc.d.ts","./node_modules/next/dist/server/normalizers/request/next-data.d.ts","./node_modules/next/dist/server/after/builtin-request-context.d.ts","./node_modules/next/dist/server/normalizers/request/segment-prefix-rsc.d.ts","./node_modules/next/dist/server/route-modules/pages/builtin/_error.d.ts","./node_modules/next/dist/server/load-default-error-components.d.ts","./node_modules/next/dist/server/base-server.d.ts","./node_modules/next/dist/server/after/after.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.d.ts","./node_modules/next/dist/server/async-storage/draft-mode-provider.d.ts","./node_modules/next/dist/server/web/spec-extension/adapters/headers.d.ts","./node_modules/next/dist/server/app-render/cache-signal.d.ts","./node_modules/next/dist/server/app-render/instant-validation/boundary-tracking.d.ts","./node_modules/next/dist/server/app-render/instant-validation/instant-validation-error.d.ts","./node_modules/next/dist/shared/lib/router/utils/parse-relative-url.d.ts","./node_modules/next/dist/server/app-render/instant-validation/instant-samples.d.ts","./node_modules/next/dist/server/app-render/dynamic-rendering.d.ts","./node_modules/next/dist/server/app-render/work-unit-async-storage-instance.d.ts","./node_modules/next/dist/server/lib/lazy-result.d.ts","./node_modules/next/dist/server/lib/implicit-tags.d.ts","./node_modules/next/dist/server/app-render/staged-rendering.d.ts","./node_modules/next/dist/server/app-render/work-unit-async-storage.external.d.ts","./node_modules/next/dist/server/after/after-context.d.ts","./node_modules/next/dist/server/app-render/work-async-storage-instance.d.ts","./node_modules/next/dist/server/app-render/create-error-handler.d.ts","./node_modules/next/dist/shared/lib/action-revalidation-kind.d.ts","./node_modules/next/dist/server/app-render/work-async-storage.external.d.ts","./node_modules/next/dist/server/async-storage/work-store.d.ts","./node_modules/next/dist/server/web/http.d.ts","./node_modules/next/dist/client/components/hooks-server-context.d.ts","./node_modules/next/dist/server/route-modules/app-route/shared-modules.d.ts","./node_modules/next/dist/client/components/redirect-status-code.d.ts","./node_modules/next/dist/client/components/redirect-error.d.ts","./node_modules/next/dist/build/templates/app-route.d.ts","./node_modules/next/dist/server/app-render/action-async-storage-instance.d.ts","./node_modules/next/dist/server/app-render/action-async-storage.external.d.ts","./node_modules/next/dist/server/route-modules/app-route/module.d.ts","./node_modules/next/dist/server/route-modules/app-route/module.compiled.d.ts","./node_modules/next/dist/build/segment-config/app/app-segments.d.ts","./node_modules/next/dist/build/get-supported-browsers.d.ts","./node_modules/next/dist/build/utils.d.ts","./node_modules/next/dist/build/rendering-mode.d.ts","./node_modules/next/dist/server/lib/router-utils/build-prefetch-segment-data-route.d.ts","./node_modules/next/dist/server/lib/cpu-profile.d.ts","./node_modules/next/dist/build/turborepo-access-trace/types.d.ts","./node_modules/next/dist/build/turborepo-access-trace/result.d.ts","./node_modules/next/dist/build/turborepo-access-trace/helpers.d.ts","./node_modules/next/dist/build/turborepo-access-trace/index.d.ts","./node_modules/next/dist/export/routes/types.d.ts","./node_modules/next/dist/export/types.d.ts","./node_modules/next/dist/export/worker.d.ts","./node_modules/next/dist/build/worker.d.ts","./node_modules/next/dist/build/index.d.ts","./node_modules/next/dist/lib/coalesced-function.d.ts","./node_modules/next/dist/server/lib/router-utils/types.d.ts","./node_modules/next/dist/trace/types.d.ts","./node_modules/next/dist/trace/trace.d.ts","./node_modules/next/dist/trace/shared.d.ts","./node_modules/next/dist/trace/index.d.ts","./node_modules/next/dist/build/load-jsconfig.d.ts","./node_modules/@next/env/dist/index.d.ts","./node_modules/next/dist/build/webpack/plugins/telemetry-plugin/use-cache-tracker-utils.d.ts","./node_modules/next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin.d.ts","./node_modules/next/dist/telemetry/storage.d.ts","./node_modules/next/dist/build/build-context.d.ts","./node_modules/next/dist/build/webpack-config.d.ts","./node_modules/next/dist/build/swc/generated-native.d.ts","./node_modules/next/dist/build/define-env.d.ts","./node_modules/next/dist/build/swc/index.d.ts","./node_modules/next/dist/build/swc/types.d.ts","./node_modules/next/dist/server/dev/parse-version-info.d.ts","./node_modules/next/dist/next-devtools/shared/types.d.ts","./node_modules/next/dist/server/dev/dev-indicator-server-state.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/cache-indicator.d.ts","./node_modules/next/dist/server/lib/parse-stack.d.ts","./node_modules/next/dist/next-devtools/server/shared.d.ts","./node_modules/next/dist/next-devtools/shared/stack-frame.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/utils/get-error-by-type.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/container/runtime-error/render-error.d.ts","./node_modules/next/dist/shared/lib/request-insights.d.ts","./node_modules/next/dist/next-devtools/shared/request-insights.d.ts","./node_modules/next/dist/next-devtools/dev-overlay/shared.d.ts","./node_modules/@types/react-dom/static.d.ts","./node_modules/@types/react-dom/server.d.ts","./node_modules/next/dist/server/app-render/app-render-prerender-utils.d.ts","./node_modules/next/dist/server/app-render/stream-ops.web.d.ts","./node_modules/next/dist/server/app-render/stream-ops.d.ts","./node_modules/next/dist/server/dev/debug-channel.d.ts","./node_modules/next/dist/server/dev/hot-reloader-types.d.ts","./node_modules/next/dist/server/lib/types.d.ts","./node_modules/next/dist/server/lib/lru-cache.d.ts","./node_modules/next/dist/server/lib/dev-bundler-service.d.ts","./node_modules/next/dist/server/base-http/node.d.ts","./node_modules/next/dist/server/lib/render-server.d.ts","./node_modules/next/dist/server/lib/router-server.d.ts","./node_modules/next/dist/shared/lib/router/utils/path-match.d.ts","./node_modules/next/dist/server/lib/router-utils/filesystem.d.ts","./node_modules/next/dist/server/lib/router-utils/setup-dev-bundler.d.ts","./node_modules/next/dist/server/lib/router-utils/router-server-context.d.ts","./node_modules/next/dist/server/route-modules/route-module.d.ts","./node_modules/next/dist/server/load-components.d.ts","./node_modules/next/dist/server/web/spec-extension/fetch-event.d.ts","./node_modules/next/dist/server/web/spec-extension/response.d.ts","./node_modules/next/dist/build/segment-config/middleware/middleware-config.d.ts","./node_modules/next/dist/server/web/types.d.ts","./node_modules/next/dist/server/web/adapter.d.ts","./node_modules/next/dist/server/app-render/types.d.ts","./node_modules/next/dist/build/webpack/loaders/metadata/types.d.ts","./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.d.ts","./node_modules/next/dist/server/lib/app-dir-module.d.ts","./node_modules/next/dist/server/app-render/debug-channel-server.web.d.ts","./node_modules/next/dist/server/app-render/debug-channel-server.node.d.ts","./node_modules/next/dist/server/app-render/debug-channel-server.d.ts","./node_modules/next/dist/server/app-render/instant-validation/instant-validation.d.ts","./node_modules/next/dist/server/app-render/dev-validation-worker-globals.d.ts","./node_modules/next/dist/server/app-render/app-render.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/contexts/entrypoints.d.ts","./node_modules/next/dist/client/components/error-boundary.d.ts","./node_modules/next/dist/client/components/layout-router.d.ts","./node_modules/next/dist/client/components/render-from-template-context.d.ts","./node_modules/next/dist/client/components/client-page.d.ts","./node_modules/next/dist/client/components/client-segment.d.ts","./node_modules/next/dist/client/components/http-access-fallback/error-boundary.d.ts","./node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts","./node_modules/next/dist/lib/metadata/types/extra-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-types.d.ts","./node_modules/next/dist/lib/metadata/types/manifest-types.d.ts","./node_modules/next/dist/lib/metadata/types/opengraph-types.d.ts","./node_modules/next/dist/lib/metadata/types/twitter-types.d.ts","./node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts","./node_modules/next/dist/lib/metadata/types/resolvers.d.ts","./node_modules/next/dist/lib/metadata/types/icons.d.ts","./node_modules/next/dist/lib/metadata/resolve-metadata.d.ts","./node_modules/next/dist/lib/metadata/metadata.d.ts","./node_modules/next/dist/lib/framework/boundary-components.d.ts","./node_modules/next/dist/server/app-render/rsc/preloads.d.ts","./node_modules/next/dist/server/app-render/postponed-state.d.ts","./node_modules/next/dist/server/app-render/rsc/postpone.d.ts","./node_modules/next/dist/server/app-render/rsc/taint.d.ts","./node_modules/next/dist/server/app-render/collect-segment-data.d.ts","./node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.d.ts","./node_modules/next/dist/server/app-render/entry-base.d.ts","./node_modules/next/dist/build/templates/app-page.d.ts","./node_modules/next/dist/server/route-modules/app-page/helpers/prerender-manifest-matcher.d.ts","./node_modules/@types/react/jsx-dev-runtime.d.ts","./node_modules/@types/react/jsx-runtime.d.ts","./node_modules/@types/react/compiler-runtime.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/rsc/entrypoints.d.ts","./node_modules/next/dist/server/route-modules/app-page/vendored/ssr/entrypoints.d.ts","./node_modules/next/dist/server/route-modules/app-page/module.d.ts","./node_modules/next/dist/server/request/fallback-params.d.ts","./node_modules/next/dist/server/web/spec-extension/image-response.d.ts","./node_modules/next/dist/server/web/spec-extension/user-agent.d.ts","./node_modules/next/dist/server/web/spec-extension/url-pattern.d.ts","./node_modules/next/dist/server/after/index.d.ts","./node_modules/next/dist/server/request/connection.d.ts","./node_modules/next/dist/server/web/exports/index.d.ts","./node_modules/next/dist/server/request-meta.d.ts","./node_modules/next/dist/cli/next-test.d.ts","./node_modules/next/dist/server/use-cache/cache-life-profile.d.ts","./node_modules/next/dist/server/use-cache/cache-life.d.ts","./node_modules/next/dist/shared/lib/size-limit.d.ts","./node_modules/next/dist/server/config-shared.d.ts","./node_modules/next/dist/lib/page-types.d.ts","./node_modules/next/dist/build/segment-config/pages/pages-segment-config.d.ts","./node_modules/next/dist/build/analysis/get-page-static-info.d.ts","./node_modules/next/dist/build/webpack/loaders/get-module-build-info.d.ts","./node_modules/next/dist/build/webpack/plugins/middleware-plugin.d.ts","./node_modules/next/dist/shared/lib/router/utils/parse-url.d.ts","./node_modules/next/dist/server/lib/async-callback-set.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-regex.d.ts","./node_modules/next/dist/shared/lib/router/utils/route-matcher.d.ts","./node_modules/@img/colour/index.d.ts","./node_modules/sharp/dist/index.d.mts","./node_modules/next/dist/server/image-optimizer.d.ts","./node_modules/next/dist/server/next-server.d.ts","./node_modules/next/dist/server/dev/static-paths-worker.d.ts","./node_modules/next/dist/server/dev/next-dev-server.d.ts","./node_modules/next/dist/server/next.d.ts","./node_modules/next/dist/build/adapter/build-complete.d.ts","./node_modules/next/dist/client/router-transition-types.d.ts","./node_modules/next/dist/types.d.ts","./node_modules/next/dist/shared/lib/html-context.shared-runtime.d.ts","./node_modules/next/dist/shared/lib/utils.d.ts","./node_modules/next/dist/pages/_app.d.ts","./node_modules/next/app.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-cache.d.ts","./node_modules/next/dist/server/web/spec-extension/revalidate.d.ts","./node_modules/next/dist/server/web/spec-extension/unstable-no-store.d.ts","./node_modules/next/dist/server/request/io.d.ts","./node_modules/next/dist/server/use-cache/cache-tag.d.ts","./node_modules/next/cache.d.ts","./node_modules/next/dist/pages/_document.d.ts","./node_modules/next/document.d.ts","./node_modules/next/dist/shared/lib/dynamic.d.ts","./node_modules/next/dynamic.d.ts","./node_modules/next/dist/pages/_error.d.ts","./node_modules/next/dist/client/components/catch-error.d.ts","./node_modules/next/dist/api/error.d.ts","./node_modules/next/error.d.ts","./node_modules/next/dist/shared/lib/head.d.ts","./node_modules/next/head.d.ts","./node_modules/next/dist/server/request/cookies.d.ts","./node_modules/next/dist/server/request/headers.d.ts","./node_modules/next/dist/server/request/draft-mode.d.ts","./node_modules/next/headers.d.ts","./node_modules/next/dist/shared/lib/get-img-props.d.ts","./node_modules/next/dist/api/image.d.ts","./node_modules/next/dist/client/image-component.d.ts","./node_modules/next/dist/shared/lib/image-external.d.ts","./node_modules/next/image.d.ts","./node_modules/next/dist/client/link.d.ts","./node_modules/next/link.d.ts","./node_modules/next/dist/client/components/unrecognized-action-error.d.ts","./node_modules/next/dist/client/components/redirect.d.ts","./node_modules/next/dist/client/components/not-found.d.ts","./node_modules/next/dist/client/components/forbidden.d.ts","./node_modules/next/dist/client/components/unauthorized.d.ts","./node_modules/next/dist/client/components/unstable-rethrow.d.ts","./node_modules/next/dist/client/components/navigation.react-server.d.ts","./node_modules/next/dist/client/components/navigation.d.ts","./node_modules/next/navigation.d.ts","./node_modules/next/router.d.ts","./node_modules/next/dist/client/script.d.ts","./node_modules/next/script.d.ts","./node_modules/next/dist/compiled/@edge-runtime/primitives/url.d.ts","./node_modules/next/dist/compiled/@vercel/og/satori/index.d.ts","./node_modules/next/dist/compiled/@vercel/og/types.d.ts","./node_modules/next/server.d.ts","./node_modules/next/types/global.d.ts","./node_modules/next/types/compiled.d.ts","./node_modules/next/types.d.ts","./node_modules/next/index.d.ts","./node_modules/next/image-types/global.d.ts","./.next/types/routes.d.ts","./.next/types/root-params.d.ts","./next-env.d.ts","./next.config.ts","./patch_bounty.ts","./lib/escrow.ts","./app/api/auth/challenge/route.ts","./lib/session.ts","./node_modules/@noble/ed25519/index.d.ts","./node_modules/@noble/hashes/utils.d.ts","./node_modules/@noble/hashes/_md.d.ts","./node_modules/@noble/hashes/sha2.d.ts","./node_modules/@neondatabase/serverless/index.d.mts","./lib/trust.ts","./lib/db.ts","./node_modules/@nimiq/core/types/wasm/bundler.d.ts","./node_modules/@nimiq/core/lib/index.d.ts","./node_modules/@nimiq/core/types/bundler.d.ts","./lib/backend-nimiq.ts","./lib/milestones.ts","./app/api/auth/verify/route.ts","./app/api/bounty/geo/route.ts","./app/api/bounty/manual_approve/route.ts","./lib/qr.ts","./app/api/bounty/scanquest/route.ts","./node_modules/openai/internal/builtin-types.d.mts","./node_modules/openai/internal/types.d.mts","./node_modules/openai/internal/headers.d.mts","./node_modules/openai/internal/shim-types.d.mts","./node_modules/openai/core/streaming.d.mts","./node_modules/openai/internal/request-options.d.mts","./node_modules/openai/internal/utils/log.d.mts","./node_modules/openai/internal/data-residency.d.mts","./node_modules/openai/resources/shared.d.mts","./node_modules/openai/core/error.d.mts","./node_modules/openai/pagination.d.mts","./node_modules/openai/internal/parse.d.mts","./node_modules/openai/core/api-promise.d.mts","./node_modules/openai/core/pagination.d.mts","./node_modules/openai/auth/types.d.mts","./node_modules/openai/internal/auth/x509-transport-registry.d.mts","./node_modules/openai/internal/uploads.d.mts","./node_modules/openai/internal/to-file.d.mts","./node_modules/openai/core/uploads.d.mts","./node_modules/openai/core/resource.d.mts","./node_modules/openai/resources/completions.d.mts","./node_modules/openai/resources/chat/completions/messages.d.mts","./node_modules/openai/resources/chat/completions/index.d.mts","./node_modules/openai/resources/chat/completions.d.mts","./node_modules/openai/error.d.mts","./node_modules/openai/lib/EventEmitter.d.mts","./node_modules/openai/lib/EventStream.d.mts","./node_modules/openai/lib/AbstractChatCompletionRunner.d.mts","./node_modules/openai/lib/ChatCompletionStream.d.mts","./node_modules/openai/lib/ResponsesParser.d.mts","./node_modules/openai/lib/responses/EventTypes.d.mts","./node_modules/openai/lib/responses/ResponseStream.d.mts","./node_modules/openai/resources/responses/input-items.d.mts","./node_modules/openai/resources/responses/input-tokens.d.mts","./node_modules/openai/resources/responses/responses.d.mts","./node_modules/openai/lib/parser.d.mts","./node_modules/openai/lib/ChatCompletionStreamingRunner.d.mts","./node_modules/openai/lib/jsonschema.d.mts","./node_modules/openai/lib/RunnableFunction.d.mts","./node_modules/openai/lib/ChatCompletionRunner.d.mts","./node_modules/openai/resources/chat/completions/completions.d.mts","./node_modules/openai/resources/chat/chat.d.mts","./node_modules/openai/resources/chat/index.d.mts","./node_modules/openai/resources/admin/organization/admin-api-keys.d.mts","./node_modules/openai/resources/admin/organization/audit-logs.d.mts","./node_modules/openai/resources/admin/organization/certificates.d.mts","./node_modules/openai/resources/admin/organization/data-retention.d.mts","./node_modules/openai/resources/admin/organization/invites.d.mts","./node_modules/openai/resources/admin/organization/roles.d.mts","./node_modules/openai/resources/admin/organization/spend-alerts.d.mts","./node_modules/openai/resources/admin/organization/spend-limit.d.mts","./node_modules/openai/resources/admin/organization/usage.d.mts","./node_modules/openai/resources/admin/organization/groups/roles.d.mts","./node_modules/openai/resources/admin/organization/groups/users.d.mts","./node_modules/openai/resources/admin/organization/groups/groups.d.mts","./node_modules/openai/resources/admin/organization/projects/api-keys.d.mts","./node_modules/openai/resources/admin/organization/projects/certificates.d.mts","./node_modules/openai/resources/admin/organization/projects/data-retention.d.mts","./node_modules/openai/resources/admin/organization/projects/hosted-tool-permissions.d.mts","./node_modules/openai/resources/admin/organization/projects/model-permissions.d.mts","./node_modules/openai/resources/admin/organization/projects/rate-limits.d.mts","./node_modules/openai/resources/admin/organization/projects/roles.d.mts","./node_modules/openai/resources/admin/organization/projects/spend-alerts.d.mts","./node_modules/openai/resources/admin/organization/projects/spend-limit.d.mts","./node_modules/openai/resources/admin/organization/projects/groups/roles.d.mts","./node_modules/openai/resources/admin/organization/projects/groups/groups.d.mts","./node_modules/openai/resources/admin/organization/projects/service-accounts/api-keys.d.mts","./node_modules/openai/resources/admin/organization/projects/service-accounts/service-accounts.d.mts","./node_modules/openai/resources/admin/organization/users/roles.d.mts","./node_modules/openai/resources/admin/organization/users/users.d.mts","./node_modules/openai/resources/admin/organization/projects/users/roles.d.mts","./node_modules/openai/resources/admin/organization/projects/users/users.d.mts","./node_modules/openai/resources/admin/organization/projects/projects.d.mts","./node_modules/openai/resources/admin/organization/organization.d.mts","./node_modules/openai/resources/admin/admin.d.mts","./node_modules/openai/resources/audio/speech.d.mts","./node_modules/openai/resources/audio/transcriptions.d.mts","./node_modules/openai/resources/audio/translations.d.mts","./node_modules/openai/resources/audio/audio.d.mts","./node_modules/openai/resources/batches.d.mts","./node_modules/openai/resources/beta/threads/messages.d.mts","./node_modules/openai/resources/beta/threads/runs/steps.d.mts","./node_modules/openai/lib/AssistantStream.d.mts","./node_modules/openai/resources/beta/threads/runs/runs.d.mts","./node_modules/openai/resources/beta/threads/threads.d.mts","./node_modules/openai/resources/beta/assistants.d.mts","./node_modules/openai/resources/beta/realtime/sessions.d.mts","./node_modules/openai/resources/beta/realtime/transcription-sessions.d.mts","./node_modules/openai/resources/beta/realtime/realtime.d.mts","./node_modules/openai/resources/beta/agents/sessions/turns.d.mts","./node_modules/openai/resources/beta/agents/environments/files.d.mts","./node_modules/openai/resources/beta/agents/environments/templates.d.mts","./node_modules/openai/resources/beta/agents/environments/environments.d.mts","./node_modules/openai/lib/agents/agent-session-stream.d.mts","./node_modules/openai/resources/beta/agents/sessions/artifacts.d.mts","./node_modules/openai/resources/beta/agents/sessions/events.d.mts","./node_modules/openai/resources/beta/agents/sessions/items.d.mts","./node_modules/openai/resources/beta/agents/sessions/subagents/items.d.mts","./node_modules/openai/resources/beta/agents/sessions/subagents/turns/items.d.mts","./node_modules/openai/resources/beta/agents/sessions/subagents/turns/turns.d.mts","./node_modules/openai/resources/beta/agents/sessions/subagents/subagents.d.mts","./node_modules/openai/resources/beta/agents/sessions/sessions.d.mts","./node_modules/openai/resources/beta/agents/vaults/credentials.d.mts","./node_modules/openai/resources/beta/agents/vaults/vaults.d.mts","./node_modules/openai/resources/beta/agents/agents.d.mts","./node_modules/openai/resources/beta/chatkit/threads.d.mts","./node_modules/openai/resources/beta/chatkit/sessions.d.mts","./node_modules/openai/resources/beta/chatkit/chatkit.d.mts","./node_modules/openai/resources/beta/responses/input-items.d.mts","./node_modules/openai/resources/beta/responses/input-tokens.d.mts","./node_modules/openai/resources/beta/responses/responses.d.mts","./node_modules/openai/resources/beta/beta.d.mts","./node_modules/openai/resources/containers/files/content.d.mts","./node_modules/openai/resources/containers/files/files.d.mts","./node_modules/openai/resources/containers/containers.d.mts","./node_modules/openai/resources/content-provenance-checks.d.mts","./node_modules/openai/resources/conversations/items.d.mts","./node_modules/openai/resources/conversations/conversations.d.mts","./node_modules/openai/resources/embeddings.d.mts","./node_modules/openai/resources/graders/grader-models.d.mts","./node_modules/openai/resources/evals/runs/output-items.d.mts","./node_modules/openai/resources/evals/runs/runs.d.mts","./node_modules/openai/resources/evals/evals.d.mts","./node_modules/openai/resources/files.d.mts","./node_modules/openai/resources/fine-tuning/methods.d.mts","./node_modules/openai/resources/fine-tuning/alpha/graders.d.mts","./node_modules/openai/resources/fine-tuning/alpha/alpha.d.mts","./node_modules/openai/resources/fine-tuning/checkpoints/permissions.d.mts","./node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.d.mts","./node_modules/openai/resources/fine-tuning/jobs/checkpoints.d.mts","./node_modules/openai/resources/fine-tuning/jobs/jobs.d.mts","./node_modules/openai/resources/fine-tuning/fine-tuning.d.mts","./node_modules/openai/resources/graders/graders.d.mts","./node_modules/openai/resources/images.d.mts","./node_modules/openai/resources/live/sessions.d.mts","./node_modules/openai/resources/live/forks/forks.d.mts","./node_modules/openai/resources/live/sideband/sideband.d.mts","./node_modules/openai/resources/live/live.d.mts","./node_modules/openai/resources/models.d.mts","./node_modules/openai/resources/moderations.d.mts","./node_modules/openai/resources/realtime/calls.d.mts","./node_modules/openai/resources/realtime/client-secrets.d.mts","./node_modules/openai/resources/realtime/realtime.d.mts","./node_modules/openai/resources/safety/alerts.d.mts","./node_modules/openai/resources/safety/safety.d.mts","./node_modules/openai/resources/skills/content.d.mts","./node_modules/openai/resources/skills/versions/content.d.mts","./node_modules/openai/resources/skills/versions/versions.d.mts","./node_modules/openai/resources/skills/skills.d.mts","./node_modules/openai/resources/uploads/parts.d.mts","./node_modules/openai/resources/uploads/uploads.d.mts","./node_modules/openai/uploads.d.mts","./node_modules/openai/resources/vector-stores/files.d.mts","./node_modules/openai/resources/vector-stores/file-batches.d.mts","./node_modules/openai/resources/vector-stores/vector-stores.d.mts","./node_modules/openai/resources/videos.d.mts","./node_modules/openai/resources/webhooks/webhooks.d.mts","./node_modules/openai/resources/webhooks/index.d.mts","./node_modules/openai/resources/webhooks.d.mts","./node_modules/openai/resources/index.d.mts","./node_modules/openai/internal/provider.d.mts","./node_modules/openai/client.d.mts","./node_modules/openai/azure.d.mts","./node_modules/openai/internal/bedrock.d.mts","./node_modules/openai/bedrock.d.mts","./node_modules/openai/index.d.mts","./lib/vision.ts","./app/api/bounty/verify/route.ts","./app/api/cancel/route.ts","./lib/price.ts","./app/api/dashboard/route.ts","./app/api/escrows/route.ts","./app/api/keys/route.ts","./app/api/passport/route.ts","./app/api/qr/generate/route.ts","./node_modules/@nimiq/mini-app-sdk/dist/provider.d.ts","./node_modules/@nimiq/mini-app-sdk/dist/index.d.ts","./lib/nimiq.ts","./scripts/init-db.ts","./scripts/migrate-v2.ts","./node_modules/next/dist/compiled/@next/font/dist/types.d.ts","./node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts","./node_modules/next/font/google/index.d.ts","./node_modules/lucide-react/dist/lucide-react.d.ts","./components/icons.tsx","./components/Toast.tsx","./node_modules/@vercel/analytics/dist/next/index.d.mts","./app/layout.tsx","./components/BottomTabs.tsx","./components/BorrowWizard.tsx","./components/BountyVerify.tsx","./node_modules/date-fns/constants.d.ts","./node_modules/date-fns/locale/types.d.ts","./node_modules/date-fns/fp/types.d.ts","./node_modules/date-fns/types.d.ts","./node_modules/date-fns/add.d.ts","./node_modules/date-fns/addBusinessDays.d.ts","./node_modules/date-fns/addDays.d.ts","./node_modules/date-fns/addHours.d.ts","./node_modules/date-fns/addISOWeekYears.d.ts","./node_modules/date-fns/addMilliseconds.d.ts","./node_modules/date-fns/addMinutes.d.ts","./node_modules/date-fns/addMonths.d.ts","./node_modules/date-fns/addQuarters.d.ts","./node_modules/date-fns/addSeconds.d.ts","./node_modules/date-fns/addWeeks.d.ts","./node_modules/date-fns/addYears.d.ts","./node_modules/date-fns/areIntervalsOverlapping.d.ts","./node_modules/date-fns/clamp.d.ts","./node_modules/date-fns/closestIndexTo.d.ts","./node_modules/date-fns/closestTo.d.ts","./node_modules/date-fns/compareAsc.d.ts","./node_modules/date-fns/compareDesc.d.ts","./node_modules/date-fns/constructFrom.d.ts","./node_modules/date-fns/constructNow.d.ts","./node_modules/date-fns/daysToWeeks.d.ts","./node_modules/date-fns/differenceInBusinessDays.d.ts","./node_modules/date-fns/differenceInCalendarDays.d.ts","./node_modules/date-fns/differenceInCalendarISOWeekYears.d.ts","./node_modules/date-fns/differenceInCalendarISOWeeks.d.ts","./node_modules/date-fns/differenceInCalendarMonths.d.ts","./node_modules/date-fns/differenceInCalendarQuarters.d.ts","./node_modules/date-fns/differenceInCalendarWeeks.d.ts","./node_modules/date-fns/differenceInCalendarYears.d.ts","./node_modules/date-fns/differenceInDays.d.ts","./node_modules/date-fns/differenceInHours.d.ts","./node_modules/date-fns/differenceInISOWeekYears.d.ts","./node_modules/date-fns/differenceInMilliseconds.d.ts","./node_modules/date-fns/differenceInMinutes.d.ts","./node_modules/date-fns/differenceInMonths.d.ts","./node_modules/date-fns/differenceInQuarters.d.ts","./node_modules/date-fns/differenceInSeconds.d.ts","./node_modules/date-fns/differenceInWeeks.d.ts","./node_modules/date-fns/differenceInYears.d.ts","./node_modules/date-fns/eachDayOfInterval.d.ts","./node_modules/date-fns/eachHourOfInterval.d.ts","./node_modules/date-fns/eachMinuteOfInterval.d.ts","./node_modules/date-fns/eachMonthOfInterval.d.ts","./node_modules/date-fns/eachQuarterOfInterval.d.ts","./node_modules/date-fns/eachWeekOfInterval.d.ts","./node_modules/date-fns/eachWeekendOfInterval.d.ts","./node_modules/date-fns/eachWeekendOfMonth.d.ts","./node_modules/date-fns/eachWeekendOfYear.d.ts","./node_modules/date-fns/eachYearOfInterval.d.ts","./node_modules/date-fns/endOfDay.d.ts","./node_modules/date-fns/endOfDecade.d.ts","./node_modules/date-fns/endOfHour.d.ts","./node_modules/date-fns/endOfISOWeek.d.ts","./node_modules/date-fns/endOfISOWeekYear.d.ts","./node_modules/date-fns/endOfMinute.d.ts","./node_modules/date-fns/endOfMonth.d.ts","./node_modules/date-fns/endOfQuarter.d.ts","./node_modules/date-fns/endOfSecond.d.ts","./node_modules/date-fns/endOfToday.d.ts","./node_modules/date-fns/endOfTomorrow.d.ts","./node_modules/date-fns/endOfWeek.d.ts","./node_modules/date-fns/endOfYear.d.ts","./node_modules/date-fns/endOfYesterday.d.ts","./node_modules/date-fns/_lib/format/formatters.d.ts","./node_modules/date-fns/_lib/format/longFormatters.d.ts","./node_modules/date-fns/format.d.ts","./node_modules/date-fns/formatDistance.d.ts","./node_modules/date-fns/formatDistanceStrict.d.ts","./node_modules/date-fns/formatDistanceToNow.d.ts","./node_modules/date-fns/formatDistanceToNowStrict.d.ts","./node_modules/date-fns/formatDuration.d.ts","./node_modules/date-fns/formatISO.d.ts","./node_modules/date-fns/formatISO9075.d.ts","./node_modules/date-fns/formatISODuration.d.ts","./node_modules/date-fns/formatRFC3339.d.ts","./node_modules/date-fns/formatRFC7231.d.ts","./node_modules/date-fns/formatRelative.d.ts","./node_modules/date-fns/fromUnixTime.d.ts","./node_modules/date-fns/getDate.d.ts","./node_modules/date-fns/getDay.d.ts","./node_modules/date-fns/getDayOfYear.d.ts","./node_modules/date-fns/getDaysInMonth.d.ts","./node_modules/date-fns/getDaysInYear.d.ts","./node_modules/date-fns/getDecade.d.ts","./node_modules/date-fns/_lib/defaultOptions.d.ts","./node_modules/date-fns/getDefaultOptions.d.ts","./node_modules/date-fns/getHours.d.ts","./node_modules/date-fns/getISODay.d.ts","./node_modules/date-fns/getISOWeek.d.ts","./node_modules/date-fns/getISOWeekYear.d.ts","./node_modules/date-fns/getISOWeeksInYear.d.ts","./node_modules/date-fns/getMilliseconds.d.ts","./node_modules/date-fns/getMinutes.d.ts","./node_modules/date-fns/getMonth.d.ts","./node_modules/date-fns/getOverlappingDaysInIntervals.d.ts","./node_modules/date-fns/getQuarter.d.ts","./node_modules/date-fns/getSeconds.d.ts","./node_modules/date-fns/getTime.d.ts","./node_modules/date-fns/getUnixTime.d.ts","./node_modules/date-fns/getWeek.d.ts","./node_modules/date-fns/getWeekOfMonth.d.ts","./node_modules/date-fns/getWeekYear.d.ts","./node_modules/date-fns/getWeeksInMonth.d.ts","./node_modules/date-fns/getYear.d.ts","./node_modules/date-fns/hoursToMilliseconds.d.ts","./node_modules/date-fns/hoursToMinutes.d.ts","./node_modules/date-fns/hoursToSeconds.d.ts","./node_modules/date-fns/interval.d.ts","./node_modules/date-fns/intervalToDuration.d.ts","./node_modules/date-fns/intlFormat.d.ts","./node_modules/date-fns/intlFormatDistance.d.ts","./node_modules/date-fns/isAfter.d.ts","./node_modules/date-fns/isBefore.d.ts","./node_modules/date-fns/isDate.d.ts","./node_modules/date-fns/isEqual.d.ts","./node_modules/date-fns/isExists.d.ts","./node_modules/date-fns/isFirstDayOfMonth.d.ts","./node_modules/date-fns/isFriday.d.ts","./node_modules/date-fns/isFuture.d.ts","./node_modules/date-fns/isLastDayOfMonth.d.ts","./node_modules/date-fns/isLeapYear.d.ts","./node_modules/date-fns/isMatch.d.ts","./node_modules/date-fns/isMonday.d.ts","./node_modules/date-fns/isPast.d.ts","./node_modules/date-fns/isSameDay.d.ts","./node_modules/date-fns/isSameHour.d.ts","./node_modules/date-fns/isSameISOWeek.d.ts","./node_modules/date-fns/isSameISOWeekYear.d.ts","./node_modules/date-fns/isSameMinute.d.ts","./node_modules/date-fns/isSameMonth.d.ts","./node_modules/date-fns/isSameQuarter.d.ts","./node_modules/date-fns/isSameSecond.d.ts","./node_modules/date-fns/isSameWeek.d.ts","./node_modules/date-fns/isSameYear.d.ts","./node_modules/date-fns/isSaturday.d.ts","./node_modules/date-fns/isSunday.d.ts","./node_modules/date-fns/isThisHour.d.ts","./node_modules/date-fns/isThisISOWeek.d.ts","./node_modules/date-fns/isThisMinute.d.ts","./node_modules/date-fns/isThisMonth.d.ts","./node_modules/date-fns/isThisQuarter.d.ts","./node_modules/date-fns/isThisSecond.d.ts","./node_modules/date-fns/isThisWeek.d.ts","./node_modules/date-fns/isThisYear.d.ts","./node_modules/date-fns/isThursday.d.ts","./node_modules/date-fns/isToday.d.ts","./node_modules/date-fns/isTomorrow.d.ts","./node_modules/date-fns/isTuesday.d.ts","./node_modules/date-fns/isValid.d.ts","./node_modules/date-fns/isWednesday.d.ts","./node_modules/date-fns/isWeekend.d.ts","./node_modules/date-fns/isWithinInterval.d.ts","./node_modules/date-fns/isYesterday.d.ts","./node_modules/date-fns/lastDayOfDecade.d.ts","./node_modules/date-fns/lastDayOfISOWeek.d.ts","./node_modules/date-fns/lastDayOfISOWeekYear.d.ts","./node_modules/date-fns/lastDayOfMonth.d.ts","./node_modules/date-fns/lastDayOfQuarter.d.ts","./node_modules/date-fns/lastDayOfWeek.d.ts","./node_modules/date-fns/lastDayOfYear.d.ts","./node_modules/date-fns/_lib/format/lightFormatters.d.ts","./node_modules/date-fns/lightFormat.d.ts","./node_modules/date-fns/max.d.ts","./node_modules/date-fns/milliseconds.d.ts","./node_modules/date-fns/millisecondsToHours.d.ts","./node_modules/date-fns/millisecondsToMinutes.d.ts","./node_modules/date-fns/millisecondsToSeconds.d.ts","./node_modules/date-fns/min.d.ts","./node_modules/date-fns/minutesToHours.d.ts","./node_modules/date-fns/minutesToMilliseconds.d.ts","./node_modules/date-fns/minutesToSeconds.d.ts","./node_modules/date-fns/monthsToQuarters.d.ts","./node_modules/date-fns/monthsToYears.d.ts","./node_modules/date-fns/nextDay.d.ts","./node_modules/date-fns/nextFriday.d.ts","./node_modules/date-fns/nextMonday.d.ts","./node_modules/date-fns/nextSaturday.d.ts","./node_modules/date-fns/nextSunday.d.ts","./node_modules/date-fns/nextThursday.d.ts","./node_modules/date-fns/nextTuesday.d.ts","./node_modules/date-fns/nextWednesday.d.ts","./node_modules/date-fns/parse/_lib/types.d.ts","./node_modules/date-fns/parse/_lib/Setter.d.ts","./node_modules/date-fns/parse/_lib/Parser.d.ts","./node_modules/date-fns/parse/_lib/parsers.d.ts","./node_modules/date-fns/parse.d.ts","./node_modules/date-fns/parseISO.d.ts","./node_modules/date-fns/parseJSON.d.ts","./node_modules/date-fns/previousDay.d.ts","./node_modules/date-fns/previousFriday.d.ts","./node_modules/date-fns/previousMonday.d.ts","./node_modules/date-fns/previousSaturday.d.ts","./node_modules/date-fns/previousSunday.d.ts","./node_modules/date-fns/previousThursday.d.ts","./node_modules/date-fns/previousTuesday.d.ts","./node_modules/date-fns/previousWednesday.d.ts","./node_modules/date-fns/quartersToMonths.d.ts","./node_modules/date-fns/quartersToYears.d.ts","./node_modules/date-fns/roundToNearestHours.d.ts","./node_modules/date-fns/roundToNearestMinutes.d.ts","./node_modules/date-fns/secondsToHours.d.ts","./node_modules/date-fns/secondsToMilliseconds.d.ts","./node_modules/date-fns/secondsToMinutes.d.ts","./node_modules/date-fns/set.d.ts","./node_modules/date-fns/setDate.d.ts","./node_modules/date-fns/setDay.d.ts","./node_modules/date-fns/setDayOfYear.d.ts","./node_modules/date-fns/setDefaultOptions.d.ts","./node_modules/date-fns/setHours.d.ts","./node_modules/date-fns/setISODay.d.ts","./node_modules/date-fns/setISOWeek.d.ts","./node_modules/date-fns/setISOWeekYear.d.ts","./node_modules/date-fns/setMilliseconds.d.ts","./node_modules/date-fns/setMinutes.d.ts","./node_modules/date-fns/setMonth.d.ts","./node_modules/date-fns/setQuarter.d.ts","./node_modules/date-fns/setSeconds.d.ts","./node_modules/date-fns/setWeek.d.ts","./node_modules/date-fns/setWeekYear.d.ts","./node_modules/date-fns/setYear.d.ts","./node_modules/date-fns/startOfDay.d.ts","./node_modules/date-fns/startOfDecade.d.ts","./node_modules/date-fns/startOfHour.d.ts","./node_modules/date-fns/startOfISOWeek.d.ts","./node_modules/date-fns/startOfISOWeekYear.d.ts","./node_modules/date-fns/startOfMinute.d.ts","./node_modules/date-fns/startOfMonth.d.ts","./node_modules/date-fns/startOfQuarter.d.ts","./node_modules/date-fns/startOfSecond.d.ts","./node_modules/date-fns/startOfToday.d.ts","./node_modules/date-fns/startOfTomorrow.d.ts","./node_modules/date-fns/startOfWeek.d.ts","./node_modules/date-fns/startOfWeekYear.d.ts","./node_modules/date-fns/startOfYear.d.ts","./node_modules/date-fns/startOfYesterday.d.ts","./node_modules/date-fns/sub.d.ts","./node_modules/date-fns/subBusinessDays.d.ts","./node_modules/date-fns/subDays.d.ts","./node_modules/date-fns/subHours.d.ts","./node_modules/date-fns/subISOWeekYears.d.ts","./node_modules/date-fns/subMilliseconds.d.ts","./node_modules/date-fns/subMinutes.d.ts","./node_modules/date-fns/subMonths.d.ts","./node_modules/date-fns/subQuarters.d.ts","./node_modules/date-fns/subSeconds.d.ts","./node_modules/date-fns/subWeeks.d.ts","./node_modules/date-fns/subYears.d.ts","./node_modules/date-fns/toDate.d.ts","./node_modules/date-fns/transpose.d.ts","./node_modules/date-fns/weeksToDays.d.ts","./node_modules/date-fns/yearsToDays.d.ts","./node_modules/date-fns/yearsToMonths.d.ts","./node_modules/date-fns/yearsToQuarters.d.ts","./node_modules/date-fns/index.d.ts","./components/LivenessLayer.tsx","./components/TreasuryCard.tsx","./components/PassportDetails.tsx","./components/MapRadar.tsx","./components/SuccessPayoff.tsx","./components/CheckInVerify.tsx","./node_modules/react-qr-code/types/index.d.ts","./components/ManualVerify.tsx","./components/VentureVerify.tsx","./node_modules/qrcode.react/lib/index.d.mts","./components/QrOverlay.tsx","./node_modules/html5-qrcode/esm/core.d.ts","./node_modules/html5-qrcode/esm/camera/core.d.ts","./node_modules/html5-qrcode/esm/experimental-features.d.ts","./node_modules/html5-qrcode/esm/state-manager.d.ts","./node_modules/html5-qrcode/esm/html5-qrcode.d.ts","./node_modules/html5-qrcode/esm/html5-qrcode-scanner.d.ts","./node_modules/html5-qrcode/esm/index.d.ts","./components/QrScanner.tsx","./components/CreateListing.tsx","./components/Onboarding.tsx","./components/TrustRing.tsx","./components/ErrorBoundary.tsx","./components/Skeleton.tsx","./components/EmptyState.tsx","./node_modules/@nimiq/hub-api/dist/src/PublicPaymentOptions.d.ts","./node_modules/@nimiq/hub-api/dist/src/PublicRequestTypes.d.ts","./node_modules/@nimiq/hub-api/dist/src/RequestBehavior.d.ts","./node_modules/@nimiq/hub-api/dist/src/HubApi.d.ts","./node_modules/@nimiq/hub-api/types/index.d.ts","./app/page.tsx","./.next/types/cache-life.d.ts","./.next/types/validator.ts","./.next/dev/types/cache-life.d.ts","./.next/dev/types/root-params.d.ts","./.next/dev/types/routes.d.ts","./.next/dev/types/validator.ts","./node_modules/@types/estree/index.d.ts","./node_modules/@types/json-schema/index.d.ts","./node_modules/@types/json5/index.d.ts"],"fileIdsList":[[97,143,497,498,499,500,501,1050],[97,143,1050,1052],[97,143,456,539,542,551,565,566,567,569,737,738,740,741,742,743,744,757,1049,1050,1052,1054],[97,143,497,498,499,500,501,1052],[97,143,456,539,542,545,551,565,566,567,569,737,740,741,742,744,757,1049,1050,1052],[97,143,456,539,550,1050,1052],[97,143,456,539,552,553,556,564,1050,1052],[97,143,456,539,550,552,559,563,564,1050,1052],[97,143,456,539,550,552,559,563,564,568,1050,1052],[97,143,456,539,550,552,559,563,564,736,1050,1052],[97,143,456,539,552,559,563,1050,1052],[97,143,456,539,552,559,739,1050,1052],[97,143,148,456,539,552,559,568,1050,1052],[97,143,456,539,552,559,1050,1052],[97,143,456,540,543,752,755,756,1050,1052],[85,97,143,456,550,568,747,754,755,758,759,760,1019,1020,1021,1022,1023,1024,1026,1027,1029,1037,1038,1039,1040,1041,1042,1043,1048,1050,1052],[85,97,143,456,550,747,753,1050,1052],[97,143,456,753,1050,1052],[85,97,143,456,753,1050,1052],[85,97,143,456,1050,1052],[85,97,143,456,754,1050,1052],[97,143,456,753,1018,1050,1052],[85,97,143,456,747,753,1025,1050,1052],[85,97,143,456,550,753,1028,1050,1052],[85,97,143,456,753,754,1036,1050,1052],[97,143,456,562,1050,1052],[97,143,456,550,557,558,1050,1052],[97,143,456,1050,1052],[97,143,456,550,559,563,1050,1052],[85,97,143,456,746,1050,1052],[97,143,456,553,556,1050,1052],[97,143,148,456,516,1050,1052],[97,143,456,559,1050,1052],[97,143,456,735,1050,1052],[97,143,543,544,545,546,1050,1052],[97,143,456,543,1050,1052],[97,143,562,1050,1052],[97,143,560,561,1050,1052],[97,143,1045,1046,1050,1052],[97,143,562,1045,1050,1052],[97,143,562,1044,1050,1052],[97,143,1045,1050,1052],[97,143,1045,1046,1047,1050,1052],[97,143,154,745,1050,1052],[97,143,154,1050,1052],[97,143,554,1050,1052],[97,143,554,555,1050,1052],[97,140,143,1050,1052],[97,142,143,1050,1052],[143,1050,1052],[97,143,148,176,1050,1052],[97,143,144,149,154,162,173,184,1050,1052],[97,143,144,145,154,162,1050,1052],[92,93,94,97,143,1050,1052],[97,143,146,185,1050,1052],[97,143,147,148,155,163,1050,1052],[97,143,148,173,181,1050,1052],[97,143,149,151,154,162,1050,1052],[97,142,143,150,1050,1052],[97,143,151,152,1050,1052],[97,143,153,154,1050,1052],[97,142,143,154,1050,1052],[97,143,154,155,156,173,184,1050,1052],[97,143,154,155,156,169,173,176,1050,1052],[97,143,151,154,157,162,173,184,1050,1052],[97,143,154,155,157,158,162,173,181,184,1050,1052],[97,143,157,159,173,181,184,1050,1052],[95,96,97,98,99,100,101,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,1050,1052],[97,143,154,160,1050,1052],[97,143,161,184,189,1050,1052],[97,143,151,154,162,173,1050,1052],[97,143,163,1050,1052],[97,143,164,1050,1052],[97,142,143,165,1050,1052],[97,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,1050,1052],[97,143,167,1050,1052],[97,143,168,1050,1052],[97,143,154,169,170,1050,1052],[97,143,169,171,185,187,1050,1052],[97,143,154,173,174,176,1050,1052],[97,143,175,176,1050,1052],[97,143,173,174,1050,1052],[97,143,176,1050,1052],[97,143,177,1050,1052],[97,140,143,173,178,1050,1052],[97,143,154,179,180,1050,1052],[97,143,179,180,1050,1052],[97,143,148,162,173,181,1050,1052],[97,143,182,1050,1052],[97,143,162,183,1050,1052],[97,143,157,168,184,1050,1052],[97,143,148,185,1050,1052],[97,143,173,186,1050,1052],[97,143,161,187,1050,1052],[97,143,188,1050,1052],[97,138,143,1050,1052],[97,138,143,154,156,165,173,176,184,187,189,1050,1052],[97,143,173,190,1050,1052],[85,97,143,194,195,197,1050,1052],[85,97,143,1050,1052],[85,89,97,143,192,193,194,195,196,492,538,1050,1052],[85,89,97,143,192,193,197,492,538,1050,1052],[85,97,143,195,197,393,1050,1052],[85,97,143,195,197,1050,1052],[85,89,97,143,193,194,197,492,538,1050,1052],[85,89,97,143,192,194,197,492,538,1050,1052],[83,84,97,143,1050,1052],[97,143,764,1050,1052],[97,143,762,764,1050,1052],[97,143,762,1050,1052],[97,143,764,828,829,1050,1052],[97,143,764,831,1050,1052],[97,143,764,832,1050,1052],[97,143,849,1050,1052],[97,143,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,821,822,823,824,825,826,827,830,831,832,833,834,835,836,837,838,839,840,841,842,843,844,845,846,847,848,850,851,852,853,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,883,884,885,886,887,888,889,890,891,892,893,894,895,896,897,898,899,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,920,921,922,923,924,926,927,928,929,930,931,932,933,934,935,936,937,938,939,940,941,942,943,944,945,950,951,952,953,954,955,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1016,1017,1050,1052],[97,143,764,925,1050,1052],[97,143,764,829,949,1050,1052],[97,143,762,946,947,1050,1052],[97,143,764,946,1050,1052],[97,143,948,1050,1052],[97,143,761,762,763,1050,1052],[97,143,1030,1033,1034,1050,1052],[97,143,1030,1031,1032,1033,1050,1052],[97,143,1030,1031,1033,1034,1035,1050,1052],[97,143,495,1050,1052],[97,143,497,498,499,500,501,1050,1052],[97,143,428,507,508,1050,1052],[97,143,520,1050,1052],[97,143,217,218,220,232,352,363,473,478,1050,1052],[97,143,220,253,473,474,475,477,1050,1052],[97,143,199,220,369,371,373,374,376,473,1050,1052],[97,143,220,272,473,476,1050,1052],[97,143,199,218,220,231,232,239,244,250,351,352,353,362,473,1050,1052],[97,143,473,1050,1052],[97,143,227,234,253,254,348,1050,1052],[97,143,220,1050,1052],[97,143,198,227,234,1050,1052],[97,143,380,1050,1052],[97,143,377,378,380,1050,1052],[97,143,377,379,473,1050,1052],[97,143,157,452,460,468,1050,1052],[97,143,157,332,337,340,348,468,1050,1052],[97,143,157,297,468,1050,1052],[97,143,356,1050,1052],[97,143,355,356,357,1050,1052],[97,143,355,1050,1052],[91,97,143,157,198,211,212,220,232,239,244,251,252,253,349,350,363,473,478,492,1050,1052],[97,143,217,220,272,369,370,375,473,476,541,1050,1052],[97,143,476,541,1050,1052],[97,143,217,252,418,473,541,1050,1052],[97,143,541,1050,1052],[97,143,220,476,477,541,1050,1052],[97,143,372,541,1050,1052],[97,143,212,351,354,361,1050,1052],[85,97,143,428,1050,1052],[85,97,143,168,227,1050,1052],[85,97,143,227,1050,1052],[85,97,143,294,1050,1052],[85,97,143,234,428,1050,1052],[97,143,227,279,294,295,524,530,1050,1052],[97,143,278,525,526,527,528,529,1050,1052],[97,143,342,1050,1052],[97,143,342,343,1050,1052],[97,143,231,234,281,282,1050,1052],[97,143,234,285,286,290,1050,1052],[97,143,234,283,291,292,1050,1052],[97,143,285,1050,1052],[97,143,233,234,281,282,283,284,285,286,288,289,292,1050,1052],[97,143,234,284,286,290,1050,1052],[97,143,234,281,285,286,290,291,293,1050,1052],[97,143,234,282,284,286,287,288,290,1050,1052],[97,143,282,284,286,290,1050,1052],[97,143,234,1050,1052],[85,97,143,221,517,518,1050,1052],[85,97,143,184,1050,1052],[85,97,143,270,476,1050,1052],[85,97,143,363,476,1050,1052],[97,143,268,273,1050,1052],[85,97,143,269,494,1050,1052],[97,143,750,1050,1052],[85,89,97,143,157,192,193,194,197,492,537,1050,1052],[97,143,157,234,1050,1052],[97,143,157,218,223,232,238,300,317,358,359,363,411,417,473,1050,1052],[97,143,211,360,1050,1052],[97,143,492,1050,1052],[97,143,219,1050,1052],[85,97,143,225,227,420,441,443,1050,1052],[97,143,168,227,420,440,441,442,540,1050,1052],[97,143,434,435,436,437,438,439,1050,1052],[97,143,436,1050,1052],[97,143,440,1050,1052],[85,97,143,387,388,392,1050,1052],[85,97,143,234,381,382,383,384,389,391,1050,1052],[97,143,387,389,1050,1052],[97,143,385,1050,1052],[97,143,390,1050,1052],[97,143,386,1050,1052],[85,97,143,493,494,1050,1052],[85,97,143,494,1050,1052],[97,143,317,318,332,1050,1052],[97,143,318,1050,1052],[97,143,157,494,1050,1052],[97,143,346,1050,1052],[97,142,143,345,1050,1052],[97,143,173,1050,1052],[97,143,223,227,234,240,242,325,330,332,337,397,417,420,424,425,460,461,468,1050,1052],[97,143,233,234,246,288,1050,1052],[97,143,421,422,1050,1052],[97,143,173,421,1050,1052],[97,143,395,1050,1052],[97,143,221,227,424,426,461,468,473,1050,1052],[97,143,323,326,332,337,1050,1052],[85,97,143,173,225,227,340,380,424,429,430,431,432,433,444,445,446,447,448,449,450,451,541,1050,1052],[97,143,225,227,253,319,320,321,324,325,337,1050,1052],[97,143,173,234,253,323,331,397,420,423,426,468,1050,1052],[97,143,227,238,393,461,1050,1052],[97,143,327,1050,1052],[97,143,393,396,1050,1052],[97,143,393,394,395,541,1050,1052],[97,143,157,168,199,221,223,234,238,248,261,262,264,317,384,397,411,416,460,473,492,541,1050,1052],[97,143,225,227,1050,1052],[97,143,337,1050,1052],[97,142,143,223,236,253,261,262,329,333,334,335,336,473,1050,1052],[97,143,332,1050,1052],[97,142,143,226,227,238,242,259,319,320,321,322,323,326,327,328,330,331,337,461,1050,1052],[97,143,157,199,259,319,1050,1052],[97,143,223,253,262,317,337,417,473,1050,1052],[97,143,157,199,473,1050,1052],[97,143,157,173,199,223,468,1050,1052],[97,143,157,168,198,199,223,227,232,240,242,244,246,248,256,261,262,263,264,300,301,303,306,308,311,312,313,314,316,363,411,417,468,473,476,1050,1052],[97,143,157,173,1050,1052],[97,143,220,221,222,251,380,468,469,471,472,492,494,541,1050,1052],[97,143,217,218,473,1050,1052],[97,143,397,399,1050,1052],[97,143,157,173,184,229,376,380,381,382,383,384,391,392,397,398,541,1050,1052],[97,143,168,184,198,227,229,242,244,262,301,306,316,317,369,402,403,411,415,417,468,473,479,486,487,1050,1052],[97,143,211,212,244,251,262,473,1050,1052],[97,143,157,221,232,242,262,468,473,484,1050,1052],[97,143,419,1050,1052],[97,143,157,399,400,401,408,1050,1052],[97,143,468,473,1050,1052],[97,143,329,461,1050,1052],[97,143,242,261,363,494,1050,1052],[97,143,157,168,219,306,365,369,402,403,468,486,489,1050,1052],[97,143,157,211,212,369,404,1050,1052],[97,143,199,220,263,363,406,473,1050,1052],[97,143,157,184,384,397,473,1050,1052],[97,143,157,263,363,364,365,374,399,405,407,473,476,1050,1052],[91,97,143,157,246,261,410,492,494,1050,1052],[97,143,315,411,1050,1052],[97,143,157,168,211,212,227,230,232,234,240,242,248,262,264,301,303,313,316,317,363,403,411,415,417,468,478,479,480,482,485,494,1050,1052],[97,143,157,173,212,408,468,486,488,1050,1052],[97,143,201,202,203,204,205,206,207,208,209,210,1050,1052],[97,143,256,307,1050,1052],[97,143,309,1050,1052],[97,143,307,1050,1052],[97,143,309,310,1050,1052],[97,143,157,173,223,231,232,234,238,239,1050,1052],[97,143,157,168,199,219,221,240,243,246,261,264,299,411,468,492,494,1050,1052],[97,143,157,168,184,223,224,230,231,242,243,262,409,461,467,1050,1052],[97,143,319,1050,1052],[97,143,320,1050,1052],[97,143,234,244,460,1050,1052],[97,143,321,1050,1052],[97,143,226,1050,1052],[97,143,228,241,1050,1052],[97,143,157,228,232,240,1050,1052],[97,143,236,241,1050,1052],[97,143,237,1050,1052],[97,143,228,229,1050,1052],[97,143,228,265,1050,1052],[97,143,228,1050,1052],[97,143,230,256,305,1050,1052],[97,143,304,1050,1052],[97,143,227,229,230,1050,1052],[97,143,230,302,1050,1052],[97,143,227,229,1050,1052],[97,143,261,363,1050,1052],[97,143,460,1050,1052],[97,143,157,184,223,240,242,245,261,363,410,417,420,425,426,427,453,454,458,459,461,468,1050,1052],[97,143,274,277,279,280,294,295,1050,1052],[85,97,143,194,197,455,456,457,1050,1052],[85,97,143,194,197,394,455,456,457,1050,1052],[97,143,347,1050,1052],[97,143,199,253,255,260,261,332,337,338,339,340,341,343,344,346,349,410,417,473,1050,1052],[97,143,294,1050,1052],[97,143,157,299,468,1050,1052],[97,143,299,1050,1052],[97,143,157,240,266,296,298,300,410,468,492,494,1050,1052],[97,143,274,275,276,277,279,280,294,295,493,1050,1052],[91,97,143,157,168,184,223,228,229,242,248,261,262,264,363,408,409,411,468,473,492,1050,1052],[97,143,470,1050,1052],[97,143,225,227,235,1050,1052],[97,143,260,262,412,415,1050,1052],[97,143,260,413,462,463,464,465,466,1050,1052],[97,143,157,256,473,1050,1052],[97,143,157,1050,1052],[97,143,259,332,1050,1052],[97,143,258,1050,1052],[97,143,260,313,1050,1052],[97,143,257,259,473,1050,1052],[97,143,157,223,224,260,412,413,414,468,473,1050,1052],[85,97,143,227,234,293,1050,1052],[85,97,143,233,1050,1052],[97,143,215,216,1050,1052],[85,97,143,221,1050,1052],[85,97,143,227,278,1050,1052],[85,91,97,143,261,264,492,494,1050,1052],[97,143,221,517,519,1050,1052],[85,97,143,273,1050,1052],[85,97,143,168,184,219,267,269,271,272,494,1050,1052],[97,143,223,227,476,1050,1052],[97,143,227,481,1050,1052],[85,97,143,155,157,168,217,219,273,371,492,493,1050,1052],[85,97,143,192,193,194,197,492,538,1050,1052],[85,86,87,88,89,97,143,1050,1052],[97,143,148,1050,1052],[97,143,366,367,368,1050,1052],[97,143,366,1050,1052],[85,89,97,143,157,159,168,191,192,193,194,197,198,199,219,248,253,440,489,490,491,494,538,1050,1052],[97,143,503,1050,1052],[97,143,505,1050,1052],[97,143,509,1050,1052],[97,143,751,1050,1052],[97,143,511,1050,1052],[97,143,513,514,515,1050,1052],[90,97,143,496,502,504,506,510,512,516,521,523,532,533,535,539,540,541,542,1050,1052],[97,143,522,1050,1052],[97,143,531,1050,1052],[97,143,269,1050,1052],[97,143,534,1050,1052],[97,142,143,260,412,413,415,462,463,465,466,536,538,1050,1052],[97,143,191,1050,1052],[97,143,570,572,575,584,731,1050,1052],[97,143,570,572,575,731,733,1050,1052],[97,143,570,571,572,575,576,577,579,582,583,584,585,588,590,604,610,611,644,648,649,681,684,685,687,688,692,693,701,702,703,707,708,709,712,714,718,720,724,725,726,729,730,1050,1052],[97,143,571,581,731,1050,1052],[97,143,578,1050,1052],[97,143,575,581,582,731,1050,1052],[97,143,731,1050,1052],[97,143,573,731,1050,1052],[97,143,586,587,1050,1052],[97,143,579,1050,1052],[97,143,579,582,583,588,731,732,734,1050,1052],[97,143,571,572,573,584,1050,1052],[97,143,571,594,730,731,1050,1052],[97,143,575,580,731,1050,1052],[97,143,571,575,1050,1052],[97,143,570,571,572,574,1050,1052],[97,143,570,1050,1052],[97,143,570,573,575,731,1050,1052],[97,143,575,731,1050,1052],[97,143,575,590,593,596,606,608,609,735,1050,1052],[97,143,573,575,596,650,651,653,654,655,1050,1052],[97,143,593,597,605,608,735,1050,1052],[97,143,573,575,593,597,610,735,1050,1052],[97,143,573,593,597,598,605,608,735,1050,1052],[97,143,594,595,1050,1052],[97,143,593,604,605,1050,1052],[97,143,606,607,609,1050,1052],[97,143,575,671,674,1050,1052],[97,143,578,593,604,1050,1052],[97,143,604,1050,1052],[97,143,573,575,596,599,600,604,735,1050,1052],[97,143,583,1050,1052],[97,143,589,643,1050,1052],[97,143,575,582,583,589,1050,1052],[97,143,575,583,589,1050,1052],[97,143,575,582,589,1050,1052],[97,143,575,582,583,589,622,623,1050,1052],[97,143,575,582,583,589,618,1050,1052],[97,143,589,613,614,615,616,617,618,619,620,621,624,639,642,1050,1052],[97,143,575,582,583,589,634,1050,1052],[97,143,575,582,583,589,625,626,627,628,629,630,631,632,633,635,637,641,1050,1052],[97,143,575,582,583,589,636,1050,1052],[97,143,575,582,583,589,618,639,1050,1052],[97,143,575,582,583,589,640,1050,1052],[97,143,575,582,589,621,1050,1052],[97,143,575,582,583,589,638,1050,1052],[97,143,589,645,646,647,1050,1052],[97,143,574,575,582,588,589,646,648,1050,1052],[97,143,575,582,588,589,646,648,1050,1052],[97,143,575,578,582,583,589,649,1050,1052],[97,143,575,582,583,589,659,662,671,673,674,1050,1052],[97,143,575,582,589,660,661,674,1050,1052],[97,143,575,582,583,589,674,1050,1052],[97,143,574,575,582,589,674,1050,1052],[97,143,575,583,589,674,1050,1052],[97,143,574,575,582,583,589,659,663,664,665,666,670,671,674,1050,1052],[97,143,575,582,583,589,667,669,674,1050,1052],[97,143,575,582,583,589,659,668,1050,1052],[97,143,575,582,583,589,672,673,1050,1052],[97,143,575,582,583,589,672,1050,1052],[97,143,575,578,582,583,589,650,651,652,653,654,1050,1052],[97,143,589,654,655,658,674,677,680,1050,1052],[97,143,589,675,676,1050,1052],[97,143,575,582,589,675,1050,1052],[97,143,575,582,583,589,677,1050,1052],[97,143,578,589,656,657,658,1050,1052],[97,143,575,583,589,680,1050,1052],[97,143,575,582,589,680,1050,1052],[97,143,574,575,582,583,589,678,679,680,1050,1052],[97,143,575,578,582,583,589,655,1050,1052],[97,143,574,575,578,582,583,589,650,651,652,653,654,655,1050,1052],[97,143,575,578,582,583,589,651,1050,1052],[97,143,574,575,578,582,589,650,652,653,654,655,1050,1052],[97,143,578,589,610,1050,1052],[97,143,592,1050,1052],[97,143,574,575,578,582,583,589,590,591,597,598,605,606,608,609,610,1050,1052],[97,143,591,610,1050,1052],[97,143,575,583,589,610,1050,1052],[97,143,592,611,1050,1052],[97,143,574,575,582,589,590,610,1050,1052],[97,143,575,582,583,589,604,683,1050,1052],[97,143,575,582,583,588,589,682,1050,1052],[97,143,575,582,588,589,1050,1052],[97,143,575,578,582,589,604,686,1050,1052],[97,143,575,582,583,589,604,687,1050,1052],[97,143,575,578,582,583,589,604,689,691,1050,1052],[97,143,575,582,583,589,691,1050,1052],[97,143,575,578,582,583,589,604,610,689,690,1050,1052],[97,143,575,582,583,588,589,1050,1052],[97,143,589,695,1050,1052],[97,143,575,582,589,689,1050,1052],[97,143,589,697,1050,1052],[97,143,589,694,696,698,700,1050,1052],[97,143,575,578,582,583,589,694,699,1050,1052],[97,143,589,689,1050,1052],[97,143,578,589,604,689,1050,1052],[97,143,574,575,582,588,589,703,1050,1052],[97,143,578,590,604,612,644,648,649,681,684,685,687,688,692,693,701,702,703,707,708,709,712,714,718,720,724,725,728,1050,1052],[97,143,589,707,1050,1052],[97,143,575,582,589,604,704,705,706,707,1050,1052],[97,143,575,582,589,707,1050,1052],[97,143,575,582,589,604,712,1050,1052],[97,143,575,582,589,604,711,712,1050,1052],[97,143,578,589,604,646,710,711,712,1050,1052],[97,143,575,583,589,604,1050,1052],[97,143,575,578,582,589,604,1050,1052],[97,143,574,575,578,582,583,589,599,601,602,603,604,1050,1052],[97,143,589,713,1050,1052],[97,143,575,582,583,588,589,715,717,1050,1052],[97,143,575,582,583,588,589,716,1050,1052],[97,143,575,582,589,693,719,1050,1052],[97,143,575,582,583,589,721,722,724,1050,1052],[97,143,575,582,583,589,721,724,1050,1052],[97,143,575,578,582,583,589,722,723,1050,1052],[97,143,727,1050,1052],[97,143,726,1050,1052],[97,143,572,589,1050,1052],[97,143,588,1050,1052],[97,143,173,191,483,1050,1052],[97,110,114,143,184,1050,1052],[97,110,143,173,184,1050,1052],[97,105,143,1050,1052],[97,107,110,143,181,184,1050,1052],[97,143,162,181,1050,1052],[97,105,143,191,1050,1052],[97,107,110,143,162,184,1050,1052],[97,102,103,106,109,143,154,173,184,1050,1052],[97,110,117,143,1050,1052],[97,102,108,143,1050,1052],[97,110,131,132,143,1050,1052],[97,106,110,143,176,184,191,1050,1052],[97,131,143,191,1050,1052],[97,104,105,143,191,1050,1052],[97,110,143,1050,1052],[97,104,105,106,107,108,109,110,111,112,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,132,133,134,135,136,137,143,1050,1052],[97,110,125,143,1050,1052],[97,110,117,118,143,1050,1052],[97,108,110,118,119,143,1050,1052],[97,109,143,1050,1052],[97,102,105,110,143,1050,1052],[97,110,114,118,119,143,1050,1052],[97,114,143,1050,1052],[97,108,110,113,143,184,1050,1052],[97,102,107,110,117,143,1050,1052],[97,105,110,131,143,189,191,1050,1052],[97,143,155,456,1050,1052]],"fileInfos":[{"version":"c430d44666289dae81f30fa7b2edebf186ecc91a2d4c71266ea6ae76388792e1","affectsGlobalScope":true,"impliedFormat":1},{"version":"45b7ab580deca34ae9729e97c13cfd999df04416a79116c3bfb483804f85ded4","impliedFormat":1},{"version":"3facaf05f0c5fc569c5649dd359892c98a85557e3e0c847964caeb67076f4d75","impliedFormat":1},{"version":"e44bb8bbac7f10ecc786703fe0a6a4b952189f908707980ba8f3c8975a760962","impliedFormat":1},{"version":"5e1c4c362065a6b95ff952c0eab010f04dcd2c3494e813b493ecfd4fcb9fc0d8","impliedFormat":1},{"version":"68d73b4a11549f9c0b7d352d10e91e5dca8faa3322bfb77b661839c42b1ddec7","impliedFormat":1},{"version":"5efce4fc3c29ea84e8928f97adec086e3dc876365e0982cc8479a07954a3efd4","impliedFormat":1},{"version":"feecb1be483ed332fad555aff858affd90a48ab19ba7272ee084704eb7167569","impliedFormat":1},{"version":"ee7bad0c15b58988daa84371e0b89d313b762ab83cb5b31b8a2d1162e8eb41c2","impliedFormat":1},{"version":"27bdc30a0e32783366a5abeda841bc22757c1797de8681bbe81fbc735eeb1c10","impliedFormat":1},{"version":"8fd575e12870e9944c7e1d62e1f5a73fcf23dd8d3a321f2a2c74c20d022283fe","impliedFormat":1},{"version":"2ab096661c711e4a81cc464fa1e6feb929a54f5340b46b0a07ac6bbf857471f0","impliedFormat":1},{"version":"080941d9f9ff9307f7e27a83bcd888b7c8270716c39af943532438932ec1d0b9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2e80ee7a49e8ac312cc11b77f1475804bee36b3b2bc896bead8b6e1266befb43","affectsGlobalScope":true,"impliedFormat":1},{"version":"c57796738e7f83dbc4b8e65132f11a377649c00dd3eee333f672b8f0a6bea671","affectsGlobalScope":true,"impliedFormat":1},{"version":"dc2df20b1bcdc8c2d34af4926e2c3ab15ffe1160a63e58b7e09833f616efff44","affectsGlobalScope":true,"impliedFormat":1},{"version":"515d0b7b9bea2e31ea4ec968e9edd2c39d3eebf4a2d5cbd04e88639819ae3b71","affectsGlobalScope":true,"impliedFormat":1},{"version":"0559b1f683ac7505ae451f9a96ce4c3c92bdc71411651ca6ddb0e88baaaad6a3","affectsGlobalScope":true,"impliedFormat":1},{"version":"0dc1e7ceda9b8b9b455c3a2d67b0412feab00bd2f66656cd8850e8831b08b537","affectsGlobalScope":true,"impliedFormat":1},{"version":"ce691fb9e5c64efb9547083e4a34091bcbe5bdb41027e310ebba8f7d96a98671","affectsGlobalScope":true,"impliedFormat":1},{"version":"8d697a2a929a5fcb38b7a65594020fcef05ec1630804a33748829c5ff53640d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ff2a353abf8a80ee399af572debb8faab2d33ad38c4b4474cff7f26e7653b8d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fb0f136d372979348d59b3f5020b4cdb81b5504192b1cacff5d1fbba29378aa1","affectsGlobalScope":true,"impliedFormat":1},{"version":"d15bea3d62cbbdb9797079416b8ac375ae99162a7fba5de2c6c505446486ac0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"68d18b664c9d32a7336a70235958b8997ebc1c3b8505f4f1ae2b7e7753b87618","affectsGlobalScope":true,"impliedFormat":1},{"version":"eb3d66c8327153d8fa7dd03f9c58d351107fe824c79e9b56b462935176cdf12a","affectsGlobalScope":true,"impliedFormat":1},{"version":"38f0219c9e23c915ef9790ab1d680440d95419ad264816fa15009a8851e79119","affectsGlobalScope":true,"impliedFormat":1},{"version":"69ab18c3b76cd9b1be3d188eaf8bba06112ebbe2f47f6c322b5105a6fbc45a2e","affectsGlobalScope":true,"impliedFormat":1},{"version":"a680117f487a4d2f30ea46f1b4b7f58bef1480456e18ba53ee85c2746eeca012","affectsGlobalScope":true,"impliedFormat":1},{"version":"2f11ff796926e0832f9ae148008138ad583bd181899ab7dd768a2666700b1893","affectsGlobalScope":true,"impliedFormat":1},{"version":"4de680d5bb41c17f7f68e0419412ca23c98d5749dcaaea1896172f06435891fc","affectsGlobalScope":true,"impliedFormat":1},{"version":"954296b30da6d508a104a3a0b5d96b76495c709785c1d11610908e63481ee667","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac9538681b19688c8eae65811b329d3744af679e0bdfa5d842d0e32524c73e1c","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a969edff4bd52585473d24995c5ef223f6652d6ef46193309b3921d65dd4376","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e9fbd7030c440b33d021da145d3232984c8bb7916f277e8ffd3dc2e3eae2bdb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811ec78f7fefcabbda4bfa93b3eb67d9ae166ef95f9bff989d964061cbf81a0c","affectsGlobalScope":true,"impliedFormat":1},{"version":"717937616a17072082152a2ef351cb51f98802fb4b2fdabd32399843875974ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"d7e7d9b7b50e5f22c915b525acc5a49a7a6584cf8f62d0569e557c5cfc4b2ac2","affectsGlobalScope":true,"impliedFormat":1},{"version":"71c37f4c9543f31dfced6c7840e068c5a5aacb7b89111a4364b1d5276b852557","affectsGlobalScope":true,"impliedFormat":1},{"version":"576711e016cf4f1804676043e6a0a5414252560eb57de9faceee34d79798c850","affectsGlobalScope":true,"impliedFormat":1},{"version":"89c1b1281ba7b8a96efc676b11b264de7a8374c5ea1e6617f11880a13fc56dc6","affectsGlobalScope":true,"impliedFormat":1},{"version":"74f7fa2d027d5b33eb0471c8e82a6c87216223181ec31247c357a3e8e2fddc5b","affectsGlobalScope":true,"impliedFormat":1},{"version":"d6d7ae4d1f1f3772e2a3cde568ed08991a8ae34a080ff1151af28b7f798e22ca","affectsGlobalScope":true,"impliedFormat":1},{"version":"063600664504610fe3e99b717a1223f8b1900087fab0b4cad1496a114744f8df","affectsGlobalScope":true,"impliedFormat":1},{"version":"934019d7e3c81950f9a8426d093458b65d5aff2c7c1511233c0fd5b941e608ab","affectsGlobalScope":true,"impliedFormat":1},{"version":"52ada8e0b6e0482b728070b7639ee42e83a9b1c22d205992756fe020fd9f4a47","affectsGlobalScope":true,"impliedFormat":1},{"version":"3bdefe1bfd4d6dee0e26f928f93ccc128f1b64d5d501ff4a8cf3c6371200e5e6","affectsGlobalScope":true,"impliedFormat":1},{"version":"59fb2c069260b4ba00b5643b907ef5d5341b167e7d1dbf58dfd895658bda2867","affectsGlobalScope":true,"impliedFormat":1},{"version":"639e512c0dfc3fad96a84caad71b8834d66329a1f28dc95e3946c9b58176c73a","affectsGlobalScope":true,"impliedFormat":1},{"version":"368af93f74c9c932edd84c58883e736c9e3d53cec1fe24c0b0ff451f529ceab1","affectsGlobalScope":true,"impliedFormat":1},{"version":"af3dd424cf267428f30ccfc376f47a2c0114546b55c44d8c0f1d57d841e28d74","affectsGlobalScope":true,"impliedFormat":1},{"version":"995c005ab91a498455ea8dfb63aa9f83fa2ea793c3d8aa344be4a1678d06d399","affectsGlobalScope":true,"impliedFormat":1},{"version":"959d36cddf5e7d572a65045b876f2956c973a586da58e5d26cde519184fd9b8a","affectsGlobalScope":true,"impliedFormat":1},{"version":"965f36eae237dd74e6cca203a43e9ca801ce38824ead814728a2807b1910117d","affectsGlobalScope":true,"impliedFormat":1},{"version":"3925a6c820dcb1a06506c90b1577db1fdbf7705d65b62b99dce4be75c637e26b","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a3d63ef2b853447ec4f749d3f368ce642264246e02911fcb1590d8c161b8005","affectsGlobalScope":true,"impliedFormat":1},{"version":"8cdf8847677ac7d20486e54dd3fcf09eda95812ac8ace44b4418da1bbbab6eb8","affectsGlobalScope":true,"impliedFormat":1},{"version":"8444af78980e3b20b49324f4a16ba35024fef3ee069a0eb67616ea6ca821c47a","affectsGlobalScope":true,"impliedFormat":1},{"version":"3287d9d085fbd618c3971944b65b4be57859f5415f495b33a6adc994edd2f004","affectsGlobalScope":true,"impliedFormat":1},{"version":"b4b67b1a91182421f5df999988c690f14d813b9850b40acd06ed44691f6727ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"df83c2a6c73228b625b0beb6669c7ee2a09c914637e2d35170723ad49c0f5cd4","affectsGlobalScope":true,"impliedFormat":1},{"version":"436aaf437562f276ec2ddbee2f2cdedac7664c1e4c1d2c36839ddd582eeb3d0a","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e3c06ea092138bf9fa5e874a1fdbc9d54805d074bee1de31b99a11e2fec239d","affectsGlobalScope":true,"impliedFormat":1},{"version":"87dc0f382502f5bbce5129bdc0aea21e19a3abbc19259e0b43ae038a9fc4e326","affectsGlobalScope":true,"impliedFormat":1},{"version":"b1cb28af0c891c8c96b2d6b7be76bd394fddcfdb4709a20ba05a7c1605eea0f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"2fef54945a13095fdb9b84f705f2b5994597640c46afeb2ce78352fab4cb3279","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac77cb3e8c6d3565793eb90a8373ee8033146315a3dbead3bde8db5eaf5e5ec6","affectsGlobalScope":true,"impliedFormat":1},{"version":"56e4ed5aab5f5920980066a9409bfaf53e6d21d3f8d020c17e4de584d29600ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"4ece9f17b3866cc077099c73f4983bddbcb1dc7ddb943227f1ec070f529dedd1","affectsGlobalScope":true,"impliedFormat":1},{"version":"0a6282c8827e4b9a95f4bf4f5c205673ada31b982f50572d27103df8ceb8013c","affectsGlobalScope":true,"impliedFormat":1},{"version":"1c9319a09485199c1f7b0498f2988d6d2249793ef67edda49d1e584746be9032","affectsGlobalScope":true,"impliedFormat":1},{"version":"e3a2a0cee0f03ffdde24d89660eba2685bfbdeae955a6c67e8c4c9fd28928eeb","affectsGlobalScope":true,"impliedFormat":1},{"version":"811c71eee4aa0ac5f7adf713323a5c41b0cf6c4e17367a34fbce379e12bbf0a4","affectsGlobalScope":true,"impliedFormat":1},{"version":"51ad4c928303041605b4d7ae32e0c1ee387d43a24cd6f1ebf4a2699e1076d4fa","affectsGlobalScope":true,"impliedFormat":1},{"version":"60037901da1a425516449b9a20073aa03386cce92f7a1fd902d7602be3a7c2e9","affectsGlobalScope":true,"impliedFormat":1},{"version":"d4b1d2c51d058fc21ec2629fff7a76249dec2e36e12960ea056e3ef89174080f","affectsGlobalScope":true,"impliedFormat":1},{"version":"22adec94ef7047a6c9d1af3cb96be87a335908bf9ef386ae9fd50eeb37f44c47","affectsGlobalScope":true,"impliedFormat":1},{"version":"196cb558a13d4533a5163286f30b0509ce0210e4b316c56c38d4c0fd2fb38405","affectsGlobalScope":true,"impliedFormat":1},{"version":"73f78680d4c08509933daf80947902f6ff41b6230f94dd002ae372620adb0f60","affectsGlobalScope":true,"impliedFormat":1},{"version":"c5239f5c01bcfa9cd32f37c496cf19c61d69d37e48be9de612b541aac915805b","affectsGlobalScope":true,"impliedFormat":1},{"version":"8e7f8264d0fb4c5339605a15daadb037bf238c10b654bb3eee14208f860a32ea","affectsGlobalScope":true,"impliedFormat":1},{"version":"782dec38049b92d4e85c1585fbea5474a219c6984a35b004963b00beb1aab538","affectsGlobalScope":true,"impliedFormat":1},{"version":"7e29f41b158de217f94cb9676bf9cbd0cd9b5a46e1985141ed36e075c52bf6ad","affectsGlobalScope":true,"impliedFormat":1},{"version":"ac51dd7d31333793807a6abaa5ae168512b6131bd41d9c5b98477fc3b7800f9f","impliedFormat":1},{"version":"045c1b395851aa71ef76393398466330fe1eeebc113c8085eefc6d84abea3a88","impliedFormat":1},{"version":"acd8fd5090ac73902278889c38336ff3f48af6ba03aa665eb34a75e7ba1dccc4","impliedFormat":1},{"version":"d6258883868fb2680d2ca96bc8b1352cab69874581493e6d52680c5ffecdb6cc","impliedFormat":1},{"version":"1b61d259de5350f8b1e5db06290d31eaebebc6baafd5f79d314b5af9256d7153","impliedFormat":1},{"version":"f258e3960f324a956fc76a3d3d9e964fff2244ff5859dcc6ce5951e5413ca826","impliedFormat":1},{"version":"643f7232d07bf75e15bd8f658f664d6183a0efaca5eb84b48201c7671a266979","impliedFormat":1},{"version":"68d7453aee169c6f39bf6a87d2a07e21209dfe085ce8469b7331bc7f8f0545eb","impliedFormat":1},{"version":"70521b6ab0dcba37539e5303104f29b721bfb2940b2776da4cc818c07e1fefc1","affectsGlobalScope":true,"impliedFormat":1},{"version":"ab41ef1f2cdafb8df48be20cd969d875602483859dc194e9c97c8a576892c052","affectsGlobalScope":true,"impliedFormat":1},{"version":"d153a11543fd884b596587ccd97aebbeed950b26933ee000f94009f1ab142848","affectsGlobalScope":true,"impliedFormat":1},{"version":"21d819c173c0cf7cc3ce57c3276e77fd9a8a01d35a06ad87158781515c9a438a","impliedFormat":1},{"version":"98cffbf06d6bab333473c70a893770dbe990783904002c4f1a960447b4b53dca","affectsGlobalScope":true,"impliedFormat":1},{"version":"ba481bca06f37d3f2c137ce343c7d5937029b2468f8e26111f3c9d9963d6568d","affectsGlobalScope":true,"impliedFormat":1},{"version":"6d9ef24f9a22a88e3e9b3b3d8c40ab1ddb0853f1bfbd5c843c37800138437b61","affectsGlobalScope":true,"impliedFormat":1},{"version":"1db0b7dca579049ca4193d034d835f6bfe73096c73663e5ef9a0b5779939f3d0","affectsGlobalScope":true,"impliedFormat":1},{"version":"9798340ffb0d067d69b1ae5b32faa17ab31b82466a3fc00d8f2f2df0c8554aaa","affectsGlobalScope":true,"impliedFormat":1},{"version":"f26b11d8d8e4b8028f1c7d618b22274c892e4b0ef5b3678a8ccbad85419aef43","affectsGlobalScope":true,"impliedFormat":1},{"version":"5929864ce17fba74232584d90cb721a89b7ad277220627cc97054ba15a98ea8f","impliedFormat":1},{"version":"763fe0f42b3d79b440a9b6e51e9ba3f3f91352469c1e4b3b67bfa4ff6352f3f4","impliedFormat":1},{"version":"25c8056edf4314820382a5fdb4bb7816999acdcb929c8f75e3f39473b87e85bc","impliedFormat":1},{"version":"c464d66b20788266e5353b48dc4aa6bc0dc4a707276df1e7152ab0c9ae21fad8","impliedFormat":1},{"version":"78d0d27c130d35c60b5e5566c9f1e5be77caf39804636bc1a40133919a949f21","impliedFormat":1},{"version":"c6fd2c5a395f2432786c9cb8deb870b9b0e8ff7e22c029954fabdd692bff6195","impliedFormat":1},{"version":"1d6e127068ea8e104a912e42fc0a110e2aa5a66a356a917a163e8cf9a65e4a75","impliedFormat":1},{"version":"5ded6427296cdf3b9542de4471d2aa8d3983671d4cac0f4bf9c637208d1ced43","impliedFormat":1},{"version":"7f182617db458e98fc18dfb272d40aa2fff3a353c44a89b2c0ccb3937709bfb5","impliedFormat":1},{"version":"cadc8aced301244057c4e7e73fbcae534b0f5b12a37b150d80e5a45aa4bebcbd","impliedFormat":1},{"version":"385aab901643aa54e1c36f5ef3107913b10d1b5bb8cbcd933d4263b80a0d7f20","impliedFormat":1},{"version":"9670d44354bab9d9982eca21945686b5c24a3f893db73c0dae0fd74217a4c219","impliedFormat":1},{"version":"0b8a9268adaf4da35e7fa830c8981cfa22adbbe5b3f6f5ab91f6658899e657a7","impliedFormat":1},{"version":"11396ed8a44c02ab9798b7dca436009f866e8dae3c9c25e8c1fbc396880bf1bb","impliedFormat":1},{"version":"ba7bc87d01492633cb5a0e5da8a4a42a1c86270e7b3d2dea5d156828a84e4882","impliedFormat":1},{"version":"4893a895ea92c85345017a04ed427cbd6a1710453338df26881a6019432febdd","impliedFormat":1},{"version":"c21dc52e277bcfc75fac0436ccb75c204f9e1b3fa5e12729670910639f27343e","impliedFormat":1},{"version":"13f6f39e12b1518c6650bbb220c8985999020fe0f21d818e28f512b7771d00f9","impliedFormat":1},{"version":"9b5369969f6e7175740bf51223112ff209f94ba43ecd3bb09eefff9fd675624a","impliedFormat":1},{"version":"4fe9e626e7164748e8769bbf74b538e09607f07ed17c2f20af8d680ee49fc1da","impliedFormat":1},{"version":"24515859bc0b836719105bb6cc3d68255042a9f02a6022b3187948b204946bd2","impliedFormat":1},{"version":"ea0148f897b45a76544ae179784c95af1bd6721b8610af9ffa467a518a086a43","impliedFormat":1},{"version":"24c6a117721e606c9984335f71711877293a9651e44f59f3d21c1ea0856f9cc9","impliedFormat":1},{"version":"dd3273ead9fbde62a72949c97dbec2247ea08e0c6952e701a483d74ef92d6a17","impliedFormat":1},{"version":"405822be75ad3e4d162e07439bac80c6bcc6dbae1929e179cf467ec0b9ee4e2e","impliedFormat":1},{"version":"0db18c6e78ea846316c012478888f33c11ffadab9efd1cc8bcc12daded7a60b6","impliedFormat":1},{"version":"e61be3f894b41b7baa1fbd6a66893f2579bfad01d208b4ff61daef21493ef0a8","impliedFormat":1},{"version":"bd0532fd6556073727d28da0edfd1736417a3f9f394877b6d5ef6ad88fba1d1a","impliedFormat":1},{"version":"89167d696a849fce5ca508032aabfe901c0868f833a8625d5a9c6e861ef935d2","impliedFormat":1},{"version":"615ba88d0128ed16bf83ef8ccbb6aff05c3ee2db1cc0f89ab50a4939bfc1943f","impliedFormat":1},{"version":"a4d551dbf8746780194d550c88f26cf937caf8d56f102969a110cfaed4b06656","impliedFormat":1},{"version":"8bd86b8e8f6a6aa6c49b71e14c4ffe1211a0e97c80f08d2c8cc98838006e4b88","impliedFormat":1},{"version":"317e63deeb21ac07f3992f5b50cdca8338f10acd4fbb7257ebf56735bf52ab00","impliedFormat":1},{"version":"4732aec92b20fb28c5fe9ad99521fb59974289ed1e45aecb282616202184064f","impliedFormat":1},{"version":"2e85db9e6fd73cfa3d7f28e0ab6b55417ea18931423bd47b409a96e4a169e8e6","impliedFormat":1},{"version":"c46e079fe54c76f95c67fb89081b3e399da2c7d109e7dca8e4b58d83e332e605","impliedFormat":1},{"version":"bf67d53d168abc1298888693338cb82854bdb2e69ef83f8a0092093c2d562107","impliedFormat":1},{"version":"b52476feb4a0cbcb25e5931b930fc73cb6643fb1a5060bf8a3dda0eeae5b4b68","affectsGlobalScope":true,"impliedFormat":1},{"version":"e2677634fe27e87348825bb041651e22d50a613e2fdf6a4a3ade971d71bac37e","impliedFormat":1},{"version":"7394959e5a741b185456e1ef5d64599c36c60a323207450991e7a42e08911419","impliedFormat":1},{"version":"8c0bcd6c6b67b4b503c11e91a1fb91522ed585900eab2ab1f61bba7d7caa9d6f","impliedFormat":1},{"version":"8cd19276b6590b3ebbeeb030ac271871b9ed0afc3074ac88a94ed2449174b776","affectsGlobalScope":true,"impliedFormat":1},{"version":"696eb8d28f5949b87d894b26dc97318ef944c794a9a4e4f62360cd1d1958014b","impliedFormat":1},{"version":"3f8fa3061bd7402970b399300880d55257953ee6d3cd408722cb9ac20126460c","impliedFormat":1},{"version":"35ec8b6760fd7138bbf5809b84551e31028fb2ba7b6dc91d95d098bf212ca8b4","affectsGlobalScope":true,"impliedFormat":1},{"version":"5524481e56c48ff486f42926778c0a3cce1cc85dc46683b92b1271865bcf015a","impliedFormat":1},{"version":"68bd56c92c2bd7d2339457eb84d63e7de3bd56a69b25f3576e1568d21a162398","affectsGlobalScope":true,"impliedFormat":1},{"version":"3e93b123f7c2944969d291b35fed2af79a6e9e27fdd5faa99748a51c07c02d28","impliedFormat":1},{"version":"9d19808c8c291a9010a6c788e8532a2da70f811adb431c97520803e0ec649991","impliedFormat":1},{"version":"87aad3dd9752067dc875cfaa466fc44246451c0c560b820796bdd528e29bef40","impliedFormat":1},{"version":"4aacb0dd020eeaef65426153686cc639a78ec2885dc72ad220be1d25f1a439df","impliedFormat":1},{"version":"f0bd7e6d931657b59605c44112eaf8b980ba7f957a5051ed21cb93d978cf2f45","impliedFormat":1},{"version":"8db0ae9cb14d9955b14c214f34dae1b9ef2baee2fe4ce794a4cd3ac2531e3255","affectsGlobalScope":true,"impliedFormat":1},{"version":"15fc6f7512c86810273af28f224251a5a879e4261b4d4c7e532abfbfc3983134","impliedFormat":1},{"version":"58adba1a8ab2d10b54dc1dced4e41f4e7c9772cbbac40939c0dc8ce2cdb1d442","impliedFormat":1},{"version":"641942a78f9063caa5d6b777c99304b7d1dc7328076038c6d94d8a0b81fc95c1","impliedFormat":1},{"version":"1123a83f35cf56c97de746f0a7250012153c61a167e4a61668bf50e558162d14","impliedFormat":1},{"version":"855cd5f7eb396f5f1ab1bc0f8580339bff77b68a770f84c6b254e319bbfd1ac7","impliedFormat":1},{"version":"5650cf3dace09e7c25d384e3e6b818b938f68f4e8de96f52d9c5a1b3db068e86","impliedFormat":1},{"version":"1354ca5c38bd3fd3836a68e0f7c9f91f172582ba30ab15bb8c075891b91502b7","affectsGlobalScope":true,"impliedFormat":1},{"version":"7e20d899c28ca26a2a7afc98beaa69e63ff7fba0a8bc47b4e3bf3ede5e09e424","impliedFormat":1},{"version":"2d2fcaab481b31a5882065c7951255703ddbe1c0e507af56ea42d79ac3911201","impliedFormat":1},{"version":"a192fe8ec33f75edbc8d8f3ed79f768dfae11ff5735e7fe52bfa69956e46d78d","impliedFormat":1},{"version":"ca867399f7db82df981d6915bcbb2d81131d7d1ef683bc782b59f71dda59bc85","affectsGlobalScope":true,"impliedFormat":1},{"version":"372413016d17d804e1d139418aca0c68e47a83fb6669490857f4b318de8cccb3","affectsGlobalScope":true,"impliedFormat":1},{"version":"9e043a1bc8fbf2a255bccf9bf27e0f1caf916c3b0518ea34aa72357c0afd42ec","impliedFormat":1},{"version":"b4f70ec656a11d570e1a9edce07d118cd58d9760239e2ece99306ee9dfe61d02","impliedFormat":1},{"version":"3bc2f1e2c95c04048212c569ed38e338873f6a8593930cf5a7ef24ffb38fc3b6","impliedFormat":1},{"version":"6e70e9570e98aae2b825b533aa6292b6abd542e8d9f6e9475e88e1d7ba17c866","impliedFormat":1},{"version":"f9d9d753d430ed050dc1bf2667a1bab711ccbb1c1507183d794cc195a5b085cc","impliedFormat":1},{"version":"9eece5e586312581ccd106d4853e861aaaa1a39f8e3ea672b8c3847eedd12f6e","impliedFormat":1},{"version":"085f552d005479e2e6a7311cdbbe5d8c55c497b4d19274285df161ee9684cd9c","impliedFormat":1},{"version":"37ba7b45141a45ce6e80e66f2a96c8a5ab1bcef0fc2d0f56bb58df96ec67e972","impliedFormat":1},{"version":"45650f47bfb376c8a8ed39d4bcda5902ab899a3150029684ee4c10676d9fbaee","impliedFormat":1},{"version":"007faacc9268357caa21d24169f3f3f2497af3e9241308df2d89f6e6d9bb3f2e","affectsGlobalScope":true,"impliedFormat":1},{"version":"74cf591a0f63db318651e0e04cb55f8791385f86e987a67fd4d2eaab8191f730","impliedFormat":1},{"version":"5eab9b3dc9b34f185417342436ec3f106898da5f4801992d8ff38ab3aff346b5","impliedFormat":1},{"version":"12ed4559eba17cd977aa0db658d25c4047067444b51acfdcbf38470630642b23","affectsGlobalScope":true,"impliedFormat":1},{"version":"f3ffabc95802521e1e4bcba4c88d8615176dc6e09111d920c7a213bdda6e1d65","impliedFormat":1},{"version":"809821b8a065e3234a55b3a9d7846231ed18d66dd749f2494c66288d890daf7f","impliedFormat":1},{"version":"ae56f65caf3be91108707bd8dfbccc2a57a91feb5daabf7165a06a945545ed26","impliedFormat":1},{"version":"a136d5de521da20f31631a0a96bf712370779d1c05b7015d7019a9b2a0446ca9","impliedFormat":1},{"version":"c3b41e74b9a84b88b1dca61ec39eee25c0dbc8e7d519ba11bb070918cfacf656","affectsGlobalScope":true,"impliedFormat":1},{"version":"4737a9dc24d0e68b734e6cfbcea0c15a2cfafeb493485e27905f7856988c6b29","affectsGlobalScope":true,"impliedFormat":1},{"version":"36d8d3e7506b631c9582c251a2c0b8a28855af3f76719b12b534c6edf952748d","impliedFormat":1},{"version":"1ca69210cc42729e7ca97d3a9ad48f2e9cb0042bada4075b588ae5387debd318","impliedFormat":1},{"version":"f5ebe66baaf7c552cfa59d75f2bfba679f329204847db3cec385acda245e574e","impliedFormat":1},{"version":"ed59add13139f84da271cafd32e2171876b0a0af2f798d0c663e8eeb867732cf","affectsGlobalScope":true,"impliedFormat":1},{"version":"b7c5e2ea4a9749097c347454805e933844ed207b6eefec6b7cfd418b5f5f7b28","impliedFormat":1},{"version":"b1810689b76fd473bd12cc9ee219f8e62f54a7d08019a235d07424afbf074d25","impliedFormat":1},{"version":"865a2612f5ec073dd48d454307ccabb04c48f8b96fda9940c5ebfe6b4b451f51","impliedFormat":1},{"version":"2e07abf27aa06353d46f4448c0bbac73431f6065eef7113128a5cd804d0c384d","impliedFormat":1},{"version":"dfb24c6874a941ebd8947c97efb27c6b40f4a48218ce7433d1d088d1245b6d58","impliedFormat":1},{"version":"bc03c3c352f689e38c0ddd50c39b1e65d59273991bfc8858a9e3c0ebb79c023b","impliedFormat":1},{"version":"ed91c87062f8720dfb894f41e364d0c189eb3fa40501f93cf36691e06f5d3261","impliedFormat":1},{"version":"9894dafe342b976d251aac58e616ac6df8db91fb9d98934ff9dd103e9e82578f","impliedFormat":1},{"version":"413df52d4ea14472c2fa5bee62f7a40abd1eb49be0b9722ee01ee4e52e63beb2","impliedFormat":1},{"version":"9222cd69f4ea6f0aadc222f649b08830757a081a0f170bf3e392fafb90ce6888","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"aa14cee20aa0db79f8df101fc027d929aec10feb5b8a8da3b9af3895d05b7ba2","impliedFormat":1},{"version":"493c700ac3bd317177b2eb913805c87fe60d4e8af4fb39c41f04ba81fae7e170","impliedFormat":1},{"version":"aeb554d876c6b8c818da2e118d8b11e1e559adbe6bf606cc9a611c1b6c09f670","impliedFormat":1},{"version":"acf5a2ac47b59ca07afa9abbd2b31d001bf7448b041927befae2ea5b1951d9f9","impliedFormat":1},{"version":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881","impliedFormat":1},{"version":"d71291eff1e19d8762a908ba947e891af44749f3a2cbc5bd2ec4b72f72ea795f","impliedFormat":1},{"version":"c0480e03db4b816dff2682b347c95f2177699525c54e7e6f6aa8ded890b76be7","impliedFormat":1},{"version":"25a5f6fd3a2243c859eddc99ab5fba11d970af2fe7a5df9c32b7668f76f97b01","impliedFormat":1},{"version":"8d207e1f9d2c30d6f77dfa693f3827c3fbf0d89240297e10bdfe1041d433df68","impliedFormat":1},{"version":"6c301d40aec56a74ec7bd7324e31a728dadf9bfba3e96def02938d3d973534ec","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"db6d2d9daad8a6d83f281af12ce4355a20b9a3e71b82b9f57cddcca0a8964a96","impliedFormat":1},{"version":"446a50749b24d14deac6f8843e057a6355dd6437d1fac4f9e5ce4a5071f34bff","impliedFormat":1},{"version":"182e9fcbe08ac7c012e0a6e2b5798b4352470be29a64fdc114d23c2bab7d5106","impliedFormat":1},{"version":"a7fa84b28bea56e199ea2d937ed3743645d969d520f7e937cf4b09d818ffa7e6","impliedFormat":1},{"version":"260e85ffab04d2d16cbaf3899fcb0cfdfa696cb99948d7b703fb28af9ff383fb","impliedFormat":1},{"version":"fbf9959ac279b397cdcd47b6155c32ace1e33ea148c6c1b87815225cb919685f","impliedFormat":1},{"version":"fd4e24ccff3966390600d7f5d6aa1fed5a512e92ada735ea5fbc933d313ad3d3","impliedFormat":1},{"version":"b7cddfe1aa6b86b5fad3c9ccb30d05b3ccb165aebbf112f48d2d8a5f69dd98b1","impliedFormat":1},{"version":"a86f82d646a739041d6702101afa82dcb935c416dd93cbca7fd754fd0282ce1f","impliedFormat":1},{"version":"35e6379c3f7cb27b111ad4c1aa69538fd8e788ab737b8ff7596a1b40e96f4f90","impliedFormat":1},{"version":"8353adc36468bb55b52ac03d199285bd57fe5cc6530a0ab3ec0156f6459a2e9e","impliedFormat":1},{"version":"6820bbf8a6224854ee584c7524679a3fbd37aff253910b3eb589293f8d1dcd71","impliedFormat":1},{"version":"6dcbc15455c4fcb581da53e9143ebec5c73dc60c881dc6d0255b26180682bea0","impliedFormat":1},{"version":"ab2acae979239e320dce1c8288d717113dd3155a4a5639c07082b4aa9adb7ca7","impliedFormat":1},{"version":"3e7efde639c6a6c3edb9847b3f61e308bf7a69685b92f665048c45132f51c218","impliedFormat":1},{"version":"df45ca1176e6ac211eae7ddf51336dc075c5314bc5c253651bae639defd5eec5","impliedFormat":1},{"version":"8a0e762ceb20c7e72504feef83d709468a70af4abccb304f32d6b9bac1129b2c","impliedFormat":1},{"version":"f6e0694f98a39a8fcc85e98c3f9ecea676cd784b96bfecbf9be7670df6df7775","impliedFormat":1},{"version":"ce75b1aebb33d510ff28af960a9221410a3eaf7f18fc5f21f9404075fba77256","impliedFormat":1},{"version":"d357f3dda6eeae33718e68567bb5d7654984c343f6a3086c19e853fc03b433bc","impliedFormat":1},{"version":"54a749a0a6b2a82499390d3deee0f52f5b1d1da118fda8e52a28cf87cdd158ce","impliedFormat":1},{"version":"ee8df1cb8d0faaca4013a1b442e99130769ce06f438d18d510fed95890067563","impliedFormat":1},{"version":"16e4d5ea9246286cd59579c7949a1c7f84e036c85f49e527002b8e458844cea8","impliedFormat":1},{"version":"bd9809e72e9a7a5760e91b49f976667d3ff9fb19d517cacf4e8339c628f5ad7f","impliedFormat":1},{"version":"54d63313c49d96380bed92e595e3befe179e4076085eb4f21459446148b75ade","impliedFormat":1},{"version":"e4cbf2f1e89ecccaddd2c045e600ae41b732295953fb06247c7dcbc2d281ed30","impliedFormat":1},{"version":"be7a66c05d3bc06fd639ba98316086470616858c0e4c04325fffe4f529662c36","impliedFormat":1},{"version":"8c1697d90c394a6fd955b98eae01238eff628e129b987a68aea10f898a48e7da","impliedFormat":1},{"version":"b2f4d55a673acbd87c62494b0916dfbb09f8081ad290bf11be707dfbdf30e4f6","impliedFormat":1},{"version":"a49e1f0fe346d8302d5f0a7c13f70badb03afca56b6f44b4ad7fdfd89364a9dd","impliedFormat":1},{"version":"d10d63718e1646c2279e3b33831f82c60e31f622b2b7020f1196409ca4c09242","impliedFormat":1},{"version":"106c6025f1d99fd468fd8bf6e5bda724e11e5905a4076c5d29790b6c3745e50c","impliedFormat":1},{"version":"a365c4d3bed3be4e4e20793c999c51f5cd7e6792322f14650949d827fbcd170f","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"148679c6d0f449210a96e7d2e562d589e56fcde87f843a92808b3ff103f1a774","impliedFormat":1},{"version":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855","impliedFormat":1},{"version":"02436d7e9ead85e09a2f8e27d5f47d9464bced31738dec138ca735390815c9f0","impliedFormat":1},{"version":"f8d5ff8eafd37499f2b6a98659dd9b45a321de186b8db6b6142faed0fea3de77","impliedFormat":1},{"version":"b620391fe8060cf9bedc176a4d01366e6574d7a71e0ac0ab344a4e76576fcbb8","impliedFormat":1},{"version":"7deaed322f7c34cebdd096b779fb81676f3303044ac2c6563574fe7178db8765","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"2652448ac55a2010a1f71dd141f828b682298d39728f9871e1cdf8696ef443fd","impliedFormat":1},{"version":"d682336018141807fb602709e2d95a192828fcb8d5ba06dda3833a8ea98f69e3","impliedFormat":1},{"version":"6124e973eab8c52cabf3c07575204efc1784aca6b0a30c79eb85fe240a857efa","impliedFormat":1},{"version":"0d891735a21edc75df51f3eb995e18149e119d1ce22fd40db2b260c5960b914e","impliedFormat":1},{"version":"3b414b99a73171e1c4b7b7714e26b87d6c5cb03d200352da5342ab4088a54c85","impliedFormat":1},{"version":"4fbd3116e00ed3a6410499924b6403cc9367fdca303e34838129b328058ede40","impliedFormat":1},{"version":"9c82171d836c47486074e4ca8e059735bf97b205e70b196535b5efd40cbe1bc5","impliedFormat":1},{"version":"48dcc919f76c040a999c0d46d2bf25ab089645ca21b837f120b222f56a86cd76","impliedFormat":1},{"version":"2f9c89cbb29d362290531b48880a4024f258c6033aaeb7e59fbc62db26819650","impliedFormat":1},{"version":"c5426dbfc1cf90532f66965a7aa8c1136a78d4d0f96d8180ecbfc11d7722f1a5","impliedFormat":1},{"version":"65a15fc47900787c0bd18b603afb98d33ede930bed1798fc984d5ebb78b26cf9","impliedFormat":1},{"version":"9d202701f6e0744adb6314d03d2eb8fc994798fc83d91b691b75b07626a69801","impliedFormat":1},{"version":"de9d2df7663e64e3a91bf495f315a7577e23ba088f2949d5ce9ec96f44fba37d","impliedFormat":1},{"version":"c7af78a2ea7cb1cd009cfb5bdb48cd0b03dad3b54f6da7aab615c2e9e9d570c5","impliedFormat":1},{"version":"1ee45496b5f8bdee6f7abc233355898e5bf9bd51255db65f5ff7ede617ca0027","impliedFormat":1},{"version":"2352f74bc51c0e2c36f3fe406986dd4d0b1385faae349507403517d75bc2be8f","affectsGlobalScope":true,"impliedFormat":1},{"version":"3fbdd025f9d4d820414417eeb4107ffa0078d454a033b506e22d3a23bc3d9c41","affectsGlobalScope":true,"impliedFormat":1},{"version":"dba114fb6a32b355a9cfc26ca2276834d72fe0e94cd2c3494005547025015369","impliedFormat":1},{"version":"a8f8e6ab2fa07b45251f403548b78eaf2022f3c2254df3dc186cb2671fe4996d","affectsGlobalScope":true,"impliedFormat":1},{"version":"fa6c12a7c0f6b84d512f200690bfc74819e99efae69e4c95c4cd30f6884c526e","impliedFormat":1},{"version":"f1c32f9ce9c497da4dc215c3bc84b722ea02497d35f9134db3bb40a8d918b92b","impliedFormat":1},{"version":"b73c319af2cc3ef8f6421308a250f328836531ea3761823b4cabbd133047aefa","affectsGlobalScope":true,"impliedFormat":1},{"version":"e433b0337b8106909e7953015e8fa3f2d30797cea27141d1c5b135365bb975a6","impliedFormat":1},{"version":"9f9bb6755a8ce32d656ffa4763a8144aa4f274d6b69b59d7c32811031467216e","impliedFormat":1},{"version":"5c32bdfbd2d65e8fffbb9fbda04d7165e9181b08dad61154961852366deb7540","impliedFormat":1},{"version":"ddff7fc6edbdc5163a09e22bf8df7bef75f75369ebd7ecea95ba55c4386e2441","impliedFormat":1},{"version":"0c05e9842ec4f8b7bfebfd3ca61604bb8c914ba8da9b5337c4f25da427a005f2","impliedFormat":1},{"version":"67c2f945a841d2d15e96ee2b24841c38c7699d71bd33d6ae4bbe6eb0f3017dce","impliedFormat":1},{"version":"115457fedf74d22765b39e3edec4bc292ddd3c5f5457bf26a03d2f13a60a3ee0","impliedFormat":1},{"version":"036c8aa095343338b51d319022cdcbe38f0af122623f78aad845237036c4bae8","impliedFormat":1},{"version":"5245b69dc79a7479e5ab458e48d8736acde868efe7fb77adf283c6a738fdf614","impliedFormat":1},{"version":"61265d88af5048c8ce9298b6443d59d9d8a2a1ff603114f0f9d87d9e75deaa1d","impliedFormat":1},{"version":"9dc6783d6463734d933bf58644dcf6cc535db0b148bbe0ee0064228be6b4dc0b","impliedFormat":1},{"version":"d96b39301d0ded3f1a27b47759676a33a02f6f5049bfcbde81e533fd10f50dcb","impliedFormat":1},{"version":"100fd6ffe4bec5b9a77274496a5227faf294656db85067a196622d319d6fbb9f","impliedFormat":1},{"version":"76372ba82b5b1c3b6f29bfc23850a2addd735b36ba1f57e62d4ed76921fe1f1f","impliedFormat":1},{"version":"d0a1273dab41e96ebd2b291fab785e661fcf89173b605a70fe061fc21ada193c","impliedFormat":1},{"version":"6506de5a42d7bc337904c55d2a1dffcc1e3c0633889229402856aa1578c01666","impliedFormat":1},{"version":"36c68bb0319a8c160a7423607cc90f383f93eda550839fb9e5c2382499c82575","impliedFormat":1},{"version":"aaecf377e26c5beb7d279eccf4477813da24d3070542239d934c2e9795d310c2","impliedFormat":1},{"version":"2e4f37ffe8862b14d8e24ae8763daaa8340c0df0b859d9a9733def0eee7562d9","impliedFormat":1},{"version":"d38530db0601215d6d767f280e3a3c54b2a83b709e8d9001acb6f61c67e965fc","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"b499af2054a037a162b3b72cd886f48bbf32a3502c865c6e29fac7d2ab3ce0b5","impliedFormat":1},{"version":"b83cb14474fa60c5f3ec660146b97d122f0735627f80d82dd03e8caa39b4388c","impliedFormat":1},{"version":"8e32dbb4b6c849d57a5f05963fb00def58507eda37b8ca726682c337d0c27cca","impliedFormat":1},{"version":"7274fbffbd7c9589d8d0ffba68157237afd5cecff1e99881ea3399127e60572f","impliedFormat":1},{"version":"b73cbf0a72c8800cf8f96a9acfe94f3ad32ca71342a8908b8ae484d61113f647","impliedFormat":1},{"version":"bae6dd176832f6423966647382c0d7ba9e63f8c167522f09a982f086cd4e8b23","impliedFormat":1},{"version":"20865ac316b8893c1a0cc383ccfc1801443fbcc2a7255be166cf90d03fac88c9","impliedFormat":1},{"version":"c9958eb32126a3843deedda8c22fb97024aa5d6dd588b90af2d7f2bfac540f23","impliedFormat":1},{"version":"461d0ad8ae5f2ff981778af912ba71b37a8426a33301daa00f21c6ccb27f8156","impliedFormat":1},{"version":"e927c2c13c4eaf0a7f17e6022eee8519eb29ef42c4c13a31e81a611ab8c95577","impliedFormat":1},{"version":"fcafff163ca5e66d3b87126e756e1b6dfa8c526aa9cd2a2b0a9da837d81bbd72","impliedFormat":1},{"version":"70246ad95ad8a22bdfe806cb5d383a26c0c6e58e7207ab9c431f1cb175aca657","impliedFormat":1},{"version":"f00f3aa5d64ff46e600648b55a79dcd1333458f7a10da2ed594d9f0a44b76d0b","impliedFormat":1},{"version":"772d8d5eb158b6c92412c03228bd9902ccb1457d7a705b8129814a5d1a6308fc","impliedFormat":1},{"version":"802e797bcab5663b2c9f63f51bdf67eff7c41bc64c0fd65e6da3e7941359e2f7","impliedFormat":1},{"version":"b01bd582a6e41457bc56e6f0f9de4cb17f33f5f3843a7cf8210ac9c18472fb0f","impliedFormat":1},{"version":"8b4327413e5af38cd8cb97c59f48c3c866015d5d642f28518e3a891c469f240e","impliedFormat":1},{"version":"4cceef18d7f088e797a463e90b7a9dad10c6bc667724b7686e3e740ae00122be","impliedFormat":1},{"version":"7ee86fbb3754388e004de0ef9e6505485ddfb3be7640783d6d015711c03d302d","impliedFormat":1},{"version":"f8647078da50b446b99ceb9978f45176cda89cce07c62ec2d42cc001b5becc1c","impliedFormat":1},{"version":"a67b87d0281c97dfc1197ef28dfe397fc2c865ccd41f7e32b53f647184cc7307","impliedFormat":1},{"version":"6bbf33947658770121ce0afa44828e1ea9294b1e6c4c7984c0f6da7cc5c53216","impliedFormat":1},{"version":"ebb8af215c7d449add233d33aae1ae80eadf70d3b1e333c55ee09e6dd9181781","impliedFormat":1},{"version":"1bab48faa2e3426331252b77c63f5118307586eeeffc8608274848c10ddda25a","impliedFormat":1},{"version":"d88ea80a6447d7391f52352ec97e56b52ebec934a4a4af6e2464cfd8b39c3ba8","impliedFormat":1},{"version":"51e3224b75ad7b7c4a81c06f61bff8183bee782ac68e8a6d46c56d75540ab7c4","impliedFormat":1},{"version":"0b603555f1881f87256ffd6344d3e3ed6d466c2e701eabf381f28be8c2125892","impliedFormat":1},{"version":"897e4f7662488e3ecc79e743bdd3b78f13bdb69a97851afa5b440c4211e32ea9","impliedFormat":1},{"version":"e2e1c6d3b2d93add5200bd7bc1a8cccb4e446836b2111ece45db8683a2c765de","impliedFormat":1},{"version":"8c2e1ebaafd7328ead715fdcb7b20edd298e42f4ecf52590956aea427500fe51","impliedFormat":1},{"version":"27ff4196654e6373c9af16b6165120e2dd2169f9ad6abb5c935af5abd8c7938c","impliedFormat":1},{"version":"bb8f2dbc03533abca2066ce4655c119bff353dd4514375beb93c08590c03e023","impliedFormat":1},{"version":"2c4de79f406d137390608e8c0a44fba2ff8e00bacfcae7c9d1781fef10e9440d","impliedFormat":1},{"version":"dad21634c57f7bd554d29a890c1b802544bc8906d9584a61d41c7ff8f191ab15","impliedFormat":1},{"version":"bbb4a08132d0aba7f5a6af74aba6a3c149970afb6ae2792eec1a6af0e87cf590","impliedFormat":1},{"version":"15d87d8f5dae7e0ba772297a455b264d4b657653b0a50bdacd383469b759da02","impliedFormat":1},{"version":"232f70c0cf2b432f3a6e56a8dc3417103eb162292a9fd376d51a3a9ea5fbbf6f","impliedFormat":1},{"version":"706dd95827e7ebaabda91d5db2b755233e0952d98570e9c032b0f066a15c1177","affectsGlobalScope":true,"impliedFormat":1},{"version":"0b103e9abfe82d14c0ad06a55d9f91d6747154ef7cacc73cf27ecad2bfb3afcf","impliedFormat":1},{"version":"b1c2db8e7f803e0e1af3c0cb22705ace4ec52fc7a7d68c5c1016d0501ab4a328","impliedFormat":1},{"version":"218b13bb77ff5557caaf5b1e67604d5a3fd6930ede939d14dada9b4c6fd1d221","impliedFormat":1},{"version":"120599fd965257b1f4d0ff794bc696162832d9d8467224f4665f713a3119078b","impliedFormat":1},{"version":"43ba4f2fa8c698f5c304d21a3ef596741e8e85a810b7c1f9b692653791d8d97a","impliedFormat":1},{"version":"5433f33b0a20300cca35d2f229a7fc20b0e8477c44be2affeb21cb464af60c76","impliedFormat":1},{"version":"db036c56f79186da50af66511d37d9fe77fa6793381927292d17f81f787bb195","impliedFormat":1},{"version":"a6805fcafed712aea7759f8bc731014f9d22738c1d6ef9d43b8091d1d48346d5","impliedFormat":1},{"version":"775f181bd4a533d6f8b5e55ec1d9f1624559720ae8a70e9432258da26b38d27c","impliedFormat":1},{"version":"796273b2edc72e78a04e86d7c58ae94d370ab93a0ddf40b1aa85a37a1c29ecd7","impliedFormat":1},{"version":"5df15a69187d737d6d8d066e189ae4f97e41f4d53712a46b2710ff9f8563ec9f","impliedFormat":1},{"version":"4fb3dafb3267bf8c19a6b2a1e4d9f79b9d64cd33febf8abd1642fcfa995140e7","impliedFormat":1},{"version":"6ac6715916fa75a1f7ebdfeacac09513b4d904b667d827b7535e84ff59679aff","impliedFormat":1},{"version":"9c7715de1326710dc72578a58f92c208268d5b91105db0845d86a2c68448a45a","impliedFormat":1},{"version":"cd8ce8d68567f62dd580b3c3c37777ac3f5b81944c7417f5ea83030eab533385","impliedFormat":1},{"version":"898338d9e4b3b583b0e0fef52e68a50509fc7ead2d766c35330ea7f5ce2a59f5","impliedFormat":1},{"version":"9e2739b32f741859263fdba0244c194ca8e96da49b430377930b8f721d77c000","impliedFormat":1},{"version":"a9e6c0ff3f8186fccd05752cf75fc94e147c02645087ac6de5cc16403323d870","impliedFormat":1},{"version":"49af4b52f0d4d2304c5f2c6fe5fab3e153e0acc38830d0202821b877c097dd02","impliedFormat":1},{"version":"49c346823ba6d4b12278c12c977fb3a31c06b9ca719015978cb145eb86da1c61","impliedFormat":1},{"version":"bfac6e50eaa7e73bb66b7e052c38fdc8ccfc8dbde2777648642af33cf349f7f1","impliedFormat":1},{"version":"92f7c1a4da7fbfd67a2228d1687d5c2e1faa0ba865a94d3550a3941d7527a45d","impliedFormat":1},{"version":"f53b120213a9289d9a26f5af90c4c686dd71d91487a0aa5451a38366c70dc64b","impliedFormat":1},{"version":"e68b8e5a1df7c1be2bc105141456ecba70215806e1c28bfbc5c12bfce4be6e68","impliedFormat":1},{"version":"a44ed6e5de4d6baa5d269f6e256c41fae69f47b9bf8b269ce0c7fe8b201ac130","impliedFormat":1},{"version":"57d67b72e06059adc5e9454de26bbfe567d412b962a501d263c75c2db430f40e","impliedFormat":1},{"version":"6db920eb76bc2f044dd32b36288a99298d60ab9747af38a3750ef27a319ed45b","impliedFormat":1},{"version":"243ae05c3426b4178fa05932626e742e0bc695e27f1fe4160cc1d15cd21cbf69","impliedFormat":1},{"version":"6459054aabb306821a043e02b89d54da508e3a6966601a41e71c166e4ea1474f","impliedFormat":1},{"version":"bb37588926aba35c9283fe8d46ebf4e79ffe976343105f5c6d45f282793352b2","impliedFormat":1},{"version":"f89488602bec98a142072fae7ea5ba99431a569ff580c64b7be39896474799d8","impliedFormat":1},{"version":"bbbc47961f39a57df103cf4ca3bb8f8732b4b6678a18225a0aa76d59c466956c","impliedFormat":1},{"version":"2e6114a7dd6feeef85b2c80120fdbfb59a5529c0dcc5bfa8447b6996c97a69f5","impliedFormat":1},{"version":"2ffb043dc5163458e473b7010859f86e01dc4edffcae0a93d885d028b426a546","impliedFormat":1},{"version":"c8f004e6036aa1c764ad4ec543cf89a5c1893a9535c80ef3f2b653e370de45e6","impliedFormat":1},{"version":"dd80b1e600d00f5c6a6ba23f455b84a7db121219e68f89f10552c54ba46e4dc9","impliedFormat":1},{"version":"b064c36f35de7387d71c599bfcf28875849a1dbc733e82bd26cae3d1cd060521","impliedFormat":1},{"version":"05c7280d72f3ed26f346cbe7cbbbb002fb7f15739197cbbee6ab3fd1a6cb9347","impliedFormat":1},{"version":"8de9fe97fa9e00ec00666fa77ab6e91b35d25af8ca75dabcb01e14ad3299b150","impliedFormat":1},{"version":"04b7b2e0832dfd3c31e81df3975e8d8fda28e7ff999b0aa2932608a8f6661d5c","impliedFormat":1},{"version":"ade4bcded5ae1610dcdef8a98668fa7ca41064c5ace9a49c1f78993ff3c3b6ae","impliedFormat":1},{"version":"c605ac51446efce34a0d4db764b4e6d4adf70d5e16e833ef99de12b7b7760823","impliedFormat":1},{"version":"5c4d626b4902f2ef8a1cc146d761d276cef988016dc674e3b98fbad70e64bc9f","impliedFormat":1},{"version":"abd5b0b9a913d5e809064dc5af3177702e5626d5423a690ad0711f62b6da3dfa","impliedFormat":1},{"version":"f09538129123053bc778452a43b25446ba6f8dec65118fc0bb82fca53fca9bf8","impliedFormat":1},{"version":"f974e4a06953682a2c15d5bd5114c0284d5abf8bc0fe4da25cb9159427b70072","impliedFormat":1},{"version":"50256e9c31318487f3752b7ac12ff365c8949953e04568009c8705db802776fb","impliedFormat":1},{"version":"7d73b24e7bf31dfb8a931ca6c4245f6bb0814dfae17e4b60c9e194a631fe5f7b","impliedFormat":1},{"version":"9917f2694799516bf571e62e4b76cfcb22df50a74335302223e10e839c01c60c","impliedFormat":1},{"version":"413586add0cfe7369b64979d4ec2ed56c3f771c0667fbde1bf1f10063ede0b08","impliedFormat":1},{"version":"5d5179db368664843aca3825b6e7ffa69f47cbe3f138b543fb20dba48dbab4d8","impliedFormat":1},{"version":"7303b45138d2511035056a5901a1490ebdcbf055cbb1276f8629c5121cbe733e","impliedFormat":1},{"version":"47bf8f46d61fa63278a5d10630f6bd7063394bb69284e484c61b352ebe0d8e6e","impliedFormat":1},{"version":"40b084057d65a340263757fe0b08217422e02f42ae70236e74a8042b3e1eab1e","impliedFormat":1},{"version":"46e48e65148cc2afd03fad660f54cb5705ace4c45e80aace208ed7833a96f404","impliedFormat":1},{"version":"b0fb2e6b4a7b366ae1a7a441ef27586e5a8f480b48583b644c2e16fa3537ac5d","impliedFormat":1},{"version":"c7be836e57d8250946c5c6c17c4ed5bdede19933ebdcbcf5c880f083c78e3871","impliedFormat":1},{"version":"efcce61e435bbf26e26a95115cf1313a0d236937b8be3854d7975fa9b75b12e3","affectsGlobalScope":true,"impliedFormat":1},{"version":"72b0ced59987170ebaa22b5fe0fa205437809b94c6d6e9e1ffd94ca5bb9c62b2","affectsGlobalScope":true,"impliedFormat":1},{"version":"ab7dfff19354646b5dd29676783546c81498f8289f679650f9e612f49f8481f0","impliedFormat":1},{"version":"9dfde20de9ff2fac31c1317b9a14f5b83690aea715adca8820407f1302a7d186","impliedFormat":1},{"version":"74eca395ab8ca0411b94a9fb37afb288436a8117965aa7b48ba07fcd024087f8","impliedFormat":1},{"version":"4f58011d28e315f844e72bc05c1a35416a467f09ac8fb49d5ed90114569bc283","impliedFormat":1},{"version":"ecf51081d23a86d2e961b5890562e48b0043a5500d251ec155aba3e97d5db3f6","impliedFormat":1},{"version":"d663134457d8d669ae0df34eabd57028bddc04fc444c4bc04bc5215afc91e1f4","impliedFormat":1},{"version":"103c58438e43570fb39bc14944f6773b836526043f519414f8e6570427e663be","impliedFormat":1},{"version":"da1bc1be19354bc4712aa812f103975b40c663ba99fc58d4f17491714d594e0d","impliedFormat":1},{"version":"1a82deef4c1d39f6882f28d275cad4c01f907b9b39be9cbc472fcf2cf051e05b","impliedFormat":1},{"version":"c8e7690654991ceb5b476c2eed7ea526403e26bb7e62113250ff6cb41df76511","impliedFormat":1},{"version":"e0cee12109e0a10a4c3d6769fcc7644b7c1ea7f52365bea51728f5af29f8a137","impliedFormat":1},{"version":"7d4254b4c6c67a29d5e7f65e67d72540480ac2cfb041ca484847f5ae70480b62","impliedFormat":1},{"version":"3536968defef8a75514f547ead5e2e9c1e984820290ec9b00c5fdfb6ef786535","impliedFormat":1},{"version":"d83773870080c30a230e322ce13a9c6f3398e8dacea4ea8a83e26370f3bac23e","impliedFormat":1},{"version":"1822b02aa6421ad770f1003fb9b9cce97694d0168fedc5de3712915ee2825184","impliedFormat":1},{"version":"f97020f048bcad55177284c547c020e0c0d3af7cc32a588ab436bf32e33493ae","impliedFormat":1},{"version":"c9df081660108cfec15ea7c7467e180a7993cc26966373e1da5986151fae9292","impliedFormat":1},{"version":"0a437ae178f999b46b6153d79095b60c42c996bc0458c04955f1c996dc68b971","impliedFormat":1},{"version":"74b2a5e5197bd0f2e0077a1ea7c07455bbea67b87b0869d9786d55104006784f","impliedFormat":1},{"version":"4a7baeb6325920044f66c0f8e5e6f1f52e06e6d87588d837bdf44feb6f35c664","impliedFormat":1},{"version":"87cc05fe13108f02e12da7e3efd8e360fef78d96a0c9e11408ea1b1b9fb3e03d","impliedFormat":1},{"version":"60681e13f3545be5e9477acb752b741eae6eaf4cc01658a25ec05bff8b82a2ef","impliedFormat":1},{"version":"3ca55d3682dfb90ff521f98850a433646d3d69f3a836f8ff27f2b450a9bd0bf4","impliedFormat":1},{"version":"a57b1802794433adec9ff3fed12aa79d671faed86c49b09e02e1ac41b4f1d33a","impliedFormat":1},{"version":"34e16eb7c31768a11a08aebcfb3d70d7b8f0b016197e98d8419e566ceae6d6c8","impliedFormat":1},{"version":"5e17c6748e336bdf5a83eef55499c4a09ac20ef7e8ac533411dd0e97d23d3ccf","impliedFormat":1},{"version":"5f3820872e54f04cc7d1ed5833aa91c5d45f72d6c82787d03590388063641887","impliedFormat":1},{"version":"5541971ac5ca5a07fbf99b18d072960d29c06558c143e26fa3fd34eda1cd2604","impliedFormat":1},{"version":"bf6e368c991c772a8cfd766b1e5ca38313a98591d56b7467cc9942923b7ca375","impliedFormat":1},{"version":"27fc1b956bd89f524ce386c9c24fb2d13521893aeaece6271704a59c1a0bdf8b","impliedFormat":1},{"version":"eeee5b1c7b9393a1726dfe5f1c61571cd94b605ba7b0e679343d94403fb18d81","impliedFormat":1},{"version":"4402ddf37e9cf7a95e0c66eb47c4f3cb5ff7e31e988c3a45029f82d983b47d63","impliedFormat":1},{"version":"01479d9d5a5dda16d529b91811375187f61a06e74be294a35ecce77e0b9e8d6c","impliedFormat":1},{"version":"bfd922cd6c7e5404cb2beb99ab0be844b0440dc8ad220894ad32efb85db97bcd","impliedFormat":1},{"version":"a52429ff820c9878482940e2b7752e5b004e0f16635c0cefa2a8da473556201f","impliedFormat":1},{"version":"ce0df82a9ae6f914ba08409d4d883983cc08e6d59eb2df02d8e4d68309e7848b","impliedFormat":1},{"version":"649588d1787139707a4ee0ea5a7ac8a54d94c6d9823b15bbb28f18b79392e295","impliedFormat":1},{"version":"ff64fa5b9727f769066ac59eb42bdfe0931dbb61c9f42aecb3e0f412d0186f88","impliedFormat":1},{"version":"00e981b1c8e1499dfeb6003893f56c4b40dc386826dcc0227c9eb9425a7a3c7f","impliedFormat":1},{"version":"72105519d0390262cf0abe84cf41c926ade0ff475d35eb21307b2f94de985778","impliedFormat":1},{"version":"456006a6975b26c0a1785feddae165f6d307e2d601ffde27e21fc4a790e448a4","impliedFormat":1},{"version":"c857e0aae3f5f444abd791ec81206020fbcc1223e187316677e026d1c1d6fe08","impliedFormat":1},{"version":"ccf6dd45b708fb74ba9ed0f2478d4eb9195c9dfef0ff83a6092fa3cf2ff53b4f","impliedFormat":1},{"version":"1fe0d18b111e1145a7e7601855bccd4ca20f24e3b9a5aba6bb1fa9d1a7059170","impliedFormat":1},{"version":"5632c3c26d420c063eebe64c45b1248b9492a67bf44f1d0c57e9dc8f6cf449bb","impliedFormat":1},{"version":"4c536efd581b2109005df14e670ffbf799dea8731b33db3fd2c3ab655b4eafc6","impliedFormat":1},{"version":"8fca3039857709484e5893c05c1f9126ab7451fa6c29e19bb8c2411a2e937345","impliedFormat":1},{"version":"35069c2c417bd7443ae7c7cafd1de02f665bf015479fec998985ffbbf500628c","impliedFormat":1},{"version":"1a41f92c8593f4639b2e11762df152cb7e5b72f9bb5324158207d3278be73b2a","impliedFormat":1},{"version":"79698c679c34d3836789ee51ccb5984e0697664d3a4572cb76736a6d4b429cd3","impliedFormat":1},{"version":"7e0b7f91c5ab6e33f511efc640d36e6f933510b11be24f98836a20a2dc914c2d","impliedFormat":1},{"version":"045b752f44bf9bbdcaffd882424ab0e15cb8d11fa94e1448942e338c8ef19fba","impliedFormat":1},{"version":"c096c3c58933c3ecd67ff94335f11b9abfc8405a89d9d3e2552223aee3eaac88","impliedFormat":1},{"version":"2894c56cad581928bb37607810af011764a2f511f575d28c9f4af0f2ef02d1ab","impliedFormat":1},{"version":"0a72186f94215d020cb386f7dca81d7495ab6c17066eb07d0f44a5bf33c1b21a","impliedFormat":1},{"version":"8047e76600d42d495952c1c8a16d0a51c8681bd8996524a8b0e9c9065c8e7066","impliedFormat":1},{"version":"10b2c5fc764c6dc12b9e022b178b4ff41a08733074b376611578e34a8f79a2e8","impliedFormat":1},{"version":"3b958309a72d9b99300d585fdc69f23f03df4caa424cf7007bafdacc0d2366f9","affectsGlobalScope":true,"impliedFormat":1},{"version":"c6e51008cf8190894ff2fc8e672273bf950d246084a03bfb7c3a274fa810c2d9","impliedFormat":1},{"version":"b213dad76ca37fd552274c9499056e1c0d9c1bd38a55bb7f68b22ba6b84c3ad7","impliedFormat":1},{"version":"c30436b130b6218b7714314dc41d3f459590db4bdf099eecd51cb1bda32109a8","impliedFormat":1},{"version":"b838d4c72740eb0afd284bf7575b74c624b105eff2e8c7b4aeead57e7ac320ff","impliedFormat":1},{"version":"20fa37b636fdcc1746ea0738f733d0aed17890d1cd7cb1b2f37010222c23f13e","impliedFormat":1},{"version":"d90b9f1520366d713a73bd30c5a9eb0040d0fb6076aff370796bc776fd705943","impliedFormat":1},{"version":"bef86adb77316505c6b471da1d9b8c9e428867c2566270e8894d4d773a1c4dc2","impliedFormat":1},{"version":"d8a770e32e4da593ddda3ac6370ef644cd977be8f4057ecf3d703cc7745ee4ab","impliedFormat":1},{"version":"6ee598cdfdd0fa52039dca135b3dfff7b49035dc13292143e0a93843e3861967","impliedFormat":1},{"version":"27be6622e2922a1b412eb057faa854831b95db9db5035c3f6d4b677b902ab3b7","impliedFormat":1},{"version":"5c634644d45a1b6bc7b05e71e05e52ec04f3d73d9ac85d5927f647a5f965181a","impliedFormat":1},{"version":"5bd12e52bdd0135ed15e1584e0e4206591ddea86a92b0c76d7851a0b09462f8e","impliedFormat":1},{"version":"63a7595a5015e65262557f883463f934904959da563b4f788306f699411e9bac","impliedFormat":1},{"version":"4ba137d6553965703b6b55fd2000b4e07ba365f8caeb0359162ad7247f9707a6","impliedFormat":1},{"version":"0b77b819b5417775fccb20c678293cf614c054a5b1a65421a5b933a9124ba998","impliedFormat":1},{"version":"5666d5734e5152a1e79dd2df5a68531e522bdc4654e06739b2fb799b86367567","impliedFormat":1},{"version":"9252d498a77517aab5d8d4b5eb9d71e4b225bbc7123df9713e08181de63180f6","impliedFormat":1},{"version":"ef8b9028d751f291df91ebb3e5b1a6607fa99dcfe64563b7e85a9b22034b60fa","impliedFormat":1},{"version":"ce11568d7135fbe99854aa6088b327f9e4c234707c94c4e91e1a52919a881bcf","impliedFormat":1},{"version":"b1f1d57fde8247599731b24a733395c880a6561ec0c882efaaf20d7df968c5af","impliedFormat":1},{"version":"de4b52839326d274a30022a82f8586e19a657d4a21a95fd5322347733ee69885","impliedFormat":1},{"version":"c86fe861cf1b4c46a0fb7d74dffe596cf679a2e5e8b1456881313170f092e3fa","impliedFormat":1},{"version":"540cc83ab772a2c6bc509fe1354f314825b5dba3669efdfbe4693ecd3048e34f","impliedFormat":1},{"version":"121b0696021ab885c570bbeb331be8ad82c6efe2f3b93a6e63874901bebc13e3","impliedFormat":1},{"version":"612d9da66bb046a9c1e2e8d026245ded881fc4b9f98cbfae714415d57ee0ae0b","impliedFormat":1},{"version":"32c2ad9494dad5d11b0564a619fee18f388db6c1e9e2cd3c360b3122549691eb","impliedFormat":1},{"version":"1abbf67c218d23c2ce76887caac2df6c7dab3d97ba2b65348432b876f510002a","impliedFormat":1},{"version":"4b20fcf10a5413680e39f5666464859fc56b1003e7dfe2405ced82371ebd49b6","impliedFormat":1},{"version":"c06ef3b2569b1c1ad99fcd7fe5fba8d466e2619da5375dfa940a94e0feea899b","impliedFormat":1},{"version":"f7d628893c9fa52ba3ab01bcb5e79191636c4331ee5667ecc6373cbccff8ae12","impliedFormat":1},{"version":"2467b00d963828f540f4acd7910f4c04cfe4b489550e6bb682212f65583bca5b","impliedFormat":1},{"version":"a68f36dc8c71757c01f7b0a32333997f510dd61a2de0a3ae1ac23072c368ec37","impliedFormat":99},{"version":"416c3250d0f78e396c76ddee847e968a7e0edf46c159e3996d99ecfc3b7f069a","impliedFormat":1},{"version":"a6dba407fc287f1e25454e75028c91bbc00675f2d1c4e8b3edcc36c08611a486","impliedFormat":1},{"version":"43003214ab539d7b34b11259b86e41c5c361929472ba2ce95a327922090eb17a","impliedFormat":1},{"version":"9ec11a9084111c6caeac336b4a2fd3ec0086b32d21409a33a2af3ea66d9b85b0","impliedFormat":1},{"version":"700b7bfceda84ab84ddc75ed540247c62568f240d5d5bea4c9352b8f7e148a12","impliedFormat":1},{"version":"6115297fd1e00c450f1456d84c30453c6aefc38690b530d7d31393e361c33050","impliedFormat":1},{"version":"360fe40be059e5206b565f91e130ac2768169b06ecd714f982b0ef4c602e96cd","impliedFormat":1},{"version":"dba74745294baf7b83a2531303b56b4c3824b91a71cbac16dd501ecd2f6d96d3","affectsGlobalScope":true,"impliedFormat":1},{"version":"e8daa443eaf9a27fd382cc1f8ebe30330c0f4d89511cfb469166874806751d35","impliedFormat":1},{"version":"fcbfb0670d0a9fd2edca0705a1bc421773d58035a312216291fc64903e327a6c","impliedFormat":1},{"version":"1640728521f6ab040fc4a85edd2557193839d0cd0e41c02004fc8d415363d4e2","impliedFormat":1},{"version":"65c24a8baa2cca1de069a0ba9fba82a173690f52d7e2d0f1f7542d59d5eb4db0","impliedFormat":1},{"version":"f9fe6af238339a0e5f7563acee3178f51db37f32a2e7c09f85273098cee7ec49","impliedFormat":1},{"version":"d748648024504c3ddb46411e310b4c69050b8a695e0e1982683bf5594d5a2d8b","impliedFormat":1},{"version":"77e71242e71ebf8528c5802993697878f0533db8f2299b4d36aa015bae08a79c","impliedFormat":1},{"version":"043b4931cc88f57ad36d9cb9d11ff7f688ceded5ea90bfef50f812fdd625e449","impliedFormat":1},{"version":"98a787be42bd92f8c2a37d7df5f13e5992da0d967fab794adbb7ee18370f9849","impliedFormat":1},{"version":"bd4c4556a30a24c353ec3aab92f2fa9517a83fae02370bad181d784a723a718b","impliedFormat":1},{"version":"26f8627d501decb20e9494ee1d9a7eb27c21e9b50df506aae1fe1ad3f9b11aa0","impliedFormat":1},{"version":"4545c1a1ceca170d5d83452dd7c4994644c35cf676a671412601689d9a62da35","impliedFormat":1},{"version":"320f4091e33548b554d2214ce5fc31c96631b513dffa806e2e3a60766c8c49d9","impliedFormat":1},{"version":"a2d648d333cf67b9aeac5d81a1a379d563a8ffa91ddd61c6179f68de724260ff","impliedFormat":1},{"version":"ec2804a1343f9af99b504838771f77a92cc756ee564c4df3df67cee0ebccc292","impliedFormat":1},{"version":"07a86ec5e70855b9fb5ed27f6a7a84d3ba3f63ba521c9e3cf2ea53ad8484a46a","impliedFormat":1},{"version":"d7bcbc84a8a0137869fbb37985d21d0fbf1d9903e1afbe692577302d865fba60","impliedFormat":1},{"version":"1b16beb8414a7abf9e9d82c0df4d5f2ec6c17fac3fb7d6185004ae506d034651","impliedFormat":1},{"version":"153a111b813b430aaa37a352abc884f0434665c9a6b6b3a4deb1ecaf3a74e17a","impliedFormat":1},{"version":"47699512e6d8bebf7be488182427189f999affe3addc1c87c882d36b7f2d0b0e","impliedFormat":1},{"version":"6ceb10ca57943be87ff9debe978f4ab73593c0c85ee802c051a93fc96aaf7a20","impliedFormat":1},{"version":"1de3ffe0cc28a9fe2ac761ece075826836b5a02f340b412510a59ba1d41a505a","impliedFormat":1},{"version":"e46d6cc08d243d8d0d83986f609d830991f00450fb234f5b2f861648c42dc0d8","impliedFormat":1},{"version":"1c0a98de1323051010ce5b958ad47bc1c007f7921973123c999300e2b7b0ecc0","impliedFormat":1},{"version":"ff863d17c6c659440f7c5c536e4db7762d8c2565547b2608f36b798a743606ca","impliedFormat":1},{"version":"fb8b0045bf577879db8f7b16426f7728862b820c0372506c78c79d384781026a","impliedFormat":1},{"version":"fc85587d32e46b46e698053316f16472d7e2e78bf45d177b47dae651f3891aaa","impliedFormat":1},{"version":"ad036a85efcd9e5b4f7dd5c1a7362c8478f9a3b6c3554654ca24a29aa850a9c5","impliedFormat":1},{"version":"fedebeae32c5cdd1a85b4e0504a01996e4a8adf3dfa72876920d3dd6e42978e7","impliedFormat":1},{"version":"e297c0a524edee7677939122f90027bfbe5f2698939d9a85728e5044b39c7124","impliedFormat":1},{"version":"cdf21eee8007e339b1b9945abf4a7b44930b1d695cc528459e68a3adc39a622e","impliedFormat":1},{"version":"bc9ee0192f056b3d5527bcd78dc3f9e527a9ba2bdc0a2c296fbc9027147df4b2","impliedFormat":1},{"version":"cdcb96ffdab6204c3ded7f53ff8a3e730c3689eb83f8b2eb065287bfa8e7b1f0","impliedFormat":1},{"version":"1d9c0a9a6df4e8f29dc84c25c5aa0bb1da5456ebede7a03e03df08bb8b27bae6","impliedFormat":1},{"version":"84380af21da938a567c65ef95aefb5354f676368ee1a1cbb4cae81604a4c7d17","impliedFormat":1},{"version":"1af3e1f2a5d1332e136f8b0b95c0e6c0a02aaabd5092b36b64f3042a03debf28","impliedFormat":1},{"version":"09d8a449a9f38eefc0383f6e08c52cefe471943d99cc3c2242a21c02235b6dcd","impliedFormat":1},{"version":"41eb514d9ce0a6e87957f08a4b7af70d93f87637f37dee706e2d92a6601c25a9","impliedFormat":1},{"version":"e7765aa8bcb74a38b3230d212b4547686eb9796621ffb4367a104451c3f9614f","impliedFormat":1},{"version":"1de80059b8078ea5749941c9f863aa970b4735bdbb003be4925c853a8b6b4450","impliedFormat":1},{"version":"1d079c37fa53e3c21ed3fa214a27507bda9991f2a41458705b19ed8c2b61173d","impliedFormat":1},{"version":"5bf5c7a44e779790d1eb54c234b668b15e34affa95e78eada73e5757f61ed76a","impliedFormat":1},{"version":"5835a6e0d7cd2738e56b671af0e561e7c1b4fb77751383672f4b009f4e161d70","impliedFormat":1},{"version":"4b7f74b772140395e7af67c4841be1ab867c11b3b82a51b1aeb692822b76c872","impliedFormat":1},{"version":"7bd01f0f28cd3aeb2046274d85208e245965f6f2948edf4f7b2057bcf9f22ccc","impliedFormat":99},{"version":"d2f2cf2b8cc92bea913cda4a076e0f790b23a21e84f989d12f0116a7fe3906e0","impliedFormat":99},{"version":"6de125ea94866c736c6d58d68eb15272cf7d1020a5b459fea1c660027eca9a90","affectsGlobalScope":true,"impliedFormat":1},{"version":"7caf3c4129eb3eadfa1a6033206d56145984ebbd46ada269509bcb64d508b9c1","affectsGlobalScope":true,"impliedFormat":1},{"version":"064ac1c2ac4b2867c2ceaa74bbdce0cb6a4c16e7c31a6497097159c18f74aa7c","impliedFormat":1},{"version":"3dc14e1ab45e497e5d5e4295271d54ff689aeae00b4277979fdd10fa563540ae","impliedFormat":1},{"version":"d3b315763d91265d6b0e7e7fa93cfdb8a80ce7cdd2d9f55ba0f37a22db00bdb8","impliedFormat":1},{"version":"b789bf89eb19c777ed1e956dbad0925ca795701552d22e68fd130a032008b9f9","impliedFormat":1},{"version":"3e84e0b82273000ef1b1201e1aff52ba2971a9ac4f5d6a4e9052bde34a8c7f6c","affectsGlobalScope":true},"f3387dd7800eec3c34273f7a8efad13e864598c7e8f788d321e407390989bb59","1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b",{"version":"e4d2ad36d7236894dd38bce01519fcc58d149d4fd290b985084e56fbb317922a","signature":"435a1e418e8338be3f39614b96b81a9aa2700bc8c27bc6b98f064ff9ce17c363"},{"version":"11aa7932d63a20d0ddabd8b84f251a6e228f09ce332779059ea9699f6e48fc4b","signature":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881"},{"version":"17e6eed6066304fcb6b2ce12fc71c2e2695439b18e939e050617f96f0eba5904","signature":"44603f5794adbebd05ab8e83c96f5766abae219084776fc58528791a068a14a6"},{"version":"51e63016f632f6b2917ca5f001b6fdc562f9b223aa70aeefa75da1884ff3b0bc","signature":"003ae97436767604683c379f7cb17c6816b86d3a7b38fe2195c379e95e3a09ab"},{"version":"868be89df4085d13ec9423f5a551811af7408ce9f3688a97078fc2a4012c77de","signature":"4c9e894bc7029fc11b3df008089827286b1b5f687ed6c295a8b9717fabfd5754"},{"version":"c1c17eb9eacdb71ea076083d24c070e9f112712c97950c5d1079b34e627a4bc9","impliedFormat":99},{"version":"cfccade8c719b698bd8b0313ff996941f5d5a384654ec2886d9141224f6db439","impliedFormat":99},{"version":"f5ffc0d52997445b4531a0e1e67ee0f6f376e0ed5c66f978e80288973d50cd06","impliedFormat":99},{"version":"5b1c09cb23f0c1e7018d31d28f4eec2b18eec6454f07c0f69ff2eb3c8decdb21","impliedFormat":99},{"version":"a49b7fb69d355c80745c3586137f91088cf6143cc4a53ef3f2f9e1fbf2407ec5","impliedFormat":99},{"version":"3c13b0201a504980c88ff8f5c408cb5b20b51a8b9ddd65bb96886d562afb27d0","signature":"db7d7cfce8d1d510f7b9b26d17f17669482f84b50e6e46d2ebe313e7ecf112eb"},{"version":"2f6ac17376ef57e26b422be95b9af69901e1eaa1f26c621c847380f6511e1f4a","signature":"e344d262c21e9e427aeff5f8a612bdc54474c702582614b502cbd55847e4ba0d"},{"version":"4d412923d5727dafaa4d32534f05ec457f7c7bfc388f831b26cf2de8803be4de","impliedFormat":1},{"version":"c60b73a993b640adeb3b448253b4a0a4a530dc75336ba1f905e05d3064ad1b2c","impliedFormat":1},{"version":"620b95a3ced036829bf113884d13fa6a33530b574035f6c5e6c79af6037c99eb","impliedFormat":1},{"version":"3f70cc8055b8c7cee868694213095415f971a84e861b64b30352bd073463e9aa","signature":"90b85c71847fb598c0c1643a9fe21a48ff46b05d1be719e8047bea6199ba4861"},{"version":"edd60a153a73374e71f9ff5b860223e652a99e1d75bce893a8b933b41e5d15f1","signature":"cc0cd701c7399d96e6721d35c1076d98ce512a42d384e0dd413cf3a0df65151c"},{"version":"01274286c587b7b69e7bc369c76f848adbf391e0bda338310b7b7eccbe4e2276","signature":"76eaf30fea4309ec7b9f55d9e59bd277171e4f4ba7bfbc18bd5826598576f52b"},{"version":"cba6ff933adcd1197a066ab24bb930f3b63c079856983501a2a88c6ae624c309","signature":"27f65362e3c3a4cca493a5bf4b6b464656997e860589441dc29144fafaab44bf"},{"version":"99f00b0aacb534312fd470e784facede32288ba2584cde438df28c8a679cf165","signature":"4319b874557509bffcaf87d50974d71513b7368ac30cf13bbf771318a8679e83"},{"version":"04f4ba2df49df254e532ace9c8315449e9d681e2d0c5dc17783d8d1e42c4a3fc","signature":"11e2c539d76c1f0d361260e0c6a73a794e5f497713b376c41e2ffd9a8de61e08"},{"version":"01f9f8bd8a880ab3819bf1ea692a1603aed52c8d6d0ed0845e0597f2aac4b0db","signature":"4319b874557509bffcaf87d50974d71513b7368ac30cf13bbf771318a8679e83"},{"version":"86d4ff8ba66b5ea1df375fe6092d2b167682ccd5dd0d9b003a7d30d95a0cda32","impliedFormat":99},{"version":"39da28d25bd10fcce8f5f3999904392f11b70daa962e85f7b6ef8629a0bf40a7","impliedFormat":99},{"version":"2b5368217b57528a60433558585186a925d9842fe64c1262adde8eac5cb8de33","impliedFormat":99},{"version":"e22273698b7aad4352f0eb3c981d510b5cf6b17fde2eeaa5c018bb065d15558f","impliedFormat":99},{"version":"0db8bf8366670b672e4ce4f2c3d68dde61c9b93b514709594a3b8a82d1dbe60d","impliedFormat":99},{"version":"6125750e2ed26fc88bfa74a54cddff032dd50a8d11e2b6713f5aa2482715ab38","impliedFormat":99},{"version":"75133d015a98f0ff3f575f0c3d7ddb299d11b1612f03034f71e52dfae1876bba","impliedFormat":99},{"version":"0c7d95ec4c3ded14aa99d22fe354ee9e5fd1207b79a8f2b91e31a263ef6dee7b","impliedFormat":99},{"version":"2ece4e538055c2599335c99307cbd6c289955b8f04042271983c9baf17b51a55","impliedFormat":99},{"version":"17c51065e7822de999ed5ff702aead6057c172067e485e8ffe9721bfe5010f0a","impliedFormat":99},{"version":"5c9a2aec7cf29c39450fe23930e192bb58a90b36c3f169481c3ef25f2fcf79e2","impliedFormat":99},{"version":"f4fc36916b3eac2ea0180532b46283808604e4b6ff11e5031494d05aa6661cc6","impliedFormat":99},{"version":"82e23a5d9f36ccdac5322227cd970a545b8c23179f2035388a1524f82f96d8d0","impliedFormat":99},{"version":"ddd3ffe36f22b90f05e9260717b02251a41c487ea47d33b6bc02dd2bcda975ba","impliedFormat":99},{"version":"c8b410924461b0cda89b50a2a7fd3a0889f99d7b587e9dc6953f045d76990ffa","impliedFormat":99},{"version":"95bf654a464e21c92ca7b8c364a061cc4693e7231aec830d7715cea6dd599db7","impliedFormat":99},{"version":"a2b8375a9b94f87be21101639ac984acba5d3fc9f688d36b8d8a35410022b463","impliedFormat":99},{"version":"3be0fe3413b371104a33bdfd29887f61e09134109dadad66cd3a7f0a864e813e","impliedFormat":99},{"version":"f43d7600dd15e9e8d8dd1a54770e6c6cec07a12048abba57c9db848fc86cfa1e","impliedFormat":99},{"version":"493c39c5f9e9c050c10930448fda1be8de10a0d9b34dcd24ff17a1713c282162","impliedFormat":99},{"version":"fdcb6324009c354d7446d34879f62c2b10cdaa4ac2805180459affae578713c7","impliedFormat":99},{"version":"73e4673f2da8677556210e5a127b2637bf030ab73da222ea2a19979f89d9d40a","impliedFormat":99},{"version":"dbf3d90c21c08217509df631336881a3105740033b0592dcc47036490f95e51c","impliedFormat":99},{"version":"e6ad9376e7d088ce1dc6d3183ba5f0b3fb67ee586aa824cc8519b52f2341307a","impliedFormat":99},{"version":"2eaf0dcaaa03f1cce8c4069c98d198b4730d6e842d393031328aefd1ed7becb1","impliedFormat":99},{"version":"ce159449139e8af16bfd00e7fab08009380d001efaf51880168896cef177d6fa","impliedFormat":99},{"version":"92315d3f38cdddca7648aeb78601d001b0ed9c4c1ac1cfae85596dcb45214a09","impliedFormat":99},{"version":"3bfa1e411b97653b422d7378376f6bee6a9fb2e31e1bab5d998f010b74b1c191","impliedFormat":99},{"version":"88c4c850e3f55da805a2cd5408bbf04f40e4c4527aa02352da18fc9a5976b730","impliedFormat":99},{"version":"5e982cd48b5c8966e9c72fb707799ad5c55372d62625f2586a9ad69cc7f19d31","impliedFormat":99},{"version":"450b620f3f41cb05c63c6f903c28aadf364c649a3cc9d8b595ae48f22dfff746","impliedFormat":99},{"version":"237c7defa4cbc0d5f3660c4a3e99fcccbba2da9cf4cc5d80da6691cf0a14c04e","impliedFormat":99},{"version":"dd01943d0fe191b3b2020438367709333ff08a69d285e2f715a60711dcf83b61","impliedFormat":99},{"version":"551324abf03b103b3857d65e48e13f4f1a9c8f26c53783955f88a0b5f58e1cc4","impliedFormat":99},{"version":"518c89af700b469cacbf538c07318b26a9b8d150e37f7d2463a97d246be35fc2","impliedFormat":99},{"version":"14c5c78331ef5859adf39a058075001c396f140635337d58b7213b77a5f44f61","impliedFormat":99},{"version":"934d6ac26bbbcb3b4ef40a869fe08f84cf97447175f943407683785e82bc9b3e","impliedFormat":99},{"version":"c49417ea7e898b9bad77679037b22c24ed685fc9883b633aaa15547669ada552","impliedFormat":99},{"version":"292c0deee2f9ffa73231b9d2190d32b86b0d1c1596d6c51121a8d7954b48d832","impliedFormat":99},{"version":"776262c2861b8423885127bb015beb2f51d96f8ac3cd003cde9a2179dc59636d","impliedFormat":99},{"version":"7ecd1cebc322f21979c8d04840a35d18ccb4a06441f6622fa8510bf5f52293f4","impliedFormat":99},{"version":"7630b6a1c0ebaec2ef8e8abff850e1d6c551c47d1c345340a8ab95667460fc95","impliedFormat":99},{"version":"597b0a9ef02a28f5b1195305ec9f20a4f9948bd90ec3291d0343d1e5c0b4bd16","impliedFormat":99},{"version":"9f891eefb240a66198a8b56e75be6ab4e216725208cdd9b99a9237053e2a43bc","impliedFormat":99},{"version":"7c92e85657e37d9bc0286dcbf9d877142f3a3513c730658ea20b533ad8201ff9","impliedFormat":99},{"version":"9bda3cb21c5022c86d2325885672085a8282a08c9df21688f7d3c6eff58efd40","impliedFormat":99},{"version":"e600e54a07ac7bcf9f0fd67722865bda454f5325ca4742e08e7c321a848fc5b0","impliedFormat":99},{"version":"ddd904d24dff387d2484b69e0643541102a0e3a4f750bb2d517f46adabf84bd7","impliedFormat":99},{"version":"045b2cdfaf5cf84f5be6bde21862add9503e104b252c6dc91efae422d4e8f975","impliedFormat":99},{"version":"14e42bd8b188640fd38861a6255a451fe9dadebcb6523f56f1955c540328092a","impliedFormat":99},{"version":"f98aa2f7ce884c8cdac01878869fefa658bed6cc9d07d0c8044d6f203f8c0d43","impliedFormat":99},{"version":"8b81f510229f977d1b3adcb8136c64558e9e49af840e16fd1785be503a01ece6","impliedFormat":99},{"version":"ceaaae220b5495a8fbc15cb3925107a2b1c6f5a7ca1f4de63c439d91e7726f71","impliedFormat":99},{"version":"6496e6e04c8719315d51cb1c98452f8fcbab340a46cc859e94f3b3a5e2368ea9","impliedFormat":99},{"version":"1c521e08d75a9f4ec24e0ed84c7e7d7dfee4ab5e51aa9a4dbae76283a66d0c49","impliedFormat":99},{"version":"22dd7208780355894f1d9e5821de520e93671895d15439ef0b82cf1d00af6f3f","impliedFormat":99},{"version":"9242750c276f71a51c8d1ca11e4bc2df24ce1c988537c9c914fdd8ec8bb9715a","impliedFormat":99},{"version":"c4bb4f8d6dfff722a008022b3157c8e921b114d6befd8651add3028df40a00e4","impliedFormat":99},{"version":"a6d7338f7fd9035f468bc64f071edbf8ad8c6363c3bfb875c3e1c0f4f5f36b5f","impliedFormat":99},{"version":"d479a5591022bf7b46d90d10e23cbf004b2e1a30ad9b675dbd96721aafb78441","impliedFormat":99},{"version":"c7af3aec3d4a4607a9e23c63d802b77235dfe6f066f912c1347e06ce5868d919","impliedFormat":99},{"version":"d2e351dc6d967923dc6ff200bfbb20dfa92f0c23331ccf34eef1ea7d4b1d8e9b","impliedFormat":99},{"version":"a741bd0bb59cdd1e067dac84f782d831f4b4a71372e2d235edcf9fe4004c3e8d","impliedFormat":99},{"version":"5d0f5df4f4a45c63512a56d1ee43d9093ba8e5cbdcb4ad18d2694bd42f24b678","impliedFormat":99},{"version":"242cda707d18d4bd715c1916eed6ef3ab3d3c107bce17c771c803ff898dabd8c","impliedFormat":99},{"version":"7116b824716ea8c11ab831cb599e27cccd1ea083689d7085ce26954d86f392d4","impliedFormat":99},{"version":"fc72234878bd535b24812c003a0c278e36168ff420fd92511c7fcd744d194118","impliedFormat":99},{"version":"c5a70f7fb9f53c51e92b446de84cda0284668084c53eb59ae9dc18b55975b552","impliedFormat":99},{"version":"25123c80bcb4c0f874ad6d2facf40f7cfd5e27c08a3107b18302307b7a131016","impliedFormat":99},{"version":"5fb5756d1c11073dcf4b2c76eecc0e48f0331bcb43e02ecb35a7c80f53bcb677","impliedFormat":99},{"version":"121cf1f1c42afca44d5aeedb4469d525ffeb013b78031c4a9089d64acb7a1394","impliedFormat":99},{"version":"908cb76e7cace05e1622e08912e2978c9284444ebedcdf8cd341fa75e31f007e","impliedFormat":99},{"version":"833ad09937a866ae318ecbf7efb71516a48cf8d02a96e9674a6b698dd6091c42","impliedFormat":99},{"version":"b12859f4366c46c2163e1826614f60b1ead750f483eaa211c8cabe0f602ec35e","impliedFormat":99},{"version":"37f61ebbaac9cc1bee0e3c11bf9a9b5207f8e1aa066eedb2860f108961987a49","impliedFormat":99},{"version":"da054238a0ed05f33e3b90c4303f3828830eed590b7a6330993d71c39f80d007","impliedFormat":99},{"version":"004135ace89708fe97328f769b93f567b4f2abff63d2e0a5b79ac11db883a599","impliedFormat":99},{"version":"c092879a5dff9f256c5803275fe459e98c68d84c1ed285c67167a308d0cfc735","impliedFormat":99},{"version":"2d47bec28bfcf23af4da6e06b78ba95a9e1d71f8b1b09e3748fd0e4e2d2a5b54","impliedFormat":99},{"version":"f7479deaa4c12d0fbd85b791d33495636ba08c1c2fdf8b79c5e8da6d4a009a00","impliedFormat":99},{"version":"6c5132caeb5668a88c336281660bc0253c0adff225953a06d82aa2322eb4bf84","impliedFormat":99},{"version":"5922f9bd65f7b5a8ac5a352ea3b6d19a3478e71f13ec223832693de8e6c342a6","impliedFormat":99},{"version":"d8548350c0658b4b273117a637d2240758be3ce00d2aa166d31f85cde38892f4","impliedFormat":99},{"version":"71ebe97730db010764b771c1c8c52c62c6e8dbdb5d22e180d8e916529e40fc6d","impliedFormat":99},{"version":"0a8b167173496586da7d6fc15c549dd8d0942e0cac91601e1356ea2403e62cc6","impliedFormat":99},{"version":"a43a7c6419608eb6e10d3d74c666f18578fed74b5cbc4c2093bb698b22ffff20","impliedFormat":99},{"version":"fc391876e409d362cc43a7468226a9eb83440de09873b284bf09fbfb261ec259","impliedFormat":99},{"version":"d06f5012d5ac1bc25c5033f7e916fe42cc0253d6b523b9747809b71676069370","impliedFormat":99},{"version":"5d35840bd540fad886e21ddaf9b078a44c21a827dec9abc08d2d2c1a3ff27d44","impliedFormat":99},{"version":"38624f66de8189d6c3a69ec227578c114718a715908248de9f19def07e8912d8","impliedFormat":99},{"version":"a8ab2cf2e3bb3728c302c4248cdc5038311f80deefd1d63ff52ff7b54f81c2ba","impliedFormat":99},{"version":"26072f9aac85a7ff3641a4b28ec0b3c0fc50c0c99278ca97d81fc8f338e62563","impliedFormat":99},{"version":"c0f503321523343bea18e344593f3ea9819067721993ba5d3af9946d2553f349","impliedFormat":99},{"version":"be95ac13418fa5d9c28e5d7bd18e5d932a9b64f7b2566e0adebeac1ad247254d","impliedFormat":99},{"version":"4c4d500ad9c7e888a78c61da257c4d217f57b27eeb97db62021025e8e6d472cb","impliedFormat":99},{"version":"55bda9a611ea11aa5ecfd31810ea627ed5943ce42e9e00b086d1d55c509dcff1","impliedFormat":99},{"version":"1d30490ce011b6fb1a7bcd1dbae2ccef837d81c49239e2d08104d7b64ca13f8b","impliedFormat":99},{"version":"3b39d8cf068597cf79bc54eaee54786d42552efc9f38b61569b2d2a862ab025a","impliedFormat":99},{"version":"252e1debe5247d04f9ce7528aae17a9d12fef992e8b805b528e1387eb6725e13","impliedFormat":99},{"version":"824c227be190f43d1c9fbdfd44da41b8627ef823ebaf980306aff0bb5f3f06c4","impliedFormat":99},{"version":"855df3872c6c1ec8bfc14af7f5aa01aad7f6894afec32eb00991edefe061317d","impliedFormat":99},{"version":"be7e857618201a6176acb20a2c6aefedc19d7459a8f826a0b01b422921066ab9","impliedFormat":99},{"version":"aee9dd66d2d19cdc65710ff00ab0d9ce7e325370a4a74502a9e4a50c9b0968ce","impliedFormat":99},{"version":"3bb356fbb9fcead984ef57d55d0d2a991488295f06bc1a2c0747ffe3cca5578a","impliedFormat":99},{"version":"98bd5809986b3bd06334c3fef9c7a4120b7ecc4274e0c1b4f7925d83dcc7e062","impliedFormat":99},{"version":"a02182b20bcb1966fc15eac80506f617b71fdd0e279ccff44b27f2ee366b2823","impliedFormat":99},{"version":"32563899782c456f03cadc7a9508b9b6468dd678404b093bd7557d6c6e143218","impliedFormat":99},{"version":"f613a93e0685802f7f7e248156ae93ff9088d45abeff0b21b656520699b79f06","impliedFormat":99},{"version":"d958cb4e1e9e59b89df2d0573438ce041e1425de5d4cdad62c7a7e933809c813","impliedFormat":99},{"version":"a1b34dfe0e5e830be2b056c913975b7164d4541cd2fd40c244695f95fff20b1b","impliedFormat":99},{"version":"c2ebda5a755229233afc79f54dac3d52963fe10ab72ec39dd6e1932c77c36986","impliedFormat":99},{"version":"313ca4c2338bb520dd74c183f5d03e78b48e4889d4401f90823ac6be4738dadc","impliedFormat":99},{"version":"4ecb0eb653de7093f2eb589cea5b35fdea6e2bbd62bc3d9fafdc5702850f7714","impliedFormat":99},{"version":"69ed52603ad6430aaffbc9dec25e0d01df733aaa32ab4d57d37987aedc94c349","impliedFormat":99},{"version":"6f8acb191da449d8dbec7a4e9c317bdb6b8af104a60a101950643ea52cfa3c85","impliedFormat":99},{"version":"ba5d6eea7db7f039203221d81225f8301c38c77de6c12f370e1c4edf5ae58eea","impliedFormat":99},{"version":"10ed2606d94fd4182c10770a77ed155d5d253d9b6fdc74b3595260377972d783","impliedFormat":99},{"version":"ddd53b50745e3c0207ea6acfecc5fe0fb0774bd0482bea7ea16e72ea60509ae2","impliedFormat":99},{"version":"6f517e0aa16fef1ba5a8aed5285d3ada040f70c765b8df744a28f158a3814962","impliedFormat":99},{"version":"dec366b82cfc1827db0619d64dfe762d9ad10c7b8e6183bad51d2d59555da9dd","impliedFormat":99},{"version":"54a6a3e98b7ec00fec7bd7e42ad50c16014805576ccbe33bfee04f0aac9965da","impliedFormat":99},{"version":"17572e1888ca2431691012bbb5de5bd442889a2d6cda64ed1b060525432f90b4","impliedFormat":99},{"version":"a970f24b0d48eae824a508631db68638cc8277d94002732252e8b0b29991b631","impliedFormat":99},{"version":"08066951425b74af410c2f2b973120a21042e31f94060b809192478929a1d1c4","impliedFormat":99},{"version":"953ee863def1b11f321dcb17a7a91686aa582e69dd4ec370e9e33fbad2adcfd3","impliedFormat":99},{"version":"b5a1e8e1e050f51d7d20df4413da6da331ad8736b549d34475126a515952444c","impliedFormat":99},{"version":"e452b617664fc3d2db96f64ef3addadb8c1ef275eff7946373528b1d6c86a217","impliedFormat":99},{"version":"d5f6481abbef58a6611a1e8cddf0f25d5972a924db8a56ab2b3168a2f6b79824","impliedFormat":99},{"version":"2f722a3a421baf9a7c175d8ae6a3118dfd14c5f36474e03f99e3df5800065030","impliedFormat":99},{"version":"f9511d2a891b0a017ae31674977b053f42ca7221dedd012f6de6f75e7cb9aa3e","impliedFormat":99},{"version":"2d446793af6664cd2b9499a72411fb13f8fb7cb2bdd3c4e5fbae060fed1ae9d0","impliedFormat":99},{"version":"f216cb46ebeff3f767183626f70d18242307b2c3aab203841ae1d309277aad6b","impliedFormat":99},{"version":"d6d95f96dd5b374484fd000228288cbcfb80aa47cb74ebd3e19ea94a36e8260a","impliedFormat":99},{"version":"ecbb1a731a8861d5a4f36072be60ec7282366f3cba0f3cef5b51f28d0f123e9c","impliedFormat":99},{"version":"e5dccb9117e1f136f7bfdcb9f2cf4743399da425d73803f9253d703c97f96315","impliedFormat":99},{"version":"cf42318a3df2fc365d9706d49671c499a75562f13a3eca8b855e1b217b36fd15","impliedFormat":99},{"version":"27916d6fd53887af5f79a027fcf707fcf8b2846a0a3e3ed5a335ea401bd14be0","impliedFormat":99},{"version":"5186879bfe32905e11411b70169370ae5990f3ff470c6a7934c1c4454205cbd5","impliedFormat":99},{"version":"46b986d68fdf74a2419dbbe868943e590ac427df3fcdf93b0e0eb4f56b7cc8ec","impliedFormat":99},{"version":"9d76e2a956ed26bd2a956a2319702b73809457d3ca41d74dae42f9e989137024","impliedFormat":99},{"version":"9652faaf8064f655e85f4979f909618a07a4c5df41b51b76bc2263486e900c4a","impliedFormat":99},{"version":"aa56cc6418563bdb7e892e441ed6f2ecfb7f876328d46197ca1a040245c9f68a","impliedFormat":99},{"version":"ad9f9e3831ac78988e8df6ee8c9c97c16c3edc742b93d2dc99a7a09b6ae5328d","impliedFormat":99},{"version":"2346950c388c1c0bcb6f04e2161ca41e05df4fe940935ffbd75adede4df29373","impliedFormat":99},{"version":"f2d8d800ecfef85477c9bcb96a012ffce053f05ba5b8f090c363466ebd33e848","impliedFormat":99},{"version":"58c5a2a520ae555e0573873a5e6303b0f1a1e70f3b376e5ac9094eaad0623d8a","impliedFormat":99},{"version":"5f8217240c95e3f3007d9968104904616287f30d853bac73874759c1dfad4017","impliedFormat":99},{"version":"7ebc96af203f866e829b528e5cffb32111a1a1ff4662bc60c3b53696e89c67f4","impliedFormat":99},{"version":"9f5ee7c037b58964c1cee63c1849fa11757f693208444be0f2d9f08defe859cd","impliedFormat":99},{"version":"de73a5300abc9e2aecdf9616dd51bfb0e966250750557a35505750afad13d7c8","impliedFormat":99},{"version":"d643246ac4c7c49d3fbbc163bf6cacceb398b9e32422f5eaa68486c22efd0c6d","impliedFormat":99},{"version":"9a2cc98a7884cb530a704f6cd16a83db9aa89360a2b391a49e498b5179443dc6","impliedFormat":99},{"version":"d797149b6af25c2c8acb38e942ba449ae6dabf3c2f853b0df8b3e22e4e9f31f7","impliedFormat":99},{"version":"fdb63f244b1b1243db9bd93f96751365bb23e86da900c9fb0d51d9df0ad103eb","impliedFormat":99},{"version":"973b31f421e1a9d9072463de4db64ef9ca649a0dc3c644c00a0dd9f6f03d4349","impliedFormat":99},{"version":"a2de15f9b0a53f76f64cc989cce5aedad51e6470cba0b034bfb56cc0375f4254","impliedFormat":99},{"version":"7a1432004ac80c4b955b238b00d26618f8920960974e32a90ee02a3a84b4ec5e","impliedFormat":99},{"version":"18d0c2293aa57e33923fc1b10970650c6d6932dbfa711a3ffd67600b3caf924b","impliedFormat":99},{"version":"17758b72f880ed66754e3ff4aeade0b82417ec546b72bf3a326cadf4e56c1915","impliedFormat":99},{"version":"d034284b7c9f3ed041925f14da45e8397253ff0f8845adb19c9e1cf56eb69674","impliedFormat":99},{"version":"0efdbe0e700a573e93b271b387b316bdcc28e589520167e9573a894e18462db8","impliedFormat":99},{"version":"ea98ea9ad98e6c9b779ca6390257fd4e368ae012cc9f1caf9bbb21b627119cbd","impliedFormat":99},{"version":"72d741635a455aae90516ef220d0d7b801ce0983613aa36b2a471fff83ece3c6","impliedFormat":99},{"version":"b4e4518bf3e22f7285c9336b446b7d731857abd7477faf34f95e6ad29d4f1b20","impliedFormat":99},{"version":"f1c8c1849cc94593aca8166c049cae8df927c047067916cb926a507c40cc0e25","impliedFormat":99},{"version":"817897f6e723764094c46d00ffe38549c9621cf030269d5a403fbcba26bd9e38","impliedFormat":99},{"version":"bb93dcf5b31753be8d13922fd4a00a780a7de95e9f6155097125fccdac7dc514","signature":"771e6f118365edecdb0e4dc1f829fa36c1d753c1dbcc5f6565d6492636352273"},{"version":"3a2f47a801f3c0c9a1ab936070a9f16ba553105163e80a8dbdc817caec09c077","signature":"35ff7f628db5c0e76a688f77912453a0f8e730cc74b3be2106cd140e6dff1c3f"},{"version":"f0f74ecba507f2e17705c4905557e1f0f64aa42d8b0fb0f0994951eeacd06088","signature":"76eaf30fea4309ec7b9f55d9e59bd277171e4f4ba7bfbc18bd5826598576f52b"},{"version":"1274f97b7a7360179762b373ca8356c888164e0ecd42194ed90f0716939baff7","signature":"111736d70df64c399b52e9658d8cd0662f8d9f2991072b87976df83f180b8021"},{"version":"52df13e78a036626bcdc2ebf2428b3641e364fa6142bb5261d6a82266c6607cf","signature":"46de4d1e87ba75f7eb3b59618cf7c044e45e8eabd47b2a27b164d8c370fc0f5e"},{"version":"632025e182d065e9f355c76929788ec3c2fd60430216b98b3aa9c6e635d9b432","signature":"d4e5afdfe6b8b4666674fb18faff5ffb0cb8b92c23ca335d74a61978ade15465"},{"version":"f183ecd83ebff4c0474e64a2a13eee1d010796d1aabcec507260107c70e08580","signature":"701a89b8a4fdf77ae8ecf4cb7f84efd759056beeadc5a06f5fb56934b894a680"},{"version":"33a4ad9f07eb79b233ab966e16a6a3834bfef18ad20442ae293c3fc0402c9d45","signature":"0e57caacb2cccc7d7d5857b21e32ffed28b01964fa827bbfa7fbbf050dbe77d3"},{"version":"b3337f0320be819f9493cfac1f8718c4c7ca4cfbe82c95be6415a705a2042447","signature":"1a2c9ac61df208a460c839a71016ba056d0e514586cd5bb4b25287379343d833"},{"version":"1fc625161b6407fe03f98398004a506e7ea2d6a33c63eceb768b901de45160a4","impliedFormat":99},{"version":"f86ecb27a70eaa501f62b11c2b3f962f285a449c397332b6bc5a5bcec49a52c8","affectsGlobalScope":true,"impliedFormat":99},{"version":"5e71aeb6b8e5dffad4eb8ca98345b735371d6dae1010dde15f89356dd386cf42","signature":"8bd698a24180e276b183377780d28471c0518a244106be0851623bbd8380f04a"},{"version":"a407ba753a67c5dc0382c2122037e7cf1dc08de3f7ed37d4ee4315498615799e","signature":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881"},{"version":"7935b05cbdac03f056ce0dad0c56fe865b92503c8fa824c8ed500a8e88858dfe","signature":"8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881"},{"version":"fe93c474ab38ac02e30e3af073412b4f92b740152cf3a751fdaee8cbea982341","impliedFormat":1},{"version":"54a99ba46c134a0f697cf3539249cb97efb159ae7d0b4b2881208a6563bafbc0","impliedFormat":1},{"version":"1e00b8bf9e3766c958218cd6144ffe08418286f89ff44ba5a2cc830c03dd22c7","impliedFormat":1},{"version":"2888ba2513c89966b99211186d0e6263ab0792c8fa61aeb0915017f9178585d5","impliedFormat":1},{"version":"a0676bdab58b005b2b574c9d48b929447e1ffc62bd64b627ed2b7af47d27fa66","signature":"d4eda053ab92b25633c39f0032ac32018190eb8ec11e59d2492bb4cd936b01a5"},{"version":"96b3b74168ed84f946dc3b8c0093ce61643f79747af66639e37eeb79fddfc376","signature":"6e144d6f0f417c2f4ff8dcde6f29b21501a020607327000aeae77d57e14a8d1b"},{"version":"1ffe64d93d90f66285a19bb81bb23f9124a89282fa81448e93c72650b9b67f3b","affectsGlobalScope":true,"impliedFormat":99},{"version":"a2c32e26c37a00c30fda54a131971dd0039b7ac6cc149899abfc5397f387fe1a","signature":"41b0aa570577332ed7b53f9a53137d57c9662558e555dbee5129447527dde61e"},{"version":"4b3c8691781ba250afc6955bd303e73260b05d95eff2d7de7c16d8c67d0cc02b","signature":"84867e8687cbe4042b9500c653f013a538f48f5b675650d8a42d9b0177058e49"},{"version":"5f01495a6491fab2c68a5ba098879521f5e487138f5249084ba5ae2c7889d3ec","signature":"04db5c01d323f29e9e468bd7c06eeec7fb5dc1990bded1a838ecc9a008404064"},{"version":"3b9d9094aaffe673d1715d28f3074855cc2fe0c62b2a8d419201538237b9a58b","signature":"9b70b48465d3fe8be6c0a438f1eee8a2a65f9b09b8e368053b10dd3704741cc4"},{"version":"2cef84bf00cbdb452fdc5d8ecfe7b8c0aa3fa788bdc4ad8961e2e636530dbb60","impliedFormat":99},{"version":"9e2f5dc3da9d83bf4a0a9e5d39d8c9918482d586e0c403a44021e4ae7662697e","impliedFormat":99},{"version":"799003c0ab928582fca04977f47b8d85b43a8de610f4eef0ad2d069fbb9f9399","impliedFormat":99},{"version":"a62e448d3f09fee63ec1230acb23fb54f8f6ccf8d6f0001c7b94fd51594b7c9b","impliedFormat":99},{"version":"5366549884acc57185eeeb64561c2060af008230a8ea645f048f747cfac6549c","impliedFormat":99},{"version":"cd3229a2e4ca10207178e22f215c8e196c837254dd34ee440612a2a14993ffc2","impliedFormat":99},{"version":"73b7e3d5300ad64f9231f5bb145fca4892574d85e2d1a015ce095628f16915ca","impliedFormat":99},{"version":"42944c2dd3115e25cb0aa77aa05fe9e3d0f8a3b4ac251896cc680b7be41ad60c","impliedFormat":99},{"version":"7ed8ed496092801dd5f25f39af223ebeddc97bd64a7d9a5621f790dbc836eebe","impliedFormat":99},{"version":"abc549dfea982be25e0379cdcb6ef2aa6716b0013c11d8d6b14c814cc955d7c8","impliedFormat":99},{"version":"0e6ba4003cfaa90748b69ed0dcc9f99299d1af70f4bd835a872e52705b0c850c","impliedFormat":99},{"version":"3decd4c8e355126e76c9a43cc7ae08017fbcf1d766b204d696ccdfa5128de1ac","impliedFormat":99},{"version":"40410f51558d0b3d635584333fbba6b58b4b7f74037f59a08c0577828539637e","impliedFormat":99},{"version":"096350f9446ef08832b935d4a97c66f74a9133faebd90a40a12abd5f8bc7eab2","impliedFormat":99},{"version":"26baad6aa356ef75b2e1ee150ef6325988be9700bba14249f9e8d0f66bb36087","impliedFormat":99},{"version":"237dd4f246265a3efb18c3d40f54f98336ba2c329a9f9e30b4bb0f1a27baf324","impliedFormat":99},{"version":"3fa62b954262157916a65b3dd57faf6cfec7544579e673204da30eba00852543","impliedFormat":99},{"version":"8ab0b13972c8018bd18d49236b8c08448a38c823e28f5620b3ef0b43ff521589","impliedFormat":99},{"version":"065dff95b2b9cd6f5f7404222ecdbd371f15c22b844b731eb32286540f499d2a","impliedFormat":99},{"version":"d1c03f0339b8514b7d5420e075684e6b1dfb9d6c27a7fc6fbb09bc3f25fc7764","impliedFormat":99},{"version":"f8900ddf4a4944cad4a81de965c4761094758ee39bfe24198668c397caf5db3a","impliedFormat":99},{"version":"b2b8376bb1ac24155cde89574c32edfdefdb926845d9426ab52815421b3d19a1","impliedFormat":99},{"version":"4e805f78a8acff48feea70836df232a6db887b2e376492666f6b70985fb706fd","impliedFormat":99},{"version":"cfc5a66408fb9a7dd136ec2afd50a3eced54baa3321c473ee4d29046e761a3a2","impliedFormat":99},{"version":"594201c616c318b7f3149a912abd8d6bdf338d765b7bcbde86bca2e66b144606","impliedFormat":99},{"version":"35c190fc184fc2fdca132bb8aad00ac84819f135428b0e906c3e599c74125d24","impliedFormat":99},{"version":"8f567d63ab28f074ab2be3ddc2da27107de8022488f4a3bd91609752045bb612","impliedFormat":99},{"version":"f6c7ae690e2d224a310c8f967cdb415d8c7c55791a30c00da30e0c19ef4def49","impliedFormat":99},{"version":"f0ee7287284a844f4d04b80ae7a955b12cb50f85fb0021a78cc7f20a90459823","impliedFormat":99},{"version":"956e7dae5b888d02ec65dfe4113b541042cd2c70f96f6b9de0a5465bdf9565fe","impliedFormat":99},{"version":"75722639ade81b4d9a9a7f67f9cee2abbb68c52367322fe4fcd51949dbf60706","impliedFormat":99},{"version":"f90d3104f554535c4bfcf9d429e41318563c40b3b7e0827c0975624722546514","impliedFormat":99},{"version":"c61b9b3f161eb34fe5ed7fd3bb84f0774d74445928a06e9089ddc0a152f2a016","impliedFormat":99},{"version":"17268b7c5aed233ecafd22ac3e751c3aafc101b7ff982de8617bf19fafb7058e","impliedFormat":99},{"version":"bf6060c0585e76d2670629cc4c592e1dd938ac356e974916ced7f46587ba8181","impliedFormat":99},{"version":"dfe68566e870382e203fbf082e3e094b3d3d6712a3b6bf56fe66f69271d27cce","impliedFormat":99},{"version":"f230e4b9b3a7c27975a8af6131b08f6b17505e829073a3faa6ebff4a163090aa","impliedFormat":99},{"version":"e89ae5ee53771a98d89105723fc4dc73205bd96bfd2a784597b5ec6c2ed35abb","impliedFormat":99},{"version":"7f79b823d4b2a1fdee3a799a6a46792a21e4400ed0c2f45f1e1a9bb8de21d18c","impliedFormat":99},{"version":"42b828f21d7b672495a1f538ac49e93ea12da980d07d28999c7eb8dc55f297e5","impliedFormat":99},{"version":"35e7486045f8a29b25ec8adad02823bb82e0876fcce76228bc683e0da0726e98","impliedFormat":99},{"version":"a43f4964d97d0feeb6b33944f750707dbdb539e1c9c3a0496c40789a90d7e0d9","impliedFormat":99},{"version":"8dc6b9b1f772053689d3b298f089ffedf29ee93be2eead0d9c07d77e68aad9e4","impliedFormat":99},{"version":"b44e0ca6cba9c3f98a1b277e93dedcc31990c57c08f0fb37c29eb929afae3a49","impliedFormat":99},{"version":"e236485fde7c092508a177ccfef03ba15ec72ac697b50e241802d68dd99c5f73","impliedFormat":99},{"version":"b7ea66bd111288844e2d0cfb12abc02242af0786a83ddde14abc156a7f80d500","impliedFormat":99},{"version":"83fd9ba9e82b881f410b69b30d4fa9e41b1b6e445e4d7c7eaec836d4cc5a5712","impliedFormat":99},{"version":"ba2733b454a9756b8207e110896e4889859d4a23581e54fdd659f09267a63ecd","impliedFormat":99},{"version":"d94b9c4da700bf7e011fbd442c54b5c88a52db58bc71bb69db67f46a1c525320","impliedFormat":99},{"version":"bb19a13fddc505d633b9d08340c851a16638a3a2c6ba4971d538908b0cce8671","impliedFormat":99},{"version":"da588a0328ea4fa648563415d1ee4cad0587e3d1e1d29cf54d761fbe83ed9670","impliedFormat":99},{"version":"673f71885a78cdf431dd29b801ef2f811a2c793b415c44e64a55489ad010f6e2","impliedFormat":99},{"version":"4c0c16f5d60671e0654e560a94cc549a858a5fb9397a072d3f9935b3068be740","impliedFormat":99},{"version":"2cb58371baa22dbaa02e2abfc40b5640f00e7ed203e70e97fa20226a776b2e16","impliedFormat":99},{"version":"29db777661a60ea3a85cd21ce29b0bd877bb44f52cd583f9f3f7580ee08d4fd1","impliedFormat":99},{"version":"cdf79d50d5ca102a6ccd1ead392b0f5ebcb9b6c8b230e4f4931f0fab8b6ff3c4","impliedFormat":99},{"version":"6e21729eb1f94c93f99d1c13492b6e835e5c2d2ba552693c1c699f0e34d1fa1d","impliedFormat":99},{"version":"8267fbe09febe68384466808d3feaf055ebb7b15903728d23e7fb4c01949148b","impliedFormat":99},{"version":"54e45f5f4f7684c5c49d3e6367ba73c55c69f82973ecf7aca793a86bea5a99af","impliedFormat":99},{"version":"55a9664e49c8e8db27d8eb413749957eb222485b91b1148840a73e065ef6c028","impliedFormat":99},{"version":"af7945629e88f161817436aeab27906b947cea60102066575eb31071b4f84168","impliedFormat":99},{"version":"847b7eec4ffc81b7eaa1bcb473fd5da4aa73ab7e56944df3caf7d284317e95f3","impliedFormat":99},{"version":"5dd262cbb746c2a4d0a26f09369b3ede4a1a36e15c272adfd0289c47cef81ad7","impliedFormat":99},{"version":"677e4d55a1353f1b83ad68faffbdd91ffa7dbc34d67b1e91e88d3ac71b88be0b","impliedFormat":99},{"version":"21ba9b6a4c6dfc6dc403884d34dec961eeb965a4e0c99521ba2b3f9929e26b75","impliedFormat":99},{"version":"452a373c93cae3a20fb8f8309ac48b40cb2a33f05c3d54b090582ce3b8ae96c1","impliedFormat":99},{"version":"112f147e1f4b44b4a4f186cefcae4e58c49d6a0a61faacf7a12f55694b9f2232","impliedFormat":99},{"version":"c293793b601177e19a4230a9ecdaa167e6a44c93147da549941eb8e154510f4f","impliedFormat":99},{"version":"82ece43251947dd304e6f5dbfaf8b97588e5676ddf0bc0fc1a6a861aaa3eaf7c","impliedFormat":99},{"version":"f67c58823afbf2590f2c239d09a46aba9d3456327eee05b593c48ee248758ce0","impliedFormat":99},{"version":"e2647503f56e5c6d41b256af0b17ad3b98455cd8b852ba7336221af5fe99d805","impliedFormat":99},{"version":"c2d12e71e905f9ae80895201ae4b52b0082716d3177d794799f0140c3bbdb65c","impliedFormat":99},{"version":"668eaa98e8d54dc5a22d7a66d659a47f0b152e7b109f798cb295a3c3dd817dbb","impliedFormat":99},{"version":"81d447a1f248a2345a89673774ca673e79da5df8e25c6fd6bffb495d3b704362","impliedFormat":99},{"version":"900f1f5341752c6c2824ea871ae941d60be1359793a0284e56abcf277955a511","impliedFormat":99},{"version":"00c8b548f04329a012af189dfd8e3f3ddd8d4fb187f4fd22fdeba5e1eb740d92","impliedFormat":99},{"version":"919ea552c5b52ac5c8303a96dd7357986a2597de5760416468550b659113bad6","impliedFormat":99},{"version":"8255114fec0d6189524bf52d90580a2fce40bdac621215e562aa5f5b058fea33","impliedFormat":99},{"version":"6020d3e324725ee474aa4637005d2449eb8bce66e8aaf85163d683df86384dd0","impliedFormat":99},{"version":"d95e4069a535a118c22ac66a8b018818f9f74ca7000c8eac977dceaf752d0f95","impliedFormat":99},{"version":"5d8097f4e2588d7912d82772ac6f05ee6def5b738f5e4605f2e9bb24d26b4e86","impliedFormat":99},{"version":"6703ee0cb2405fc9e98a8835e4266ed4131fd25c31bcc0c302e66e9b05271eee","impliedFormat":99},{"version":"4b83d4ffdcb29aa6562749ca797b76a3b914d80f54819c6a08f1014fb6841623","impliedFormat":99},{"version":"41ecfbc96066dc0d03f1a8139e28b4b3297bc231257d27a7c5796d017962a438","impliedFormat":99},{"version":"46e060979c9bb359578744342c37b843529c284e20ebc219bd71d5fbc04b3704","impliedFormat":99},{"version":"720b258293ffe0939688db7b4729d24f64809718157b14ae50fb9e2397c69fbc","impliedFormat":99},{"version":"1273795a90591a538b11c91a7840b1facbb5b6d500146cc055324a16f58c0346","impliedFormat":99},{"version":"a06814aa3f18bf501a7bbd1cf3ad9b1fb090cb89b19375debf6ac3b906ad9090","impliedFormat":99},{"version":"785afd3f604c75ef24a65c0f2ce4b3ce2137f941773c201842abaa7385b12e3b","impliedFormat":99},{"version":"ee3bfff84df83f9e3cf0ec85aff97df52fc57e740e41fd4780de1cb3f9e73780","impliedFormat":99},{"version":"2025d7779d9356a37ed4142da93898d39f811d9c5937f8c107f44ab2344e87b7","impliedFormat":99},{"version":"471b3d02d1af08c6b58a9a2ff5c85da205910f782a7783d7a1f59dcb681ee8ea","impliedFormat":99},{"version":"e1902decb3f07a58e9be70b5136e3d715997025e0f0f20cf7e2610363f38ee04","impliedFormat":99},{"version":"323156c80e3ac6175f4b75952ed871ead30b58b9ec463131e368e572d89777be","impliedFormat":99},{"version":"7c54717447fdfa134e43c6f1a71f8ae4e955538f9e59a8bbd60eb65f5bb965e6","impliedFormat":99},{"version":"0d153b01d0b1e33ad2b8c778765c3f3539a3ffaa595dc3e9d53d91cfe5615f11","impliedFormat":99},{"version":"0ef8dbf7f717c2d8912df768687073cda1d7ec73ce2861fa8ee30ea8c15455e7","impliedFormat":99},{"version":"355ae3751ad1378804c850b212bbfed1bb68af9e4cde0cde857b86c6cbbe2140","impliedFormat":99},{"version":"06b02b230ad18789680a5d286d55d566451973456fa33b63ddff6c9b2c2ab41c","impliedFormat":99},{"version":"971f0be2884711cdbd2dc522224ba68db24abea620e9089b5432a9ed73dd406c","impliedFormat":99},{"version":"1e45c92c3241e189027db53310d5b3b8d713fad08ca6ec5f8e0734b275b6dd76","impliedFormat":99},{"version":"a374180a9dc60b15b4fea69423ae9d8e3cdfdf604e8cb314325db23a2a8e3cf9","impliedFormat":99},{"version":"acc82e49137ccc0be7e523164613032cd0a35a08b38721138a228926539a33f8","impliedFormat":99},{"version":"990951a94433c2efe6e42266ebd096f63154115a37c1f4e5bd37bee57bbd3563","impliedFormat":99},{"version":"b65b675fe2b1ad0d621ce5ad94e9fbdbd16b17e8afebe2863361e0d028dc73fc","impliedFormat":99},{"version":"1bc87b80ef30a78d0cec6f6c56ad41b68a8f03d30a7052d1a0f1e946f5eb5150","impliedFormat":99},{"version":"79ace3491ac2d2585e2e3748827466f99d0fe06acfb8cfd7bb5ac6e272d9b742","impliedFormat":99},{"version":"f51bf6581de40babf85946efb37bf4bab0a5357b46b4a0cf904278f3b8234350","impliedFormat":99},{"version":"c728002a759d8ec6bccb10eed56184e86aeff0a762c1555b62b5d0fa9d1f7d64","impliedFormat":99},{"version":"586f94e07a295f3d02f847f9e0e47dbf14c16e04ccc172b011b3f4774a28aaea","impliedFormat":99},{"version":"cfe1a0f4ed2df36a2c65ea6bc235dbb8cf6e6c25feb6629989f1fa51210b32e7","impliedFormat":99},{"version":"d94d06e50f58be0a417ebc0336be0c51e5aeb06cbb59ae7d5d4cba95e4948418","impliedFormat":99},{"version":"02246d22f0fc51c76534d953f606aab7c012d1acdb182f822c8ac8a37926a72c","impliedFormat":99},{"version":"0166e0f095473027f6f8744378f5ac5cb6557e788540fdad76e0abca9eef2567","impliedFormat":99},{"version":"f950a4cec73ccf53ee3c56f117e5c585872bd13328c487cdf7a614246feb075e","impliedFormat":99},{"version":"f325583644b63525d1c4d22825633c220e478411d813f134d5930207cdf8aab3","impliedFormat":99},{"version":"e25a05c0fd866cf73c00a281ea11bb51fa8d2a9955f2edf8a7b8f3081b37c165","impliedFormat":99},{"version":"2c86f279d7db3c024de0f21cd9c8c2c972972f842357016bfbbd86955723b223","impliedFormat":99},{"version":"df6ccc0d7f7324035b05a6294404b310a23b2f07fbbebe1cd298f88647ab8b6d","impliedFormat":99},{"version":"8cfc293b33082003cacbf7856b8b5e2d6dd3bde46abbd575b0c935dc83af4844","impliedFormat":99},{"version":"62391e62217e8a22a4d5f3ff123912bb4d182598e051f31b287096d187cbaea9","impliedFormat":99},{"version":"81895ab68da9cb1656eca90934f01924181d57439e980aa3df8c788488363272","impliedFormat":99},{"version":"cb1ee5692cfe21d8865ab74cc64aeb2f3319f2c2ea2f63cf2662b6319160beee","impliedFormat":99},{"version":"ef6ed27ceed062efa353f3c108dd31d3e4e83e222ed9e18566fa85ed4600e366","impliedFormat":99},{"version":"faa076baad26c7c20856aa86a22c8afd9113f0bc47feeacc680a9e6d4493ea5e","impliedFormat":99},{"version":"782d76ae47ae31c1169c04d93f11e6e13b50c704833517ffeb933516abc4dc12","impliedFormat":99},{"version":"9036dd2d0b09989692fb0eb69b5142647a709aae1f2bfea464701df33758345f","impliedFormat":99},{"version":"14eeb7d5737bc074d1020b7648358ad0488dfb576aa82937e8447586c1b02bd8","impliedFormat":99},{"version":"73b252fae9083ac46b9f2fa376c3a4f5d2c98f5fc0d31922e6d74e7a416f1034","impliedFormat":99},{"version":"0c35ff99747044453c64a4fe3e0e813adc45e67c16d6c47a39cda7d5b2c45764","impliedFormat":99},{"version":"a127363b7f50b5ce89ee98b2faa52a3e7247af32785f937e827e9ee32578d803","impliedFormat":99},{"version":"ae9e8befa5a81361fda14b5c44953b69a6b32abed1e9c62c533230796ba2b39f","impliedFormat":99},{"version":"f3eeac608cb47badfaf2218914776864558c08a392fa626d3a0ad678b0fbfe38","impliedFormat":99},{"version":"2c05477216d0da559ce805e5b5cb8f3c72e1897110886a0fe22808ac37a2f5f6","impliedFormat":99},{"version":"6307d21b4a02a9de0ec25ad7c8a36bfb3a25d38adb1dbe877f7e73595a4a924c","impliedFormat":99},{"version":"cc78721e9ec12b7b62352b8bfa1e37abe055c17965d5fc956d4edccb1bf4f673","impliedFormat":99},{"version":"53565e07ff42ff137d862dd402cd1799785904a50cbd75fbf8402d7ae76fb6b8","impliedFormat":99},{"version":"c8c4e8de61ce90831b7342b6e4800a3e70f4c06eadb17dd743e652ece3562ebd","impliedFormat":99},{"version":"37ed869a9de36bb1ddf343286b5cd0e0afaddd892ba28e82fd652b7ee2c46dec","impliedFormat":99},{"version":"5dccac21bdd7a3a3f399f2a0110bb1bb22a7bb002e3c4a3403f781299faf3f53","impliedFormat":99},{"version":"976ff2cb836f3b64382f2090462966b6b82a059b8d90c4eba54ffa2021e5c150","impliedFormat":99},{"version":"9432e9ba2ed3ef0169d133a2fdb113002be901691ec78ec9d2329c12c16d5065","impliedFormat":99},{"version":"f7e369493bd11921421f51025608f6450675e5d5fba73a1f5617c96072449ab9","impliedFormat":99},{"version":"0919c74e404e0f876c1687425547263ceffe5cc184404492ed2f8deb8a13cbcd","impliedFormat":99},{"version":"7df13a374704470d39a931dd1fa3602a3bd1cadf064115784e4acc3b25e6c24f","impliedFormat":99},{"version":"36944fe70fea641703d40efab3585844c0ed20ce7e783fdcde90bad50bf77f5d","impliedFormat":99},{"version":"cde65d40e64bf0aedba644d8841fba8fecc6f4793d7e4a4364be954bf273ec0c","impliedFormat":99},{"version":"ab9a48af27d31f50da02f40b83b2e8695c4ac28bd446f37d34d5ded0443aed3e","impliedFormat":99},{"version":"0b1a50c36805a5f3be773ea73339750c3619a7ac53c0f441f5e9f1cdfbddc695","impliedFormat":99},{"version":"b85424e3eeb4843556cc1838289e1d3aafc8907b44fad864f228e2abf1af55d4","impliedFormat":99},{"version":"0bdeb9f8d6472b196355591ea4a4313cef5434d24bc79c6e5e733132380b87ea","impliedFormat":99},{"version":"91fe1b91f77a6080c156f0f6af3f6b12524f04604b6e0925432c48f7ef58cfd9","impliedFormat":99},{"version":"9866369eb72b6e77be2a92589c9df9be1232a1a66e96736170819e8a1297b61f","impliedFormat":99},{"version":"e84281e45703810be96251405f8051317362e453f39f26e078cde8967fd2945f","impliedFormat":99},{"version":"0bcb04a160a2a2a934480e3b899b1d2255970b25ffc7408a5d07aaa07baf2878","impliedFormat":99},{"version":"8e3a9c17439b657424fc7e311943dcf9444fbcac73f3b9b72aec2f449a11e203","impliedFormat":99},{"version":"a6c3df80c7c5e8a15e302df97c8a35b1deec48f6a8639110663d6c85ea562fff","impliedFormat":99},{"version":"4c69a93a4645185c445f0050939645592d49f2b8dbc999ff63176c607f3dc319","impliedFormat":99},{"version":"0e2d2919246a4491005fba1612d101a68dad27a5592a77baab1523b2de335cc2","impliedFormat":99},{"version":"c32be5821ff157b2845dacfb257531e932a1161b933e6cd1cd0a4de9e057bdea","impliedFormat":99},{"version":"eb14bc57e220517c752f74ab7c810b72a80632c26eccbd7af690ed9ea7b5ee03","impliedFormat":99},{"version":"ee0de1f85e4fcafe9019c89085cedbde41a22d4492bab87623eed5afb91065ec","impliedFormat":99},{"version":"588b99d933490c59f0ac74e43491ec1b71348b049b1a391f24318b84bdc17b97","impliedFormat":99},{"version":"d78f57a7b922e855a90900275fc93805e07f8cfc7689039840118eb6bf6f0057","impliedFormat":99},{"version":"3c20a3bb0c50c819419f44aa55acc58476dad4754a16884cef06012d02b0722f","impliedFormat":99},{"version":"82c69793fa09d8b58a3589f08c7d16163c566cca5657dcc45deaf5160f2c0e95","impliedFormat":99},{"version":"b89268c927a997e32030d8d8daeb0ee65a7c7db40b167a39296459e114ba7511","impliedFormat":99},{"version":"fb8bc4e79a3b9442dd3e8b1bea89b3e0ad93dd154f94fcb7ca81f511c7c06b65","impliedFormat":99},{"version":"b6c9a2deefb6a57ff68d2a38d33c34407b9939487fc9ee9f32ba3ecf2987a88a","impliedFormat":99},{"version":"f6b371377bab3018dac2bca63e27502ecbd5d06f708ad7e312658d3b5315d948","impliedFormat":99},{"version":"31947dd8f1c8eeb7841e1f139a493a73bd520f90e59a6415375d0d8e6a031f01","impliedFormat":99},{"version":"3a4b1b3e62543a3955e1ad5cddfcc59b25074f722d5dbf7aee1971a43de8acd2","impliedFormat":99},{"version":"19287d6b76288c2814f1633bdd68d2b76748757ffd355e73e41151644e4773d6","impliedFormat":99},{"version":"fc4e6ec7dade5f9d422b153c5d8f6ad074bd9cc4e280415b7dc58fb5c52b5df1","impliedFormat":99},{"version":"3aea973106e1184db82d8880f0ca134388b6cbc420f7309d1c8947b842886349","impliedFormat":99},{"version":"765e278c464923da94dda7c2b281ece92f58981642421ae097862effe2bd30fa","impliedFormat":99},{"version":"de260bed7f7d25593f59e859bd7c7f8c6e6bb87e8686a0fcafa3774cb5ca02d8","impliedFormat":99},{"version":"f9d8848e3c6d82c1e348a9e5cc531e433be58c4ba233a6683a4e9bf6d923a462","impliedFormat":99},{"version":"48a3ae8b6325c87135a210f6d6a7ce15d58417870a2ad78d70858313c47eee99","impliedFormat":99},{"version":"9822da8046d00ef9b8a230345cc163599e58629112081ba55cf4f8d88ba5bd93","impliedFormat":99},{"version":"260a0f4a8a6dc69a2dec8ea672d702629ff7624d5684b29be55cca02a3e42e7e","impliedFormat":99},{"version":"9789d7263d261044cf33f0bb5fd31a2f4ae3a4cc2a010aa45db6f7d01fb019fa","impliedFormat":99},{"version":"d81f0485800e8813d917c2edf184ca3a7fdeada1472cad6dc41e43c37e240800","impliedFormat":99},{"version":"f59c2a64fc652509e0cc56fffb59d7b81f4c7950c7dcfc2da44b681637604797","impliedFormat":99},{"version":"ac0d6f9d09ee9ec076ec3045d20f0d6f5b32300d5a2fa05b5c5a9b6492c0de1f","impliedFormat":99},{"version":"1d8a6497f663251332519c392c6053d5b5e93e5a2189e2669620851b93fbab65","impliedFormat":99},{"version":"52f2d4cea9e3b8e4821b6ca71077ec5f41316d1b3c7d599ef10fd7c8c839ee09","impliedFormat":99},{"version":"013d7f1c5798ac843bcf24e6f3d97efa42c79f038da9cae4fc95ec686b3087ce","impliedFormat":99},{"version":"83b28136beeebb45a635f0179b828e0d0ec9c59330db43060c5958d796e35ddd","impliedFormat":99},{"version":"81c1ea7f9b00460828ef1c92fbbcfa9ff0a7bfcfb2dbfe2510bf7916c914fa75","impliedFormat":99},{"version":"6cf0bf08cc2ffa6d25c7a9852e58f7de9b26122a42380a89105c201e8bde13c8","impliedFormat":99},{"version":"07350c1be768f0446138cf700b47a8aae8e2f6d828310e519bc500200d519a92","impliedFormat":99},{"version":"4253e0bc9530f4c0eec62d1c566350dffef04ab26d0f72befd2ddc08ccb61925","impliedFormat":99},{"version":"9237ce9c67ba997f8cdbc795be7628c1eafefc3317260c38c1e2df4ebd63a62b","impliedFormat":99},{"version":"1ae2b7f6a1352e73754401f16a7894c1335f3fd199acf4c473274243f89c3230","impliedFormat":99},{"version":"ecfe3af749f3c44ab0fa260d7027b067332f0841bcdca1c8db75eb9b1890bbb5","impliedFormat":99},{"version":"94899ca690be8b491a49004460b79426162b218ef26948625fc025cb40a092e9","impliedFormat":99},{"version":"7fd2e48e2ebd92a381e745c7cfe58003969296f7d0cb0109808e6e867bef6a4d","impliedFormat":99},{"version":"98d7fcdd7c0c682528a70f6781f7a00cc0f314b720d1b15996f223c74dc0cf69","impliedFormat":99},{"version":"155e18326afb2fb26a380b480e0c892cc85cc9449537b3346fcf5aaceeb953a8","impliedFormat":99},{"version":"523d1775135260f53f672264937ee0f3dc42a92a39de8bee6c48c7ea60b50b5a","impliedFormat":99},{"version":"e441b9eebbc1284e5d995d99b53ed520b76a87cab512286651c4612d86cd408e","impliedFormat":99},{"version":"f67db9e9b24275680e88888b618e0d6514a40cef9aec2b6ea8eb1de899f97933","impliedFormat":99},{"version":"0968374af7bf8bf67301b89a4fd4bc8594dcb90b16b4be06ee57d26a708bb776","impliedFormat":99},{"version":"f57e6707d035ab89a03797d34faef37deefd3dd90aa17d90de2f33dce46a2c56","impliedFormat":99},{"version":"cc8b559b2cf9380ca72922c64576a43f000275c72042b2af2415ce0fb88d7077","impliedFormat":99},{"version":"1a337ca294c428ba8f2eb01e887b28d080ee4a4307ae87e02e468b1d26af4a74","impliedFormat":99},{"version":"98a667d4585d5b040af90fb5062e31da7c215abcb47521ff57e33f62755fdc17","impliedFormat":99},{"version":"c29e02568f8b68e62b83db2243e4bbacb5ced2d6c8d120e322b56a018d1070b8","impliedFormat":99},{"version":"53c8e58bcea418aa22f5ee013774c08dfe15f0df9625868b7ce5a7201de29785","impliedFormat":99},{"version":"d56ca5a8aa5dd4937a82df98dd930ef154f340d259bcb2980d36c28a47ff2901","impliedFormat":99},{"version":"3d421ded6ae2260cfd45b230eabe38b6c8498a1a35db809384c85ff2bc3ba822","impliedFormat":99},{"version":"ead83f43dcb956f13b924b9e43e7a64380f830efc67439a9e9e479bc985df8f8","impliedFormat":99},{"version":"d04ba54e15442a067fd28679bf18d11ca2162d64f3b0695b9ddfba2b8e1c3b59","impliedFormat":99},{"version":"6b6cced9b26444d621bb62a1b8cb65911c22505fd559411b5a57e699c7aa519e","impliedFormat":99},{"version":"dafc53212e800bc9bbfed7f3a7732ba8f401516b2bc0c71b2f601ae2583a007f","impliedFormat":99},{"version":"940e51654c3c1967f34160a9674e3bf1dc436a5d36c5d7833718aea235e52fda","impliedFormat":99},{"version":"16f2023402fd0a4eeac99edb5d75d3dd8cb4b2f25f46e9bcdaf0c0bd9670e77b","impliedFormat":99},{"version":"9d7765384806b08a522ff85c20184667eec635fdb809736184da23e89533dabd","impliedFormat":99},{"version":"d53593a008e289638eac5b0a0dfbd4296233e395205831367992a87e81eda13b","impliedFormat":99},{"version":"aa0981acabb92a87323aa1579664c293a968138d9377310fde29429e92febbc6","impliedFormat":99},{"version":"796d8fd55590f854e79d3f4181b54f28108e90118314c858726163bb9961e7ae","impliedFormat":99},{"version":"b37e4e4f8f34745d839c334991d9cf227c34c2ed7fb3b297011ddfddf3ac7d68","impliedFormat":99},{"version":"ef55aaa329259ffcb1694dc5d0d688f05e5a37eec2ae34510ef751e9d608b90d","impliedFormat":99},{"version":"264b53b60d27b252258cca58f80b81e143b6299a866402819d5524fd20febd0c","impliedFormat":99},{"version":"714456dfe665ce8b398af312b56b68a927a8a182f8e78dd7c1ef5cfb596ade25","impliedFormat":99},{"version":"27c9ce7c539db9b37ec0d7476b4e9d9ba7439dc41549e466aeadde43746e8390","impliedFormat":99},{"version":"903e813fb2d906d278ab54626f4ade4f43f96f4e636dc66f5aced69d1afb871b","impliedFormat":99},{"version":"c80bc9ee4fa024302308d14084c0f6c3026301db9abbf6789e6b1caf686ce35c","impliedFormat":99},{"version":"8cd470e7936934cb17c70c18a2e03282980d8d047ec08467925a31bf99ec1bf1","impliedFormat":99},{"version":"c09f5d7d8cdee279972790105f90d6adbfb18efb905cf04815ac59d033f7bb7f","impliedFormat":99},{"version":"e92673d9d3c39fff66b14270f144fd32d2ec6fe92e8b2c51e65bd7b4a0e5f355","impliedFormat":99},{"version":"d465455e9f29288b7c879ecd390256571ba306f8b947698f03b1429d6300ff67","impliedFormat":99},{"version":"108b9e022f7dddd5e5ed8165170d65b752fa7b21ced5dd1005ffad3c36242c57","impliedFormat":99},{"version":"1890b77d7c36efdd18174e345b295ece38e66179dae192fad21e8c3642b993a1","impliedFormat":99},{"version":"636f9c9b34b3f33b2258704da1187e271fbf36081a8e22da97be5b53488a9863","impliedFormat":99},{"version":"fa6693c8ad74ce099f2a93ca8d1b0a643dd7f6026f41ba4b244d440d8dd07f03","impliedFormat":99},{"version":"fd76be177303d35dbd29c11de5f935f5d21ad605d34aa4aad9e309ec494b51a2","impliedFormat":99},{"version":"f31af014cf064d7cea0392f02595f09d8cd4b9d06c7794397cf3ddce13111d81","impliedFormat":99},{"version":"d15de8944d6dfb1c8fab88ed1d56947c4ae438b9fcbd9be18f7840b78c9c3bbd","impliedFormat":99},{"version":"040fd90833b34b59436ca6545a00a3b5988f5a95e6cce0a378ddd66bd2cf44f2","impliedFormat":99},{"version":"f332d07979b46f12410417a97153271e1bf5ea11677423718c59010df71a3f2d","impliedFormat":99},{"version":"06911ddbb7160760c75015d2d6fa0f1c0f94d9f0d61265b2d211238b571a3ff2","impliedFormat":99},{"version":"af0612a0e9b7efc543168628fe60a8d3f4d7ae8d97fe257788cb60bdac2459c3","impliedFormat":99},{"version":"9dd05d844e6b99e0a3c8ab8e37bac8f6297d531a844af0738f9b1eaf4aead087","impliedFormat":99},{"version":"5f7be41a9ceed0632c19b7cdb5ad9e07ac19093cbe23a738fe0f1c8c2f27b036","impliedFormat":99},{"version":"b33e84f2148cc81a9afa6d4177a27a1d246fabea3c0cf391aebd3e62eec04f4f","impliedFormat":99},{"version":"5dd273430ddfd576316532f118feafc41f18d5128d7d84e674d98f4a57107384","impliedFormat":99},{"version":"a9c40d74fab8e810c62cfea99a21d09f529fe6a0e60c39353510974c33df980d","impliedFormat":99},{"version":"2665ad2e88b3633b417e176af058b1c20bf5645327a8c4fd4f08e35636b72f9d","impliedFormat":99},{"version":"2321ad799e7ff9c6c6a886dea5ab208d08072a8d33da312f1b9a10ebc888765d","impliedFormat":99},{"version":"8e2f56264cfd71093034fadc1c788d6f46d58036a57e7189e8eda9a7f87eb9d9","impliedFormat":99},{"version":"06deb0a45f5a6dd23244cae8f1ebfa2400ec7de804980f044316d2d9d35a6ce5","impliedFormat":99},{"version":"b27242dd3af2a5548d0c7231db7da63d6373636d6c4e72d9b616adaa2acef7e1","impliedFormat":99},{"version":"e0ee7ba0571b83c53a3d6ec761cf391e7128d8f8f590f8832c28661b73c21b68","impliedFormat":99},{"version":"072bfd97fc61c894ef260723f43a416d49ebd8b703696f647c8322671c598873","impliedFormat":99},{"version":"e70875232f5d5528f1650dd6f5c94a5bed344ecf04bdbb998f7f78a3c1317d02","impliedFormat":99},{"version":"09b103d94e6bf3723cc3642b164dcae50bea1d1f0ab1f5cccc38dfed3fb2beda","impliedFormat":99},{"version":"2e69f4639a53ba3ae17ec8c03808d251a535339edc99f94074c45743caa9bc1c","signature":"af467093954a67032958618d3b4e0f6035e5a7587a839670b90dc24ca7a49a4b"},{"version":"6fd5f7cf11afe85f3be3b92b4c8b579e2f33c57067b0edca2c6cc49af2d8e4d1","signature":"79ec4167f4b46d1a4bfc83e1adfa2b51432ba033f28bc35abc16e3e95efb4054"},{"version":"d2d81a2022050bcfeccfefe0776fa4c720a9cd889f3910c329ce60744c8b5808","signature":"40444a080be959e4ae0dc3de009f012a15034debfcc182727f32ca5962508967"},{"version":"48806ead5277b495082e240f2138b370a398f34037aff10f3afe21358bb3db80","signature":"f749ba265a2a975fa4ee53575bedac565f688185fcd2042ce2d3577938aa44f1"},{"version":"d2e186df8d82683de328f897923481617f57381a394df53e1df3b5beabc3242e","signature":"141215d5980e23aa8f9c9f2c1bd852886fa1aa47905fa2ae24b9d42d83170a99"},{"version":"100b9e8d49ceb7e92f6fad51ec013001252d46cbb4473a48e37b37a57efca3cf","signature":"4eda9fa66f660fa2a170b1d756729bb960af7a2934c05e5121d429b1a3f70b9c"},{"version":"8e47c3e474703876335c5a3175ab7c05cecc297dc5ea4fddcfd07c7499e27e2e","impliedFormat":1},{"version":"f7f7208a3208e087974f1deca0d062a3de0e2359a9824755cdc1855aeb30adb8","signature":"c57c4832eaec032bd28779147cfaa56670ab4ddc94bfa0b94312eebf1b88c565"},{"version":"3e20471b70ccc00457b22875160bf4c9c8aeba3514657bbde72d2fe4cb7405b1","signature":"d5f794939386185a705185786b7d57b045c479e84b7714c95839096b9acc0427"},{"version":"dd6ebd2a9a02f58b3e5cb2f84169cf26cecf40b7844ccb9a88f92a160d4eb87d","impliedFormat":99},{"version":"f9aea803f53766bb8007c3c3532974ca4ea446701e7f0dcd00e206a213d15b43","signature":"9acf7113ed4644a80b1bc2b7969390cf40341bcb031223d35d0f4c9de2a460e9"},{"version":"45b5bf88cf224503a20310b2c8ca01883041360ab7f86ff9da6c4886f45644bf","impliedFormat":1},{"version":"ecf77bf1046cebd4f9a42f8322bbe5b90c6ccbf33b59546b93a2f0251e9ae514","impliedFormat":1},{"version":"197855578790ecbf5198da6c3ea1033e949bba87378c463f270018e1c67b0ee4","impliedFormat":1},{"version":"8bf4236481e545558a50766d266211aa61efef8cbaf91aeb46c34e2978aa4b2e","impliedFormat":1},{"version":"d08026244cddea68a887f606e8ae6998e4798151efd4bc11ab91dded8c4733f2","impliedFormat":1},{"version":"7ede878da480bba98a5e98858ddf7369133fb83341b95ce9ea974eb3c92a518b","impliedFormat":1},{"version":"bea6fc8b6b8af7ea17b7ba5a4f2ebe1303ae20aa30e51a93974d26f62d46f4e1","impliedFormat":1},{"version":"de3121714e8124b99e68e9e971e5323d3650c0aadfb9dcb14787708516f9da56","signature":"ae12002b0b97e73f4c7025cdf8fa24ac59e218787220532d105c0d861d040f9d"},{"version":"701a1a261b925aa6bb453e65fb578306ce8d7c301e2283fe2ee42d27d05b2463","signature":"cc58ac0d8d034d27ec12381bb4f40ba7ca2f20c044cd3f3110930f2bca49bda5"},{"version":"2895d0a9772eaaf14f895b38e9bcf9b865d67beceb098fb45453127a72e4b95d","signature":"7f3156e8504f7927ebd74d67a7ab47f8d80555b356db0126fdce1a7e266fee5b"},{"version":"1a34d6a890e2b794b7d6749072ad220a30f1d61825a3d03563a328c1a5d22904","signature":"ad0be7716a1dd49ca982ee40d2232f23514b9a2651a09b63ef9a83732fbb0c26"},{"version":"90b4e749edb434a9ab9dbe59ae7021dc75d155e8e3b8fde159e86af4f6248fc0","signature":"a130eecef436599fd2beafd8e577d37babb7073eedcc3a297510dd413d2bf947"},{"version":"a8e37173b8005b7ed08fc73e1bdb69566cf357245c90a794cb3dbd5f47fba254","signature":"a5e0b71656ec8ba5135a4e78fa61d8cc60ed8a21a0a28a7ca450e8dae781d5e6"},{"version":"31488f4027fb8b157afc4e4457c7614276cc600f2d3c404f975be1cb3151f83d","signature":"a417d30b2b1ff87a122d7f99cfc5234d213a6536fffce13a45d5ba7eb7b876cc"},{"version":"1aa413e479505b2563393ea423695e69e6af70e0ffcab0e5ce11913af5cbf3e4","impliedFormat":1},{"version":"7ed5149704067ffae637cbf3eef88f46a8d1ce4a1b99c2f3dec5351d71dbcb5e","impliedFormat":1},{"version":"698f05b4b7fc09cdc98d10be586fedb95ecaa0d2582fc25de4ebaae603073176","impliedFormat":1},{"version":"1bf78057df2e66dce7a516229d8d50652e25f5d3c688e83cdb91ff7534212cbd","impliedFormat":1},{"version":"8c431ef3c4f99f8f7547fb704fa20c48b97f066103d58ceb7e72f1e98dcc78c5","impliedFormat":1},{"version":"233e21b3f4c43014be59d5ea4386e873042aa10b53b771130d5c43525c1edddf","signature":"3eb972ae325aa293fdb6077cdf956f209ee6ea34b4e874ff7ec8686b3079972f"},"4f984436b10cfb43ccf7fc3114dcb851cbefa4d58b7d8ae741aaae0f6e330129","839632c4bbdfa4c5b31d93dc90171a330e660e61acb19ba1716fda073eccb4a4","4f984436b10cfb43ccf7fc3114dcb851cbefa4d58b7d8ae741aaae0f6e330129","f3387dd7800eec3c34273f7a8efad13e864598c7e8f788d321e407390989bb59",{"version":"7851f1ad6a460068487ef783756c37919053c034b46a3aa59477b5ec91e17aa3","affectsGlobalScope":true},"d45310240a444cdc7e7ef7d33f3bfec38f73a88eb7607cf8df4538e2a0427f2f",{"version":"751764bb94219b4ce8f5475dc35d3de2e432fea01a0c9610cd7f69ad05e398c6","impliedFormat":1},{"version":"f3d8c757e148ad968f0d98697987db363070abada5f503da3c06aefd9d4248c1","impliedFormat":1},{"version":"96d14f21b7652903852eef49379d04dbda28c16ed36468f8c9fa08f7c14c9538","impliedFormat":1}],"root":[[545,552],558,559,[563,569],[736,744],[747,749],754,755,[757,760],[1019,1024],1026,1027,1029,[1037,1043],[1049,1055]],"options":{"allowJs":true,"esModuleInterop":true,"jsx":4,"module":99,"skipLibCheck":true,"strict":true,"target":4},"referencedMap":[[1052,1],[1053,2],[1054,2],[1055,3],[1050,4],[546,2],[545,2],[1051,5],[551,6],[565,7],[566,8],[567,8],[569,9],[737,10],[738,11],[740,12],[741,9],[742,13],[743,14],[744,13],[757,15],[1049,16],[759,17],[758,18],[760,19],[1024,19],[1038,19],[1043,20],[1041,21],[1019,22],[1026,23],[1022,18],[1039,21],[1021,19],[1029,24],[1037,25],[1042,20],[1023,19],[755,21],[1020,18],[1040,20],[1027,19],[754,19],[563,26],[559,27],[550,28],[564,29],[747,30],[739,28],[568,31],[552,32],[558,33],[736,34],[547,35],[548,36],[483,2],[557,2],[371,2],[561,37],[562,38],[560,2],[1047,39],[1044,40],[1045,41],[1046,42],[1048,43],[746,44],[745,45],[553,2],[555,46],[556,47],[554,2],[1056,2],[1057,2],[1058,2],[140,48],[141,48],[142,49],[97,50],[143,51],[144,52],[145,53],[92,2],[95,54],[93,2],[94,2],[146,55],[147,56],[148,57],[149,58],[150,59],[151,60],[152,60],[153,61],[154,62],[155,63],[156,64],[98,2],[96,2],[157,65],[158,66],[159,67],[191,68],[160,69],[161,70],[162,71],[163,72],[164,73],[165,74],[166,75],[167,76],[168,77],[169,78],[170,78],[171,79],[172,2],[173,80],[175,81],[174,82],[176,83],[177,84],[178,85],[179,86],[180,87],[181,88],[182,89],[183,90],[184,91],[185,92],[186,93],[187,94],[188,95],[99,2],[100,2],[101,2],[139,96],[189,97],[190,98],[196,99],[195,100],[197,101],[194,102],[394,103],[393,104],[192,105],[457,2],[193,106],[83,2],[85,107],[455,100],[456,100],[756,2],[84,2],[849,108],[828,109],[925,2],[829,110],[765,108],[766,108],[767,108],[768,108],[769,108],[770,108],[771,108],[772,108],[773,108],[774,108],[775,108],[776,108],[777,108],[778,108],[779,108],[780,108],[781,108],[782,108],[761,2],[783,108],[784,108],[785,2],[786,108],[787,108],[788,108],[789,108],[790,108],[791,108],[792,108],[793,108],[794,108],[795,108],[796,108],[797,108],[798,108],[799,108],[800,108],[801,108],[802,108],[803,108],[804,108],[805,108],[806,108],[807,108],[808,108],[809,108],[810,108],[811,108],[812,108],[813,108],[814,108],[815,108],[816,108],[817,108],[818,108],[819,108],[820,108],[821,108],[822,108],[823,108],[824,108],[825,108],[826,108],[827,108],[830,111],[831,108],[832,108],[833,112],[834,113],[835,108],[836,108],[837,108],[838,108],[839,108],[840,108],[841,108],[763,2],[842,108],[843,108],[844,108],[845,108],[846,108],[847,108],[848,108],[850,114],[851,108],[852,108],[853,108],[854,108],[855,108],[856,108],[857,108],[858,108],[859,108],[860,108],[861,108],[862,108],[863,108],[864,108],[865,108],[866,108],[867,108],[868,108],[869,2],[870,2],[871,2],[1018,115],[872,108],[873,108],[874,108],[875,108],[876,108],[877,108],[878,2],[879,108],[880,2],[881,108],[882,108],[883,108],[884,108],[885,108],[886,108],[887,108],[888,108],[889,108],[890,108],[891,108],[892,108],[893,108],[894,108],[895,108],[896,108],[897,108],[898,108],[899,108],[900,108],[901,108],[902,108],[903,108],[904,108],[905,108],[906,108],[907,108],[908,108],[909,108],[910,108],[911,108],[912,108],[913,2],[914,108],[915,108],[916,108],[917,108],[918,108],[919,108],[920,108],[921,108],[922,108],[923,108],[924,108],[926,116],[762,108],[927,108],[928,108],[929,2],[930,2],[931,2],[932,108],[933,2],[934,2],[935,2],[936,2],[937,2],[938,108],[939,108],[940,108],[941,108],[942,108],[943,108],[944,108],[945,108],[950,117],[948,118],[947,119],[949,120],[946,108],[951,108],[952,108],[953,108],[954,108],[955,108],[956,108],[957,108],[958,108],[959,108],[960,108],[961,2],[962,2],[963,108],[964,108],[965,2],[966,2],[967,2],[968,108],[969,108],[970,108],[971,108],[972,114],[973,108],[974,108],[975,108],[976,108],[977,108],[978,108],[979,108],[980,108],[981,108],[982,108],[983,108],[984,108],[985,108],[986,108],[987,108],[988,108],[989,108],[990,108],[991,108],[992,108],[993,108],[994,108],[995,108],[996,108],[997,108],[998,108],[999,108],[1000,108],[1001,108],[1002,108],[1003,108],[1004,108],[1005,108],[1006,108],[1007,108],[1008,108],[1009,108],[1010,108],[1011,108],[1012,108],[1013,108],[764,121],[1014,2],[1015,2],[1016,2],[1017,2],[1031,2],[1030,2],[1032,2],[1035,122],[1034,123],[1036,124],[1033,2],[753,100],[496,125],[502,126],[509,127],[518,128],[490,129],[247,2],[476,130],[375,131],[378,132],[350,2],[363,133],[370,134],[252,2],[352,2],[253,2],[349,135],[414,136],[475,2],[244,137],[377,138],[379,139],[380,140],[453,141],[344,142],[298,143],[357,144],[358,145],[356,146],[355,2],[351,147],[376,148],[477,149],[418,2],[419,150],[246,151],[478,152],[264,151],[301,151],[222,151],[373,153],[372,2],[362,154],[469,2],[231,2],[508,155],[431,156],[432,157],[428,158],[527,2],[340,2],[433,100],[429,159],[531,160],[530,161],[526,2],[278,2],[343,162],[342,2],[525,163],[430,100],[283,164],[291,165],[293,166],[282,2],[286,167],[290,168],[287,169],[292,170],[289,171],[284,2],[285,172],[528,2],[524,2],[529,2],[281,173],[519,174],[522,175],[271,176],[270,177],[491,2],[269,178],[534,100],[268,179],[258,2],[536,2],[751,180],[750,2],[537,100],[538,181],[214,2],[359,182],[360,183],[361,184],[218,2],[364,2],[239,185],[198,2],[445,100],[220,186],[444,187],[443,188],[434,2],[435,2],[442,2],[437,2],[440,189],[436,2],[438,190],[441,191],[439,190],[474,2],[249,2],[250,151],[384,2],[389,192],[392,193],[388,194],[386,195],[391,196],[387,197],[382,2],[451,100],[243,100],[495,179],[503,198],[507,199],[333,200],[318,2],[313,2],[465,201],[199,202],[345,203],[346,204],[395,205],[426,206],[322,2],[450,207],[335,100],[423,208],[422,209],[421,210],[425,211],[327,212],[452,213],[323,2],[326,214],[324,2],[424,215],[447,216],[448,217],[446,2],[449,2],[331,2],[397,218],[396,219],[417,220],[226,221],[334,222],[337,223],[328,224],[332,225],[320,226],[338,227],[223,228],[403,229],[317,230],[224,231],[473,232],[219,233],[398,234],[383,2],[399,235],[488,236],[381,2],[487,237],[91,2],[485,238],[248,2],[420,239],[480,2],[232,2],[235,2],[354,2],[402,240],[251,2],[256,241],[330,242],[262,243],[329,2],[401,2],[385,2],[404,244],[405,245],[353,2],[407,246],[409,247],[408,248],[365,2],[400,231],[411,249],[316,250],[486,251],[489,252],[200,2],[204,2],[203,2],[202,2],[207,2],[201,2],[210,2],[209,2],[206,2],[205,2],[208,2],[211,253],[213,2],[308,254],[307,2],[312,255],[309,256],[311,257],[314,255],[310,256],[240,258],[300,259],[468,260],[466,2],[513,261],[515,262],[461,263],[514,264],[500,2],[227,265],[225,265],[212,2],[242,266],[241,267],[237,268],[238,269],[245,270],[255,270],[265,270],[302,271],[266,271],[229,272],[228,2],[306,273],[305,274],[304,275],[303,276],[230,277],[454,278],[254,279],[460,280],[427,281],[458,282],[459,283],[348,284],[347,285],[341,286],[315,287],[297,288],[299,289],[296,290],[410,291],[470,2],[471,292],[501,2],[236,293],[416,294],[467,295],[339,2],[257,296],[321,297],[319,298],[259,299],[412,300],[462,2],[260,301],[413,301],[498,2],[497,2],[499,2],[464,2],[463,2],[415,302],[336,2],[294,303],[234,304],[272,2],[217,305],[261,2],[505,100],[216,2],[517,306],[280,100],[511,100],[279,307],[493,308],[277,306],[221,2],[520,309],[275,100],[276,100],[267,2],[215,2],[390,2],[274,310],[273,311],[263,312],[325,77],[479,77],[406,2],[482,313],[481,2],[288,173],[233,2],[295,100],[472,185],[494,314],[86,100],[89,315],[90,316],[87,100],[88,2],[374,317],[369,318],[368,2],[367,319],[366,2],[492,320],[504,321],[506,322],[510,323],[752,324],[512,325],[516,326],[544,128],[521,128],[543,327],[523,328],[532,329],[533,330],[535,331],[539,332],[542,185],[541,2],[540,333],[584,2],[732,334],[734,335],[731,336],[582,337],[579,338],[583,339],[589,340],[574,341],[588,342],[594,343],[735,344],[585,345],[733,346],[570,2],[577,2],[572,2],[581,347],[730,348],[575,349],[573,83],[587,350],[571,96],[586,351],[576,352],[597,353],[652,354],[609,355],[598,356],[606,357],[595,2],[596,358],[599,359],[608,360],[663,361],[607,2],[605,362],[600,363],[601,364],[580,365],[644,366],[613,367],[614,368],[615,367],[616,369],[624,370],[622,371],[623,367],[617,367],[643,372],[625,367],[626,368],[627,369],[635,373],[634,371],[628,369],[629,369],[642,374],[630,367],[631,371],[636,369],[637,375],[632,367],[633,369],[640,376],[641,377],[618,367],[619,367],[620,369],[621,378],[638,376],[639,379],[648,380],[645,369],[646,381],[647,382],[649,383],[674,384],[662,385],[660,367],[661,386],[664,367],[665,387],[666,388],[671,389],[667,388],[670,390],[668,388],[669,391],[659,386],[672,392],[673,393],[655,394],[681,395],[677,396],[676,397],[675,398],[658,399],[656,369],[657,369],[678,400],[679,401],[680,402],[650,403],[653,404],[651,405],[654,406],[611,407],[593,408],[610,409],[592,410],[591,411],[612,412],[590,413],[684,414],[682,369],[683,415],[685,416],[687,417],[686,418],[688,369],[692,419],[690,420],[691,421],[693,422],[696,423],[695,424],[698,425],[697,367],[701,426],[699,368],[700,427],[694,428],[689,429],[702,428],[703,430],[729,431],[705,432],[707,433],[704,434],[706,432],[708,367],[709,369],[710,435],[711,436],[712,437],[602,438],[603,439],[604,440],[713,369],[714,441],[578,2],[715,369],[718,442],[716,369],[717,443],[719,416],[720,444],[723,445],[722,446],[724,447],[725,422],[728,448],[727,449],[726,450],[721,451],[1028,100],[1025,100],[484,452],[81,2],[82,2],[13,2],[14,2],[16,2],[15,2],[2,2],[17,2],[18,2],[19,2],[20,2],[21,2],[22,2],[23,2],[24,2],[3,2],[25,2],[26,2],[4,2],[27,2],[31,2],[28,2],[29,2],[30,2],[32,2],[33,2],[34,2],[5,2],[35,2],[36,2],[37,2],[38,2],[6,2],[42,2],[39,2],[40,2],[41,2],[43,2],[7,2],[44,2],[49,2],[50,2],[45,2],[46,2],[47,2],[48,2],[8,2],[54,2],[51,2],[52,2],[53,2],[55,2],[9,2],[56,2],[57,2],[58,2],[60,2],[59,2],[61,2],[62,2],[10,2],[63,2],[64,2],[65,2],[11,2],[66,2],[67,2],[68,2],[69,2],[70,2],[1,2],[71,2],[72,2],[12,2],[76,2],[74,2],[79,2],[78,2],[73,2],[77,2],[75,2],[80,2],[117,453],[127,454],[116,453],[137,455],[108,456],[107,457],[136,333],[130,458],[135,459],[110,460],[124,461],[109,462],[133,463],[105,464],[104,333],[134,465],[106,466],[111,467],[112,2],[115,467],[102,2],[138,468],[128,469],[119,470],[120,471],[122,472],[118,473],[121,474],[131,333],[113,475],[114,476],[123,477],[103,205],[126,469],[125,467],[129,2],[132,478],[549,479],[748,33],[749,33]],"affectedFilesPendingEmit":[1055,1051,551,565,566,567,569,737,738,740,741,742,743,744,757,1049,759,758,760,1024,1038,1043,1041,1019,1026,1022,1039,1021,1029,1037,1042,1023,755,1020,1040,1027,754,563,559,550,564,747,739,568,552,558,736,548,549,748,749],"version":"5.9.3"}
```

## `.admin/CONSTITUTION.md`
```html
# CONSTITUTION & BLUEPRINT: Acta

## 0. Competition Context
- **Competition:** Nimiq Mini Apps Competition -- Cycle II
- **Deadline:** September 18, 2026
- **Prize Pool:** $17,000 USDT (1st: $10,000 / 2nd: $5,000 / 3rd: $2,000)
- **Judging:** Nimiq Community Council -- 9 criteria, 100 points max
- **Rules:** MIT License, public GitHub repo, live demo, fully functional on first try
- **Integration requirement:** Must support USDT or NIM via Nimiq Pay Mini Apps Framework

## 1. Core Thesis & Vision
- **Project Name:** Acta
- **Tagline:** Money that moves when reality changes.
- **Thesis:** A verifiable proof-of-action protocol that bridges digital assets to physical actions.
- **Vision:** A zero-trust escrow engine natively inside Nimiq Pay that unlocks local economies (peer-to-peer borrowing) and scalable micro-work (GeoBounties).
- **Anti-Vision:** Not a basic tip jar. Not a centralized marketplace. Not a complex DeFi protocol.
- **Target Audience:** Neighbors, communities, and local micro-economies who want trustless borrowing and task completion.

## 2. Architecture & Technical Stack
- **Frontend:** Next.js 16 (React 19) + TailwindCSS 4 + TypeScript
- **Form Factor:** Strictly mobile-first (max-width 480px), optimized for Nimiq Pay webview
- **Nimiq Integration:** Official Mini App SDK (`@nimiq/mini-app-sdk`) -- `init()`, `listAccounts()`, `sendBasicTransaction()`, `sendBasicTransactionWithData()`, `sign()`, `isConsensusEstablished()`, `getBlockNumber()`, `requestDeviceIdentifier()`, `getHostLanguage()`
- **Backend & State:** Next.js Route Handlers + Neon Postgres (serverless)
- **Oracle 1 (Borrowing):** Ed25519 cryptographic QR handshake (`@noble/ed25519`)
- **Oracle 2 (Bounties):** HTML5 Geolocation + Hetzner Inference Qwen3.6 Vision
- **Icons:** lucide-react (SVG, tree-shakeable)
- **QR Scanner:** html5-qrcode (real camera access)
- **Deployment:** Vercel (production URL for judging)

## 3. Scoring Criteria Alignment (100 points)
Every design decision must optimize for these 9 criteria:

| Criterion | Target Grade | Implementation Strategy |
|---|---|---|
| Core Feature | Outstanding | Real NIM transactions via SDK. Full lock-scan-release cycle works end-to-end. |
| Error Handling | Strong | Error boundaries, toast notifications, retry logic, graceful degradation. |
| Speed | Outstanding | Skeleton loaders, optimistic UI, no blocking fetches, instant tab switching. |
| Stability | Strong | No dead ends, no blank screens. Camera fallbacks, offline localStorage, API fallbacks. |
| Completeness | Strong | Onboarding, create listings, QR scanner, trust passport, transaction history -- feels finished. |
| Real Need | Outstanding | Solves peer borrowing trust problem. Makes neighborhood lending viable. |
| Target Audience | Strong | Onboarding explains in 3 screens. UI is self-documenting. |
| Originality | Outstanding | Proof-of-action escrow is genuinely novel. Ed25519 QR + AI vision oracles. |
| Repeat Value | Competent | Persistent listings, trust score growth, ongoing bounties. |

## 4. UI/UX Architecture & Polish Specifications

### Design Language
- **"Dark-Mode Crypto SaaS"** aesthetic that looks venture-backed, not hackathon-built
- Deep obsidian background: `#0F172A`
- Card backgrounds: `#1e293b` with 1px `rgba(255,255,255,0.08)` borders
- Differentiated card types: `card-borrow` (blue tint), `card-bounty` (amber tint), `card-success` (emerald tint)

### Color System
- Primary (CTAs, active): `amber-300` (#fbbf24)
- Secondary (info, links): `sky-400` (#38bdf8)
- Success: `emerald-400`
- Error: `rose-400`
- Text primary: `slate-100`
- Text secondary: `slate-400`
- Text muted: `slate-500`

### Layout
- Mobile viewport locked (no horizontal scroll, no bounce)
- Bottom tab bar: Radar, Active, Passport (lucide-react SVG icons)
- Sticky header with app identity + trust score badge
- Content area with `pb-28` to clear bottom nav

### Typography
- Font: Inter (geometric sans-serif via next/font)
- Tabular nums (`.tnum`) for all numeric data
- Large bold figures for critical data (NIM amounts, trust scores)

### Component Polish
- Glassmorphism: `bg-slate-800/70 backdrop-blur-xl border-white/10` for overlays
- Skeleton loaders for every async state
- Toast notifications (success/error/info) with auto-dismiss
- Animations: slideUp modals, fadeIn cards, scaleIn overlays, pulse borders
- 3-step numbered wizards with animated progress bars
- Empty states with icons and helpful CTAs

### State Feedback
- Every action gets immediate visual response
- Optimistic UI updates on escrow operations
- Skeleton loaders during data fetches
- Success animations on completed releases
- Error states with retry options

## 5. The Unfakeable Proof (Demo Sequence)
1. Open Acta inside Nimiq Pay. Onboarding explains the concept in 3 screens.
2. Radar tab shows nearby borrow items and bounties with differentiated cards.
3. Tap "Borrow" on a drill listing. 3-step wizard reviews collateral (trust discount applied).
4. Sign & lock NIM via `window.nimiq` -- real transaction with on-chain data.
5. Switch to Active tab. Escrow shows "LOCKED" with amount and tx hash.
6. Lender device generates cryptographic Return QR code.
7. Borrower opens QR scanner (real camera), scans lender's QR.
8. Ed25519 signature verified. Escrow released. NIM returned minus 50 NIM fee.
9. Passport tab shows updated trust score (circular progress ring) and transaction history.

## 6. Nimiq SDK Integration Map
```
init() ...................... Provider bootstrap with timeout
listAccounts() ............. Get user's Nimiq addresses
sendBasicTransaction() ..... Lock collateral into escrow vault
sendBasicTransactionWithData() .. Embed escrow metadata on-chain
sign() ..................... Sign messages for proof verification
isConsensusEstablished() ... Show chain sync status in header
getBlockNumber() ........... Display current block in Passport
requestDeviceIdentifier() .. Anti-spam device fingerprint
getHostLanguage() .......... Match host locale for i18n
```

## 7. File Architecture
```
acta/
  app/
    layout.tsx ............. Root layout (Inter font, ToastProvider, ErrorBoundary)
    page.tsx ............... Main app (tabs, state, all integrations)
    globals.css ............ Design system (animations, card variants, utilities)
    api/
      escrows/route.ts ..... Escrow CRUD (Neon + in-memory fallback)
      bounty/verify/route.ts  AI vision oracle endpoint
  components/
    icons.tsx .............. Lucide icon re-exports
    BottomTabs.tsx ......... Tab navigation (SVG icons, active indicator)
    BorrowWizard.tsx ....... 3-step lock wizard (animated, glassmorphic)
    BountyVerify.tsx ....... Photo + geo verification (no emoji)
    QrOverlay.tsx .......... Lender QR display (animated border)
    QrScanner.tsx .......... Real camera QR scanner (html5-qrcode)
    CreateListing.tsx ...... 3-step listing creation wizard
    Toast.tsx .............. ToastProvider + useToast hook
    Skeleton.tsx ........... Skeleton loader components
    EmptyState.tsx ......... Empty tab state component
    TrustRing.tsx .......... Circular trust score SVG
    Onboarding.tsx ......... First-time 3-screen onboarding
    ErrorBoundary.tsx ...... React error boundary
  lib/
    nimiq.ts ............... Full SDK hook (all methods)
    escrow.ts .............. Types, seed data, local persistence
    qr.ts ................. Ed25519 QR handshake oracle
    db.ts ................. Neon Postgres CRUD
    vision.ts ............. Hetzner Qwen3.6 vision oracle
  LICENSE .................. MIT License
  .gitignore ............... Excludes .env*, .admin/, node_modules
```

## 8. Disclosed Limitations (Hackathon Build)
1. **GPS Spoofing:** Standard HTML5 geolocation. Production requires hardened anti-spoofing SDK.
2. **AI Hallucinations:** Vision API can be tricked by secondary screens. Production requires live-only camera.
3. **Asset Volatility:** Uses native NIM. Production would bridge USDC/USDT for stable collateral.
4. **Escrow Vault:** Backend-managed address, not a true HTLC smart contract. Production requires on-chain escrow.
5. **Rate Limits:** Hetzner Inference limited to 10 req/60s per API key.

## 9. Required Submission Artifacts
- [x] MIT LICENSE file
- [x] .gitignore excludes secrets
- [ ] Public GitHub repo
- [ ] Live deployment URL (Vercel)
- [ ] README.md with 250-word description
- [ ] Demo video (optional but strongly encouraged)

## 10. Build Status Log
- **v0.1 (Phase 1-2):** Scaffold, basic escrow lock, Ed25519 QR, mock mode.
- **v0.2 (Phase 3):** Neon Postgres shared state, Hetzner Qwen3.6 vision oracle.
- **v0.3 (CURRENT REBUILD):** Full UI overhaul, real SDK integration, competition compliance.
  - New: 9 components (Toast, Skeleton, Icons, QrScanner, CreateListing, TrustRing, EmptyState, Onboarding, ErrorBoundary)
  - Refactored: All existing components (SVG icons, animations, no emoji)
  - Upgraded: nimiq.ts (full SDK), escrow.ts (categories, descriptions), db.ts (new fields)
  - Added: MIT License, animation system, card variants, gradient text
  - Next: page.tsx integration, README, deployment

```

## `scripts/init-db.ts`
```typescript
import { initDbSchema } from "../lib/db";
initDbSchema().then(() => console.log("DB initialized")).catch(console.error);

```

## `scripts/migrate-v2.ts`
```typescript
import { getSql, initDbSchema } from "../lib/db";

async function runMigration() {
  console.log("Starting DB migration...");
  const sql = getSql();
  if (!sql) {
    console.error("No DATABASE_URL found.");
    return;
  }

  // 1. Add missing columns to existing tables
  console.log("Patching listings table...");
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS yield_nim INTEGER DEFAULT 0`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other'`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS created_at BIGINT`;

  console.log("Patching escrows table...");
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS expires_at BIGINT`;
  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS description TEXT`;

  // 2. Create the missing new tables (acts, lender_keys, consumed_nonces)
  console.log("Creating new V2 tables...");
  await initDbSchema();

  console.log("Migration complete!");
}

runMigration().catch(console.error);

```

## `scripts/migrate-v3.ts`
```typescript
// Run: npx tsx scripts/migrate-v3.ts   (or add "migrate": "tsx scripts/migrate-v3.ts")
import { getSql } from "../lib/db";

async function run() {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");
  console.log("Acta migration v3...");

  await sql`ALTER TABLE escrows ADD COLUMN IF NOT EXISTS idem_key TEXT UNIQUE`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS idem_key TEXT UNIQUE`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS tx_hash TEXT`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS state TEXT NOT NULL DEFAULT 'open'`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lat DOUBLE PRECISION`;
  await sql`ALTER TABLE listings ADD COLUMN IF NOT EXISTS target_lng DOUBLE PRECISION`;

  await sql`
    CREATE TABLE IF NOT EXISTS auth_nonces (
      nonce TEXT PRIMARY KEY,
      created_at BIGINT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS venture_submissions (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      completer TEXT NOT NULL,
      proof TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      UNIQUE (listing_id, completer, status)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS idempotent_actions (
      key TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at BIGINT NOT NULL
    )
  `;

  // Backfill: existing active listings are 'open', everything else 'complete'
  await sql`UPDATE listings SET state = 'open' WHERE is_active = TRUE AND state = 'open'`;
  await sql`UPDATE listings SET state = 'complete' WHERE is_active = FALSE AND state = 'open'`;

  console.log("Migration v3 complete.");
}
run().catch((e) => { console.error(e); process.exit(1); });

```

## `components/AppChrome.tsx`
```typescript
"use client";
import { Radio, Shield, Fingerprint } from "lucide-react";
import { Seal } from "./Paper";

/* ---------- Engraved app header ---------- */
export function AppHeader({
  trustScore,
  connected,
  onCreate,
}: {
  trustScore: number;
  connected: boolean;
  onCreate: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-[max(0.9rem,env(safe-area-inset-top))] pb-3 flex justify-between items-center bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md shrink-0 border-b border-[var(--line)]">
      <div className="flex items-center gap-3">
        <Seal size={34} className="!text-[11px]">A</Seal>
        <div>
          <h1 className="caps text-sm font-semibold tracking-[0.28em] text-[var(--ink)]">
            Acta
          </h1>
          <p className="caps text-[8px] tracking-[0.24em] text-[var(--ink3)] mt-0.5">
            Action Economy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Trust chip — engraved, tappable to Passport */}
        <span className="plate rounded-full px-3 py-1.5 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[var(--verdigris)]" : "bg-[var(--wax)]"}`}
            style={connected ? { animation: "pulseDot 2.4s ease-in-out infinite" } : undefined}
          />
          <span className="figure text-xs font-semibold text-[var(--gold2)]">
            {trustScore}
          </span>
          <span className="caps text-[8px] text-[var(--ink3)]">Trust</span>
        </span>

        <button
          onClick={onCreate}
          className="press rounded-full px-4 py-2 text-xs"
        >
          + New
        </button>
      </div>
    </header>
  );
}

/* ---------- Engraved bottom tabs ---------- */
export function EngravedTabs({
  tab,
  setTab,
  activeCount,
}: {
  tab: "radar" | "active" | "passport";
  setTab: (t: "radar" | "active" | "passport") => void;
  activeCount: number;
}) {
  const items = [
    { id: "radar" as const, label: "Radar", icon: <Radio size={19} strokeWidth={1.75} /> },
    { id: "active" as const, label: "Active", icon: <Shield size={19} strokeWidth={1.75} /> },
    { id: "passport" as const, label: "Passport", icon: <Fingerprint size={19} strokeWidth={1.75} /> },
  ];
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg2)_92%,transparent)] backdrop-blur-md">
      <div className="grid grid-cols-3 px-6 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`relative flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-all duration-300 ${
                on ? "text-[var(--gold2)]" : "text-[var(--ink3)] hover:text-[var(--ink2)]"
              }`}
              style={{ fontFamily: "var(--font-grotesk)" }}
            >
              {/* engraved active notch */}
              <span
                className={`absolute -top-2 h-[3px] w-10 rounded-full bg-[var(--gold)] transition-all duration-300 ${
                  on ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{ boxShadow: "0 1px 0 var(--glow), 0 4px 8px -2px var(--shadow)" }}
              />
              <span className={on ? "breathe" : ""}>{it.icon}</span>
              <span className="flex items-center gap-1.5 caps tracking-[0.14em] text-[9px]">
                {it.label}
                {it.id === "active" && activeCount > 0 && (
                  <span className="figure rounded-full bg-[var(--gold)] px-1.5 text-[9px] font-bold text-[#1c1508]">
                    {activeCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

```

## `components/BorrowWizard.tsx`
```typescript
"use client";

import { useState } from "react";
import { Lock, Clock, X } from "lucide-react";
import {
  ESCROW_VAULT,
  MICRO_FEE_NIM,
  discountedCollateral,
  type Escrow,
  type Listing,
} from "@/lib/escrow";
import { nimToLunas } from "@/lib/nimiq";

export default function BorrowWizard({
  listing,
  trustScore,
  borrower,
  onLock,
  onClose,
  locking,
  price,
}: {
  listing: Listing;
  trustScore: number;
  borrower: string;
  locking: boolean;
  price?: number;
  onLock: (listing: Listing, amountNIM: number) => Promise<Escrow | null>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const due = listing.kind.startsWith("bounty") ? 0 : discountedCollateral(listing.collateralNIM, trustScore);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="card w-full max-w-[480px] rounded-t-3xl p-5 pb-8 sm:rounded-3xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Step {step} of 3
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-amber-300" : "bg-white/10"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Review collateral</h3>
            <p className="mt-1 text-sm text-slate-400">
              {listing.title} · {listing.owner}
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Locked to {ESCROW_VAULT}</p>
              <p className="tnum mt-1 text-3xl font-extrabold text-white">
                {due.toLocaleString()}{" "}
                <span className="text-base font-bold text-amber-300">NIM</span>
              </p>
              <p className="tnum mt-1 text-xs text-slate-500">
                {nimToLunas(due).toLocaleString()} lunas · fee {MICRO_FEE_NIM} NIM on release
              </p>
              {due < listing.collateralNIM && (
                <p className="mt-2 text-xs font-semibold text-emerald-300">
                  Trust discount applied (−{(listing.collateralNIM - due).toLocaleString()} NIM)
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-5 w-full rounded-2xl bg-amber-300 py-3.5 font-bold text-slate-950 transition-transform btn-press"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Confirm in Nimiq Pay</h3>
            <p className="mt-1 text-sm text-slate-400">
              Borrower {borrower}. One signature locks the full amount. No marketplace custody.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock size={16} className="text-amber-300" /> Collateral held in escrow vault
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={16} className="text-sky-400" /> Auto-release on lender QR proof
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-white/15 py-3.5 font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl bg-sky-400 py-3.5 font-bold text-slate-950 transition-transform btn-press"
              >
                Review terms
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Sign Contract</h3>
            <p className="mt-1 text-sm text-slate-400">
              Tap below to sign with window.nimiq. Skeleton state masks chain latency.
            </p>
            
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-[2px] border-amber-300/40 bg-slate-950/60 py-6 animate-pulse-border">
              <Lock size={28} className="text-amber-300 mb-2" />
              <p className="text-sm font-medium text-slate-400">
                {listing.kind.startsWith("bounty") ? "Required Collateral" : "Total Lock Amount"}
              </p>
              <p className="tnum mt-1 text-3xl font-extrabold text-white">
                {due.toLocaleString()} <span className="text-amber-300">NIM</span>
              </p>
              {price && <p className="text-sm text-slate-500 mt-2">~${((due * price).toFixed(2))} USD</p>}
            </div>

            <button
              disabled={locking}
              onClick={async () => {
                const e = await onLock(listing, due);
                if (e) onClose();
              }}
              className="tnum mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] py-4 text-lg font-extrabold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-60 disabled:shadow-none btn-press"
            >
              {locking ? "Locking… (confirm in wallet)" : listing.kind.startsWith("bounty") ? "Accept Challenge" : `Sign & lock ${due.toLocaleString()} NIM`}
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

```

## `components/BottomTabs.tsx`
```typescript
"use client";

import { Radio, Shield, Fingerprint } from "lucide-react";

export type Tab = "radar" | "active" | "passport";

export default function BottomTabs({
  tab,
  setTab,
  activeCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeCount: number;
}) {
  const items = [
    { id: "radar", label: "Radar", icon: <Radio size={20} /> },
    { id: "active", label: "Active", icon: <Shield size={20} /> },
    { id: "passport", label: "Passport", icon: <Fingerprint size={20} /> },
  ] as const;
  
  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0B1226]/95 backdrop-blur">
      <div className="grid grid-cols-3 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id as Tab)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-medium transition-all duration-200 ${
                on ? "text-amber-300 scale-105 opacity-100" : "text-slate-400 hover:text-slate-200 opacity-80"
              }`}
            >
              <span className="flex h-6 items-center justify-center leading-none">{it.icon}</span>
              <span className="flex items-center gap-1.5">
                {it.label}
                {it.id === "active" && activeCount > 0 && (
                  <span className="tnum rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-slate-950">
                    {activeCount}
                  </span>
                )}
              </span>
              <span
                className={`mt-0.5 h-1 w-8 rounded-full transition-all duration-200 ${
                  on ? "bg-amber-300 scale-100 opacity-100" : "bg-transparent scale-50 opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

```

## `components/BountyVerify.tsx`
```typescript
"use client";

import { useRef, useState } from "react";
import { MapPin, Camera, Check, AlertTriangle, Loader2 } from "lucide-react";

type Verdict = { pass: boolean; reason: string; model?: string } | { error: string };

export default function BountyVerify({ task, listingId, onSuccess }: { task: string; listingId: string; onSuccess?: () => void }) {
  const [geo, setGeo] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function captureGeo() {
    if (!("geolocation" in navigator)) {
      setGeo("geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeoData({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setGeo(
          `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)} (±${Math.round(p.coords.accuracy)}m)`
        );
      },
      () => setGeo("location denied — bounty needs location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function fileToDataUrl(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${f.type || "image/jpeg"};base64,${btoa(bin)}`;
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setResult(null);
    const url = await fileToDataUrl(f);
    setPreview(url);
  }

  
  async function onVerify() {
    if (!preview) return;
    setResult(null);
    setBusy(true);
    
    try {
      const res = await fetch("/api/bounty/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, imageUrl: preview, listingId, geo: geoData }),
      });
      const data = (await res.json()) as Verdict;
      
      if (!res.ok) {
        setResult(`Oracle error: ${"error" in data ? data.error : res.statusText}`);
      } else if ("pass" in data) {
        setResult(`${data.pass ? "PASS" : "FAIL"} · ${data.reason} (${data.model ?? "vision"})`);
        if (data.pass) onSuccess?.();
      }
    } catch (err) {
      setResult(err instanceof Error ? err.message : "verify failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={captureGeo}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
        >
          <MapPin size={14} className="text-amber-300" />
          {geo ? geo : "Capture location"}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
        >
          <Camera size={14} className="text-amber-300" />
          {preview ? "Retake photo" : "Take photo"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="bounty proof" className="mt-2 max-h-40 w-full rounded-lg object-cover" />
      )}
      
      <button
        onClick={onVerify}
        disabled={!preview || busy}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all btn-press ${
          preview && !busy ? "shadow-[0_0_12px_rgba(251,191,36,0.4)]" : ""
        }`}
      >
        {busy ? <Loader2 size={14} className="animate-spin text-slate-950" /> : null}
        {busy ? "Verifying with Vision Oracle..." : "Submit to Vision Oracle"}
      </button>


      {result && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 animate-scale-in ${
            result.startsWith("PASS")
              ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/30 border border-rose-500/30 text-rose-200"
          }`}
        >
          {result.startsWith("PASS") ? (
            <Check className="mt-0.5 shrink-0 text-emerald-400" size={16} />
          ) : (
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-400" size={16} />
          )}
          <p className="text-xs leading-relaxed">{result}</p>
        </div>
      )}
      
      <p className="mt-2 text-[10px] text-slate-500 text-center">
        Hetzner Inference · Qwen3.6 vision · 10 req/60s limit · disclosed: screens can spoof.
      </p>
    </div>
  );
}

```

## `components/CheckInVerify.tsx`
```typescript
"use client";
import { useState } from "react";
import { MapPin, Check, AlertTriangle, Loader2 } from "lucide-react";

export default function CheckInVerify({ listingId, onSuccess }: { listingId: string; onSuccess?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  async function handleCheckIn() {
    if (!("geolocation" in navigator)) {
      setResult("FAIL: Geolocation unavailable on device");
      return;
    }
    setBusy(true);
    setResult(null);
    
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const res = await fetch("/api/bounty/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              listingId, 
              lat: p.coords.latitude, 
              lng: p.coords.longitude, 
              accuracy: p.coords.accuracy 
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setResult(`Oracle error: ${data.error || res.statusText}`);
          } else if (data.pass) {
            setResult(`PASS · ${data.reason}`);
        onSuccess?.();
          } else {
            setResult(`FAIL · ${data.reason}`);
          }
        } catch (e) {
          setResult(e instanceof Error ? e.message : "verify failed");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setResult(`FAIL: Location denied or timeout (${err.message})`);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <button
        onClick={handleCheckIn}
        disabled={busy}
        className={`w-full flex items-center justify-center gap-2 rounded-lg bg-sky-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all btn-press`}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
        {busy ? "Acquiring satellites..." : "Check In via GPS"}
      </button>

      {result && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 animate-scale-in ${
          result.startsWith("PASS") ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-200" : "bg-rose-950/30 border border-rose-500/30 text-rose-200"
        }`}>
          {result.startsWith("PASS") ? (
            <Check className="mt-0.5 shrink-0 text-emerald-400" size={16} />
          ) : (
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-400" size={16} />
          )}
          <p className="text-xs leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}

```

## `components/CreateListing.tsx`
```typescript
'use client';
import React, { useState } from 'react';
import { LockIcon, ZapIcon, MapPinIcon, ChevronRightIcon, XIcon, Camera, QrCodeIcon, UserCheck } from 'lucide-react';

interface CreateListingProps {
  onClose: () => void;
  onSubmit: (listing: { title: string; kind: 'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual'; collateralNIM: number; description: string; requireLocation?: boolean }) => void;
}

const CreateListing: React.FC<CreateListingProps> = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [kind, setKind] = useState<'borrow' | 'bounty' | 'bounty_venture' | 'bounty_qr' | 'bounty_manual' | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [requireLocation, setRequireLocation] = useState(false);

  const handleNext = () => {
    if (step === 1 && kind) {
      if (kind === 'bounty') setStep(1.5); // Choose bounty type
      else setStep(2);
    } else if (step === 1.5 && kind) {
      setStep(2);
    } else if (step === 2 && title && amount && description) {
      setStep(3);
    } else if (step === 3) {
      onSubmit({
        title,
        kind: kind!,
        collateralNIM: parseFloat(amount),
        description,
        ...(kind!.startsWith('bounty') ? { requireLocation } : {})
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
      <div className="bg-slate-900/80 backdrop-blur p-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-lg font-semibold text-slate-100">Create Listing</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-full">
          <XIcon size={20} />
        </button>
      </div>

      <div className="flex gap-1 p-4 bg-slate-900/50">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= Math.floor(step) ? 'bg-amber-300' : 'bg-slate-800'}`} />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {step === 1 && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-2">What do you want to create?</h3>
            <button
              onClick={() => setKind('borrow')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'borrow' ? 'bg-amber-300/10 border-amber-300' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind === 'borrow' ? 'bg-amber-300 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                <LockIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-1">Borrow Item</h4>
                <p className="text-sm text-slate-400">Offer an item for others to borrow by locking NIM as collateral.</p>
              </div>
            </button>

            <button
              onClick={() => setKind('bounty')}
              className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind?.startsWith('bounty') ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-xl ${kind?.startsWith('bounty') ? 'bg-sky-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                <ZapIcon size={24} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-1">Create Bounty</h4>
                <p className="text-sm text-slate-400">Create a task and reward NIM to whoever completes it.</p>
              </div>
            </button>
          </>
        )}

        {step === 1.5 && (
          <>
            <h3 className="text-xl font-bold text-slate-100 mb-2">Choose Challenge Type</h3>
            <button
              onClick={() => setKind('bounty')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <Camera size={24} className={kind === 'bounty' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">Showcase</h4>
                <p className="text-xs text-slate-400">Creative and practical challenges where the result can be demonstrated visually.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_venture')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_venture' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <MapPinIcon size={24} className={kind === 'bounty_venture' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">Venture</h4>
                <p className="text-xs text-slate-400">Anything-goes challenges built around ideas, activities, goals, and experiences.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_qr')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_qr' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <QrCodeIcon size={24} className={kind === 'bounty_qr' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">ScanQuest</h4>
                <p className="text-xs text-slate-400">Discovery-based challenges centered around finding and unlocking hidden QR codes.</p>
              </div>
            </button>
            <button
              onClick={() => setKind('bounty_manual')}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-colors ${
                kind === 'bounty_manual' ? 'bg-sky-400/10 border-sky-400' : 'bg-slate-900 border-white/5 hover:border-white/20'
              }`}
            >
              <UserCheck size={24} className={kind === 'bounty_manual' ? 'text-sky-400' : 'text-slate-400'} />
              <div>
                <h4 className="text-md font-semibold text-slate-100">Request</h4>
                <p className="text-xs text-slate-400">Real-world tasks, favors, and opportunities that require a completed submission.</p>
              </div>
            </button>
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Enter Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={kind === 'borrow' ? 'e.g. Sony Camera' : 'e.g. Find lost keys'}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {kind === 'borrow' ? 'Required Collateral (NIM)' : 'Reward Amount (NIM)'}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 tnum"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 resize-none"
              />
            </div>
            {kind?.startsWith('bounty') && (
              <label className="flex items-center justify-between p-4 bg-slate-900 border border-white/5 rounded-xl cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <MapPinIcon size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-slate-200">Require Location</span>
                    <span className="text-xs text-slate-400">User must be at the location to claim</span>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${requireLocation ? 'bg-sky-400' : 'bg-slate-700'}`} onClick={() => setRequireLocation(!requireLocation)}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${requireLocation ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-100 mb-4">Review & Post</h3>
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className={`p-4 rounded-xl ${kind === 'borrow' ? 'bg-amber-300/10 text-amber-300' : 'bg-sky-400/10 text-sky-400'}`}>
                  {kind === 'borrow' ? <LockIcon size={32} /> : <ZapIcon size={32} />}
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{kind === 'borrow' ? 'Borrow Item' : 'Challenge'}</div>
                  <div className="text-xl font-bold text-slate-100">{title}</div>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">{kind === 'borrow' ? 'Collateral' : 'Reward'}</span>
                <span className="font-semibold text-slate-100 tnum">{amount} NIM</span>
              </div>
              <div className="py-2 text-sm text-slate-300 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-white/5">
        <button
          onClick={handleNext}
          disabled={step === 1 && !kind || step === 2 && (!title || !amount || !description)}
          className="w-full py-4 bg-amber-300 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step === 3 ? 'Post Listing' : 'Next'}
          {step < 3 && <ChevronRightIcon size={20} />}
        </button>
      </div>
    </div>
  );
};

export default CreateListing;

```

## `components/CreatorApprovals.tsx`
```typescript
"use client";
import { useEffect, useState } from "react";
import { UserCheck, ExternalLink, Loader2 } from "lucide-react";

// Renders in the Active tab for creators: pending Venture submissions
// awaiting your approval. Approving triggers the real vault payout.
export default function CreatorApprovals({ onApproved }: { onApproved?: () => void }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/bounty/submit");
      const data = await res.json();
      if (res.ok) setSubs(data.submissions ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(sub: any) {
    setBusy(sub.id);
    try {
      const res = await fetch("/api/bounty/manual_approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: sub.listingId, completerAddress: sub.completer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      setSubs((p) => p.filter((s) => s.id !== sub.id));
      onApproved?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading || subs.length === 0) return null;

  return (
    <div className="card rounded-2xl p-4 border border-sky-500/20 bg-sky-950/20 mb-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3 flex items-center gap-2">
        <UserCheck size={14} /> Awaiting Your Approval ({subs.length})
      </h4>
      <div className="space-y-3">
        {subs.map((s) => (
          <div key={s.id} className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
            <p className="text-sm font-bold text-white">{s.title}</p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">from {s.completer.slice(0, 16)}...</p>
            <p className="text-xs text-slate-300 mt-2 break-all bg-black/40 rounded-lg p-2 border border-white/5">{s.proof}</p>
            <button
              onClick={() => approve(s)}
              disabled={busy === s.id}
              className="mt-3 w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg text-xs font-bold btn-press flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
              Approve & Release Reward
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

```

## `components/EmptyState.tsx`
```typescript
import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-slate-600 mb-4 bg-slate-800/30 p-4 rounded-full border border-white/5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-[280px] mx-auto mb-6">
        {subtitle}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-amber-300/10 text-amber-300 border border-amber-300/20 px-6 py-2.5 rounded-xl font-medium hover:bg-amber-300/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

```

## `components/ErrorBoundary.tsx`
```typescript
'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from './icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4 text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangleIcon size={32} className="text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Something went wrong</h1>
          <p className="text-slate-400 mb-8 max-w-sm">
            We encountered an unexpected error while rendering this view.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl transition-colors border border-white/5"
          >
            <RefreshCwIcon size={20} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

```

## `components/LivenessLayer.tsx`
```typescript
import { ZapIcon, TrendingUpIcon, TargetIcon, UserCheck, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Leaderboard({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
        <TrendingUpIcon size={14} className="text-emerald-400" /> Trust Leaderboard
      </h3>
      <div className="space-y-3">
        {data.map((user, idx) => (
          <div key={user.address} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? "bg-amber-400 text-amber-950" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700 text-amber-100" : "bg-slate-800 text-slate-400"}`}>
                #{idx + 1}
              </div>
              <div>
                <p className="text-xs font-mono text-slate-300">{user.address.substring(0, 12)}...</p>
                <p className="text-[10px] text-slate-500">{user.itemsCompleted} challenges</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">+{user.trustScore}</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Trust</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeed({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
        <TargetIcon size={14} className="text-sky-400" /> Global Activity
      </h3>
      <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
        {data.map((act) => {
          let Icon = CheckCircle2;
          let color = "text-emerald-400";
          let bg = "bg-emerald-400/10";
          let desc = `Completed ${act.type} challenge`;

          if (act.type === "milestone") {
            Icon = ZapIcon;
            color = "text-amber-400";
            bg = "bg-amber-400/10";
            desc = `Earned ${act.proofJson?.milestone_id?.replace("ms_", "").replace("_", " ")} milestone`;
          } else if (act.oracle === "geo") {
            desc = "Verified location physically";
          } else if (act.oracle === "vision") {
            desc = `AI verified: ${act.proofJson?.verdict?.reason || "Success"}`;
          } else if (act.oracle === "qr_sig") {
            desc = "Scanned quest token in the real world";
          } else if (act.oracle === "creator") {
            Icon = UserCheck;
            color = "text-sky-400";
            bg = "bg-sky-400/10";
            desc = "Manually verified by creator";
          }

          return (
            <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className={`p-1.5 rounded-full ${bg} ${color}`}>
                  <Icon size={12} />
                </div>
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-2xl bg-slate-950/50 border border-white/5 shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{act.actor.substring(0, 9)}...</span>
                  <time className="text-[9px] text-slate-500 font-medium">
                    {formatDistanceToNow(act.createdAt, { addSuffix: true })}
                  </time>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-amber-400">+{act.amountNIM} NIM</p>
                  <a href={`https://albatross.nimiqwatch.com/transaction/${act.txHash}`} target="_blank" className="text-[9px] text-sky-400 hover:underline">View Tx</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

```

## `components/ManualVerify.tsx`
```typescript
"use client";
import { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { useNimiq } from "@/lib/nimiq";

export default function ManualVerify({ listingId }: { listingId: string }) {
  const { accounts } = useNimiq();
  const [showQr, setShowQr] = useState(false);

  // We simply encode "manual_req:listingId:completerAddress"
  const qrData = `manual_req:${listingId}:${accounts[0]}`;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-center">
      {!showQr ? (
        <>
          <p className="text-xs text-slate-400 mb-3">Show this QR code to the creator to get approved.</p>
          <button
            onClick={() => setShowQr(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-400 py-2.5 text-xs font-bold text-slate-950 btn-press"
          >
            <UserCheck size={14} /> Request Approval
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-white p-2 rounded-lg mb-2">
            <QRCode value={qrData} size={150} />
          </div>
          <p className="text-xs text-amber-400">Waiting for creator to scan...</p>
        </div>
      )}
    </div>
  );
}

```

## `components/MapRadar.tsx`
```typescript
import { MapPinIcon } from "lucide-react";

export function MapRadar({ listings }: { listings: any[] }) {
  // We'll generate pseudo-random coordinates based on listing ID to spread them on the map
  const getCoords = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 10 + (Math.abs(hash) % 80); // 10% to 90%
    const y = 20 + (Math.abs(hash >> 8) % 60); // 20% to 80%
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full aspect-[4/5] rounded-3xl bg-slate-900 overflow-hidden border border-white/10 shadow-inner">
      {/* Grid Pattern */}
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.2 }} />
      
      {/* Radar Scan Animation */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="w-[150%] aspect-square rounded-full border border-sky-400/20 animate-ping" style={{ animationDuration: '4s' }} />
         <div className="absolute w-[100%] aspect-square rounded-full border border-sky-400/40 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-widest font-bold text-sky-400">Live Scanning</p>
        <p className="text-xs text-slate-400">Found {listings.length} active bounties</p>
      </div>

      {/* Pins */}
      {listings.map((l) => (
        <div 
          key={l.id} 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
          style={getCoords(l.id)}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] flex items-center justify-center transition-transform hover:scale-110">
              <MapPinIcon size={14} className="text-sky-400" />
            </div>
            {/* Tooltip */}
            <div className="absolute top-10 whitespace-nowrap bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-30">
              <p className="text-xs font-bold text-white max-w-[150px] truncate">{l.title}</p>
              <p className="text-[10px] text-amber-400">{l.collateralNIM} NIM</p>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-full z-10 pointer-events-none">
         <p className="text-[10px] font-mono text-slate-400">LAT/LNG LINK SECURE</p>
      </div>
    </div>
  );
}

```

## `components/Onboarding.tsx`
```typescript
'use client';
import React, { useState, useEffect } from 'react';
import { LockIcon, ZapIcon, TrendingUpIcon } from './icons';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Lock NIM, Borrow Anything',
    description: 'Use your NIM as collateral to safely borrow items from people around you.',
    icon: LockIcon,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    title: 'Earn NIM, Complete Bounties',
    description: 'Verify your location or complete tasks to unlock NIM bounties in the real world.',
    icon: ZapIcon,
    color: 'text-amber-300',
    bg: 'bg-amber-300/10',
  },
  {
    title: 'Build Trust, Pay Less',
    description: 'A higher Trust Score lowers your collateral requirements over time.',
    icon: TrendingUpIcon,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('acta.onboarded', 'true');
    } catch (e) {
      // ignore
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      <button 
        onClick={handleComplete}
        className="absolute top-6 right-6 text-sm font-medium text-slate-400 hover:text-slate-200"
      >
        Skip
      </button>

      <div className="flex-1 flex items-center justify-center w-full max-w-sm">
        <div className="relative w-full h-[400px] overflow-hidden">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const Icon = step.icon;
            
            return (
              <div
                key={idx}
                className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-500 ease-in-out ${
                  isActive ? 'opacity-100 translate-x-0' : 
                  idx < currentStep ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${step.bg}`}>
                  <Icon size={48} className={step.color} />
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-4">{step.title}</h2>
                <p className="text-slate-400 text-lg">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center pb-8 gap-8">
        <div className="flex gap-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-8 bg-amber-300' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-4 bg-amber-300 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-lg transition-colors"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;

```

## `components/Paper.tsx`
```typescript
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

/* ---------- Engraved plate ---------- */
export function Plate({
  children,
  hover = false,
  className = "",
}: {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}) {
  return (
    <div className={`plate rounded-2xl ${hover ? "plate-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Floating panel ---------- */
export function Floaty({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`floaty rounded-2xl ${className}`}>{children}</div>;
}

/* ---------- Wax seal ---------- */
export function Seal({
  children,
  size = 56,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`seal font-display select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {children}
    </span>
  );
}

/* ---------- 3D press button ---------- */
export function PressButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...rest} className={`press rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </button>
  );
}

export function PressLink({
  children,
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...rest} className={`press inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </a>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...rest} className={`ghost rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </button>
  );
}

export function GhostLink({
  children,
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...rest} className={`ghost inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </a>
  );
}

/* ---------- Ornamental rule ---------- */
export function Rule({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rule ${className}`} aria-hidden>
      {children ?? <span className="font-serif text-lg leading-none">&#10086;</span>}
    </div>
  );
}

/* ---------- Marginalia (editorial side-note) ---------- */
export function Marginalia({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`marginalia text-sm leading-relaxed ${className}`}>{children}</p>;
}

/* ---------- Section kicker ---------- */
export function Kicker({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="caps text-[11px] text-[var(--gold)]">
      {index ? <span className="figure mr-2 text-[var(--ink3)]">{index}</span> : null}
      {children}
    </p>
  );
}

```

## `components/PassportDetails.tsx`
```typescript
"use client";
import { useEffect, useState } from "react";
import { Award, Zap, Activity, Grid } from "lucide-react";

export default function PassportDetails() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/passport")
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(console.error);
  }, []);

  if (!data) return <div className="animate-pulse h-40 bg-slate-900/50 rounded-3xl" />;

  const bd = data.breakdown || { completion: 0, volume: 0, tenure: 0, diversity: 0, community: 0 };
  const maxes = { completion: 35, volume: 25, tenure: 20, diversity: 10, community: 10 };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Trust Score Breakdown */}
      <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
          <Activity size={14} className="text-emerald-400" /> Trust Mechanics
        </h3>
        <div className="space-y-4">
          {[
            { key: "completion", label: "Completion Rate", color: "bg-emerald-400" },
            { key: "volume", label: "Volume History", color: "bg-blue-400" },
            { key: "tenure", label: "Account Tenure", color: "bg-purple-400" },
            { key: "diversity", label: "Oracle Diversity", color: "bg-amber-400" },
            { key: "community", label: "Community Value", color: "bg-rose-400" },
          ].map((item) => (
            <div key={item.key}>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{item.label}</span>
                <span className="text-[10px] font-bold text-slate-200 tnum">{bd[item.key as keyof typeof bd]} / {maxes[item.key as keyof typeof maxes]} pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full`} 
                  style={{ width: `${(bd[item.key as keyof typeof bd] / maxes[item.key as keyof typeof maxes]) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Zap size={14} className="text-amber-400" /> Milestones Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                <Award size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {m.m_id?.replace("ms_", "").replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Act Stamps */}
      {data.stamps && data.stamps.length > 0 && (
        <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Grid size={14} className="text-sky-400" /> Act Stamps
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {data.stamps.map((stamp: any) => (
              <div key={stamp.id} className="aspect-[3/4] rounded-xl bg-slate-800 border-2 border-slate-700 p-2 flex flex-col justify-between items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold w-full truncate border-b border-white/5 pb-1">{stamp.oracle}</div>
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-inner border border-white/5">
                  <span className="text-[10px]">{stamp.type.slice(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-sky-400 tnum">{stamp.amount_nim} NIM</div>
                  <div className="text-[8px] text-slate-500">{new Date(stamp.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

```

## `components/QrOverlay.tsx`
```typescript
"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, X } from "lucide-react";
import type { Escrow } from "@/lib/escrow";

export default function QrOverlay({
  token,
  escrow,
  onClose,
}: {
  token: string;
  escrow: Escrow;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm animate-fade-in">
      <div className="glass relative w-full max-w-sm rounded-3xl border border-white/15 p-5 text-center animate-scale-in">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-full bg-white/5 p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        <h2 className="mt-2 text-xl font-bold text-gradient-gold">Return Confirmed</h2>
        <p className="mt-1 text-sm text-slate-400">Scan lender QR to release funds</p>
        <p className="tnum mt-2 text-xs font-medium text-slate-300">
          {escrow.title} · <span className="text-sky-400">{(escrow.amountNIM - escrow.feeNIM).toLocaleString()} NIM back</span>
        </p>

        <div className="mx-auto mt-6 w-fit rounded-2xl bg-gradient-to-tr from-amber-500/40 via-transparent to-amber-300/40 p-[2px] animate-pulse-border">
          <div className="rounded-[14px] bg-white p-3">
            <QRCodeSVG value={token} size={200} />
          </div>
        </div>

        <p className="mt-5 break-all rounded-xl bg-slate-950/70 p-2 text-[10px] text-slate-400">
          {token.slice(0, 120)}…
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(token);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 py-3 text-sm font-semibold transition-colors hover:bg-white/5 btn-press"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-300" />}
            {copied ? "Copied" : "Copy"}
          </button>
          
          <button
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: 'Acta payload',
                    text: token
                  });
                }
              } catch {}
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-300 py-3 text-sm font-bold text-slate-950 transition-transform btn-press"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

```

## `components/QrScanner.tsx`
```typescript
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons';
import { Loader2 } from 'lucide-react';

let Html5QrcodeScanner: any = null;

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    let scanner: any = null;

    const initScanner = async () => {
      try {
        if (!Html5QrcodeScanner) {
          const mod = await import('html5-qrcode');
          Html5QrcodeScanner = mod.Html5QrcodeScanner;
        }

        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          false
        );
        scannerRef.current = scanner;

        scanner.render(
          (decodedText: string) => {
            setVerifying(true);
            scanner.clear();
            onScan(decodedText);
          },
          (err: any) => {
            if (err?.name === "NotAllowedError") {
              setError('Camera access denied. Please enable permissions.');
              scanner.clear();
            }
          }
        );
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
            setError('Camera access denied. Please enable permissions.');
        } else {
            setError('Camera unavailable.');
        }
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Full bleed camera container */}
      <div id="qr-reader" className={`absolute inset-0 w-full h-full ${error || verifying ? 'hidden' : ''}`} />
      
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col">
        {/* Header (blurred obsidian frame) */}
        <div className="bg-slate-950/60 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/5 pointer-events-auto pt-safe">
          <h2 className="text-lg font-semibold text-slate-100">{verifying ? "Verifying..." : "Scan Return QR"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 rounded-full transition-colors">
            <XIcon size={20} />
          </button>
        </div>

        {/* Center cutout */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" style={{ maskImage: 'radial-gradient(circle at center, transparent 35%, black 45%)', WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 45%)' }} />
          
          {error ? (
            <div className="relative z-10 text-center p-6 text-rose-400 bg-slate-900/90 rounded-2xl border border-rose-500/20 backdrop-blur-xl pointer-events-auto">
              <p className="font-semibold">{error}</p>
            </div>
          ) : verifying ? (
            <div className="relative z-10 text-center flex flex-col items-center gap-4 text-amber-400">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-mono text-sm tracking-widest font-bold">VERIFYING SIGNATURE</p>
            </div>
          ) : (
            <div className="relative w-[260px] h-[260px] z-10">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
              
              {/* Scanline */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          90% { opacity: 0; }
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
        #qr-reader__scan_region {
          height: 100% !important;
        }
        #qr-reader__dashboard {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default QrScanner;

```

## `components/Reveal.tsx`
```typescript
"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll reveal: children rise out of the page like ink when they enter
// the viewport. `delay` staggers siblings; `as` lets you keep semantics.
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    let timeoutId: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            clearTimeout(timeoutId);
            setShown(true);
          } else {
            timeoutId = setTimeout(() => {
              setShown(false);
            }, 3000);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => {
      clearTimeout(timeoutId);
      io.disconnect();
    };
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
      className={`reveal ${shown ? "revealed" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

```

## `components/Skeleton.tsx`
```typescript
import React from 'react';

export const SkeletonLine: React.FC<{ className?: string }> = ({ className = 'w-full' }) => (
  <div className={`h-4 bg-slate-700/50 rounded-md animate-pulse ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-4 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-16 h-6 bg-slate-700/50 rounded-full" />
      <div className="w-8 h-8 bg-slate-700/50 rounded-full" />
    </div>
    <div className="space-y-2">
      <SkeletonLine className="w-3/4" />
      <SkeletonLine className="w-1/2" />
    </div>
    <div className="flex justify-between items-end mt-2">
      <div className="w-24 h-8 bg-slate-700/50 rounded-md" />
      <div className="w-24 h-10 bg-slate-700/50 rounded-xl" />
    </div>
  </div>
);

export const SkeletonEscrow: React.FC = () => (
  <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 bg-slate-700/50 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonLine className="w-1/2" />
      <SkeletonLine className="w-1/3" />
    </div>
    <div className="w-16 h-6 bg-slate-700/50 rounded-full" />
  </div>
);

export const SkeletonPassport: React.FC = () => (
  <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 flex flex-col items-center gap-4 animate-pulse">
    <div className="w-32 h-32 bg-slate-700/50 rounded-full" />
    <SkeletonLine className="w-1/3 h-6" />
    <div className="w-full grid grid-cols-2 gap-4 mt-4">
      <div className="h-20 bg-slate-700/50 rounded-xl" />
      <div className="h-20 bg-slate-700/50 rounded-xl" />
    </div>
  </div>
);

```

## `components/SuccessPayoff.tsx`
```typescript
import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";

export function SuccessPayoff({ amount, onClose }: { amount?: number, onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // 0 = Initial pop, 1 = numbers rolling, 2 = fade out
    setTimeout(() => setStage(1), 100);
    setTimeout(() => setStage(2), 2000);
    setTimeout(() => onClose(), 2500);
  }, [onClose]);

  if (stage === 2) return null;

  return (
    <div className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center transition-opacity duration-500 ${stage === 2 ? "opacity-0" : "opacity-100"}`}>
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" />
      
      {/* Sunburst background */}
      <div className="absolute w-[200vw] h-[200vw] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0deg,rgba(52,211,153,0.1)_10deg,transparent_20deg)]" style={{ animationDuration: '10s' }} />
      
      <div className={`relative z-10 flex flex-col items-center transform transition-all duration-700 ${stage === 0 ? "scale-50 translate-y-10 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}>
        <div className="w-24 h-24 bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(52,211,153,0.8)] border-4 border-emerald-200">
           <CheckIcon size={48} className="text-emerald-950 stroke-[3]" />
        </div>
        <h2 className="text-3xl font-black text-white mt-6 tracking-tight drop-shadow-md">ACT SETTLED</h2>
        {amount !== undefined && amount > 0 && (
          <p className="text-2xl font-bold text-emerald-400 mt-2 tnum drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
            +{amount.toLocaleString()} NIM
          </p>
        )}
      </div>
    </div>
  );
}

```

## `components/Toast.tsx`
```typescript
'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckIcon, AlertTriangleIcon, ZapIcon, XIcon } from './icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // Keep max 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 max-w-[480px] mx-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 w-full bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-lg pointer-events-auto transition-all animate-in slide-in-from-top fade-in duration-300"
          >
            {t.type === 'success' && <CheckIcon className="text-emerald-400" size={20} />}
            {t.type === 'error' && <AlertTriangleIcon className="text-rose-400" size={20} />}
            {t.type === 'info' && <ZapIcon className="text-sky-400" size={20} />}
            <span className="flex-1 text-sm font-medium text-slate-100">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-200">
              <XIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

```

## `components/TreasuryCard.tsx`
```typescript
import { WalletIcon, TrendingUpIcon, ActivityIcon, ArrowUpRight, LockIcon, BarChart2Icon } from "lucide-react";

export function TreasuryCard({
  fees,
  distributed,
  balance,
  vaultAddress,
  price,
  tvl,
  volume,
}: {
  fees: number;
  distributed: number;
  balance: number | null;
  vaultAddress: string;
  price: number;
  tvl: number;
  volume: number;
}) {
  return (
    <div className="card rounded-2xl p-4 border border-white/5 bg-slate-900/50 mb-6 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />

      <div className="relative z-10 flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <WalletIcon size={12} className="text-amber-400" /> Protocol Treasury
        </h3>
        <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-sm">
          <ActivityIcon size={8} /> On-chain
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-x-2 gap-y-3 mb-3">
        {/* TVL */}
        <div>
          <p className="text-[9px] text-emerald-400/80 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <LockIcon size={9} /> Total Value Locked
          </p>
          <p className="text-lg font-black text-white tnum leading-tight">
            {tvl.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">NIM</span>
          </p>
        </div>

        {/* Volume */}
        <div>
          <p className="text-[9px] text-blue-400/80 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <BarChart2Icon size={9} /> 30-Day Volume
          </p>
          <p className="text-lg font-black text-white tnum leading-tight">
            {volume.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">NIM</span>
          </p>
        </div>

        {/* Vault Balance */}
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Vault Balance</p>
          <p className="text-[13px] font-bold text-white tnum">
            {balance == null ? "—" : balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        
        {/* Fees */}
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Fees Collected</p>
          <p className="text-[13px] font-bold text-amber-400 tnum">+{fees.toLocaleString()} NIM</p>
        </div>
      </div>

      <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <p className="text-[9px] text-slate-500 leading-tight">
          <span className="text-slate-600 font-mono">{vaultAddress.slice(0, 16)}...</span>
        </p>
        <a
          href={`https://albatross.nimiqwatch.com/address/${vaultAddress.replace(/\s/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-slate-950 bg-amber-400 px-2.5 py-1 rounded-md btn-press"
        >
          View Vault <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}

```

## `components/TrustRing.tsx`
```typescript
'use client';
import React, { useEffect, useState } from 'react';

interface TrustRingProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

const TrustRing: React.FC<TrustRingProps> = ({ score, size = 160, label = 'Trust Score' }) => {
  const [mounted, setMounted] = useState(false);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeScore = Math.max(0, Math.min(100, score));
  
  // State for animated offset
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    setMounted(true);
    // Slight delay before animating
    const timer = setTimeout(() => {
      const targetOffset = circumference - (safeScore / 100) * circumference;
      setOffset(targetOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [safeScore, circumference]);

  let colorClass = 'text-rose-400';
  let glowClass = 'drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]'; // rose-400
  if (safeScore >= 60) {
    colorClass = 'text-emerald-400';
    glowClass = 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]'; // emerald-400
  } else if (safeScore >= 30) {
    colorClass = 'text-amber-300';
    glowClass = 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'; // amber-300
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out ${glowClass}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-bold tnum ${colorClass}`}>{safeScore}</span>
        {label && <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
};

export default TrustRing;

```

## `components/VentureVerify.tsx`
```typescript
"use client";
import { useState } from "react";
import { Send, Check, Loader2, AlertTriangle } from "lucide-react";

// REAL submission: stores the proof server-side for the creator to approve.
export default function VentureVerify({ listingId }: { listingId: string }) {
  const [proof, setProof] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!proof.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bounty/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, proof: proof.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-center text-emerald-200 animate-fade-in flex items-center justify-center gap-2">
        <Check size={16} /> <span className="text-xs">Proof recorded. The creator has been notified.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400 mb-2">Submit your proof (link, description, evidence):</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="https://... or describe what you did"
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-300 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!proof.trim() || busy}
          className="bg-amber-400 text-slate-950 px-3 rounded-lg font-bold disabled:opacity-50 btn-press flex items-center justify-center w-10"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs">
          <AlertTriangle size={12} /> {error}
        </div>
      )}
    </div>
  );
}

```

## `components/icons.tsx`
```typescript
import React from 'react';
import {
  Radio,
  Shield,
  Fingerprint,
  Lock,
  Unlock,
  Scan,
  Camera,
  MapPin,
  Plus,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Copy,
  Share,
  Clock,
  Zap,
  Search,
  ArrowLeft,
  Send,
  Image as ImageIcon,
  RefreshCw,
  Wifi,
  WifiOff,
  Star,
  TrendingUp,
  type LucideProps
} from 'lucide-react';

export type IconProps = LucideProps & { size?: number; className?: string };

const createIcon = (IconComponent: React.ElementType) => {
  const WrappedIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
    <IconComponent size={size} className={className} {...props} />
  );
  WrappedIcon.displayName = 'WrappedIcon';
  return WrappedIcon;
};

export const RadarIcon = createIcon(Radio);
export const ActiveIcon = createIcon(Shield);
export const PassportIcon = createIcon(Fingerprint);
export const LockIcon = createIcon(Lock);
export const UnlockIcon = createIcon(Unlock);
export const ScanIcon = createIcon(Scan);
export const CameraIcon = createIcon(Camera);
export const MapPinIcon = createIcon(MapPin);
export const PlusIcon = createIcon(Plus);
export const ChevronRightIcon = createIcon(ChevronRight);
export const XIcon = createIcon(X);
export const CheckIcon = createIcon(Check);
export const AlertTriangleIcon = createIcon(AlertTriangle);
export const CopyIcon = createIcon(Copy);
export const ShareIcon = createIcon(Share);
export const ClockIcon = createIcon(Clock);
export const ZapIcon = createIcon(Zap);
export const SearchIcon = createIcon(Search);
export const ArrowLeftIcon = createIcon(ArrowLeft);
export const SendIcon = createIcon(Send);
// Name conflict with global Image
export const ImageIconComponent = createIcon(ImageIcon);
export const RefreshCwIcon = createIcon(RefreshCw);
export const WifiIcon = createIcon(Wifi);
export const WifiOffIcon = createIcon(WifiOff);
export const StarIcon = createIcon(Star);
export const TrendingUpIcon = createIcon(TrendingUp);

```

## `lib/auth-client.ts`
```typescript
// Drop-in cached auth for the client. Replaces the ensureAuth callback in
// app/page.tsx — pings the session endpoint first so the wallet signature
// sheet only appears once per session, not once per action.
"use client";

let cachedFor: string | null = null;

export async function ensureAuthed(
  address: string | undefined,
  signMessage: (msg: string) => Promise<{ publicKey: unknown; signature: unknown }>
): Promise<boolean> {
  if (!address) return false;
  if (cachedFor === address) return true;

  const probe = await fetch("/api/auth/session", { cache: "no-store" }).catch(() => null);
  if (probe && probe.ok) {
    cachedFor = address;
    return true;
  }

  try {
    const chal = await fetch("/api/auth/challenge");
    const { nonce } = await chal.json();
    const sig = await signMessage(nonce);

    const toHex = (v: unknown) =>
      typeof v === "string"
        ? v.replace(/^0x/, "")
        : "0x" +
          Array.from(v as Uint8Array)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKeyHex: toHex(sig.publicKey),
        signatureHex: toHex(sig.signature),
        nonce,
      }),
    });
    if (res.ok) {
      cachedFor = address;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

```

## `lib/backend-nimiq.ts`
```typescript
import * as Nimiq from "@nimiq/core";

export async function executeVaultPayout(
  recipientAddress: string,
  amountNIM: number,
  feeNIM: number = 0.5
): Promise<string> {
  const seedPhrase = process.env.VAULT_SEED_PHRASE;
  const rpcUrl = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
  const networkId = parseInt(process.env.NIMIQ_NETWORK_ID || "24", 10);

  if (!seedPhrase) {
    throw new Error("Backend Vault Seed Phrase not configured in environment.");
  }

  // 1. Derive KeyPair
  const entropy = Nimiq.MnemonicUtils.mnemonicToEntropy(seedPhrase).serialize();
  const extPrivKey = Nimiq.ExtendedPrivateKey.generateMasterKey(entropy);
  const privKey = extPrivKey.derivePath("m/44'/242'/0'/0'").privateKey;
  const keyPair = Nimiq.KeyPair.derive(privKey);
  const sender = keyPair.publicKey.toAddress();

  // 2. Fetch current block height for validity_start_height
  const rpcRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getBlockNumber",
      params: [],
      id: 1,
    }),
  });
  const rpcData = await rpcRes.json();
  if (!rpcData || !rpcData.result || typeof rpcData.result.data !== "number") {
    throw new Error("Failed to fetch block number from RPC");
  }
  const blockHeight = rpcData.result.data;

  // 3. Construct and Sign Transaction
  const recipient = Nimiq.Address.fromUserFriendlyAddress(recipientAddress);
  const valueLunas = BigInt(Math.round(amountNIM * 100_000));
  const feeLunas = BigInt(Math.round(feeNIM * 100_000));

  const tx = Nimiq.TransactionBuilder.newBasic(
    sender,
    recipient,
    valueLunas,
    feeLunas,
    blockHeight,
    networkId
  );
  tx.sign(keyPair, undefined as any);
  const txHex = tx.toHex();

  // 4. Broadcast via RPC
  const broadcastRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "sendRawTransaction",
      params: [txHex],
      id: 2,
    }),
  });
  const broadcastData = await broadcastRes.json();

  if (broadcastData.error) {
    throw new Error(`RPC Broadcast Error: ${broadcastData.error.message || JSON.stringify(broadcastData.error)}`);
  }

  return broadcastData.result?.data || tx.hash();
}

```

## `lib/db.ts`
```typescript
import { neon } from "@neondatabase/serverless";
import type { Escrow, Listing, UserProfile, Act, LenderKey } from "./escrow";

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function hasDb() {
  return !!process.env.DATABASE_URL;
}

export async function initDbSchema() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const sql = neon(url);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      trust_score INTEGER DEFAULT 0,
      total_volume_nim INTEGER DEFAULT 0,
      items_completed INTEGER DEFAULT 0,
      joined_at BIGINT
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      owner TEXT NOT NULL,
      collateral_nim INTEGER NOT NULL,
      yield_nim INTEGER DEFAULT 0,
      duration_days INTEGER DEFAULT 1,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at BIGINT,
      is_active BOOLEAN DEFAULT TRUE,
      idem_key TEXT UNIQUE,
      tx_hash TEXT,
      state TEXT NOT NULL DEFAULT 'open',
      target_lat DOUBLE PRECISION,
      target_lng DOUBLE PRECISION
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS escrows (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      title TEXT NOT NULL,
      borrower TEXT NOT NULL,
      amount_nim INTEGER NOT NULL,
      fee_nim INTEGER NOT NULL,
      yield_nim INTEGER DEFAULT 0,
      state TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      lender_pubkey TEXT,
      expires_at BIGINT,
      resolved_at BIGINT,
      description TEXT,
      idem_key TEXT UNIQUE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS acts (
      id TEXT PRIMARY KEY,
      actor_address TEXT NOT NULL,
      type TEXT NOT NULL,
      oracle TEXT NOT NULL,
      listing_id TEXT,
      escrow_id TEXT,
      amount_nim INTEGER NOT NULL,
      fee_nim INTEGER NOT NULL,
      proof_json JSONB,
      tx_hash_in TEXT,
      tx_hash_out TEXT,
      created_at BIGINT NOT NULL,
      settled_at BIGINT,
      idempotency_key TEXT UNIQUE
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS consumed_nonces (nonce TEXT PRIMARY KEY, consumed_at BIGINT NOT NULL);
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS lender_keys (
      owner_address TEXT PRIMARY KEY,
      public_key_hex TEXT NOT NULL,
      private_key_hex_encrypted TEXT NOT NULL
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS auth_nonces (nonce TEXT PRIMARY KEY, created_at BIGINT NOT NULL);
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS venture_submissions (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL,
      completer TEXT NOT NULL,
      proof TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      UNIQUE (listing_id, completer, status)
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS idempotent_actions (
      key TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at BIGINT NOT NULL
    );
  `;
}

export async function ensureUser(address: string): Promise<UserProfile> {
  const sql = getSql();
  if (!sql) {
    return { address, trustScore: 0, totalVolumeNIM: 0, itemsCompleted: 0, joinedAt: Date.now() };
  }
  await sql`
    INSERT INTO users (address, joined_at)
    VALUES (${address}, ${Date.now()})
    ON CONFLICT (address) DO NOTHING
  `;
  const res = await sql`SELECT * FROM users WHERE address = ${address}`;
  const row = res[0] as any;
  return {
    address: row.address,
    trustScore: row.trust_score ?? 0,
    totalVolumeNIM: row.total_volume_nim ?? 0,
    itemsCompleted: row.items_completed ?? 0,
    joinedAt: row.joined_at ?? Date.now(),
  };
}

// -- Lender Keys --
export async function getLenderKey(address: string): Promise<LenderKey | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM lender_keys WHERE owner_address = ${address}`;
  if (res.length > 0) {
    return {
      ownerAddress: res[0].owner_address,
      publicKeyHex: res[0].public_key_hex,
      privateKeyHexEncrypted: res[0].private_key_hex_encrypted
    };
  }
  return null;
}

export async function setLenderKey(key: LenderKey) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO lender_keys (owner_address, public_key_hex, private_key_hex_encrypted)
    VALUES (${key.ownerAddress}, ${key.publicKeyHex}, ${key.privateKeyHexEncrypted})
    ON CONFLICT (owner_address) DO UPDATE SET
      public_key_hex = EXCLUDED.public_key_hex,
      private_key_hex_encrypted = EXCLUDED.private_key_hex_encrypted
  `;
}

// -- Nonces --
export async function consumeNonce(nonce: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock mode
  try {
    await sql`INSERT INTO consumed_nonces (nonce, consumed_at) VALUES (${nonce}, ${Date.now()})`;
    return true;
  } catch (e) {
    return false; // Constraint violation = already consumed
  }
}

import { computeAndUpdateTrustScore } from "./trust";

// -- Acts --
export async function insertAct(act: Act) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO acts (
      id, actor_address, type, oracle, listing_id, escrow_id, amount_nim, fee_nim, proof_json, tx_hash_in, tx_hash_out, created_at, settled_at, idempotency_key
    ) VALUES (
      ${act.id}, ${act.actorAddress}, ${act.type}, ${act.oracle}, ${act.listingId || null}, ${act.escrowId || null}, ${act.amountNIM}, ${act.feeNIM}, ${act.proofJson ? JSON.stringify(act.proofJson) : null}, ${act.txHashIn || null}, ${act.txHashOut || null}, ${act.createdAt}, ${act.settledAt || null}, ${act.idempotencyKey || null}
    )
  `;
  // After inserting an act, update the user's trust score.
  // We do it asynchronously in the background.
  computeAndUpdateTrustScore(act.actorAddress).catch(console.error);
}

// -- Listings --
export async function fetchListings(): Promise<Listing[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`SELECT * FROM listings WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 50`;
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    owner: r.owner,
    collateralNIM: r.collateral_nim,
    yieldNIM: r.yield_nim,
    durationDays: r.duration_days,
    kind: r.kind,
    category: r.category,
    description: r.description,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    isActive: r.is_active,
    state: r.state,
    txHash: r.tx_hash,
    targetLat: r.target_lat,
    targetLng: r.target_lng
  }));
}

export async function insertListing(l: Listing) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO listings (
      id, title, owner, collateral_nim, yield_nim, duration_days, kind, category, description, created_at, is_active, tx_hash, state, target_lat, target_lng
    ) VALUES (
      ${l.id}, ${l.title}, ${l.owner}, ${l.collateralNIM}, ${l.yieldNIM || 0}, ${l.durationDays || 1}, ${l.kind}, ${l.category}, ${l.description}, ${l.createdAt}, ${l.isActive}, ${l.txHash || null}, ${l.state || 'open'}, ${l.targetLat || null}, ${l.targetLng || null}
    )
  `;
}

// -- Escrows --
export async function fetchEscrows(): Promise<Escrow[]> {
  const sql = getSql();
  if (!sql) return [];
  const rows = await sql`SELECT * FROM escrows ORDER BY created_at DESC LIMIT 100`;
  return rows.map((r: any) => ({
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  }));
}

export async function insertEscrow(e: Escrow) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    INSERT INTO escrows (
      id, listing_id, title, borrower, amount_nim, fee_nim, yield_nim, state, tx_hash, created_at, lender_pubkey, expires_at, description
    ) VALUES (
      ${e.id}, ${e.listingId}, ${e.title}, ${e.borrower}, ${e.amountNIM}, ${e.feeNIM}, ${e.yieldNIM || 0}, ${e.state}, ${e.txHash}, ${e.createdAt}, ${e.lenderPubkey || null}, ${e.expiresAt || null}, ${e.description || null}
    )
  `;
}

export async function fetchEscrow(id: string): Promise<Escrow | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM escrows WHERE id = ${id}`;
  if (res.length === 0) return null;
  const r = res[0] as any;
  return {
    id: r.id,
    listingId: r.listing_id,
    title: r.title,
    borrower: r.borrower,
    amountNIM: r.amount_nim,
    feeNIM: r.fee_nim,
    yieldNIM: r.yield_nim,
    state: r.state,
    txHash: r.tx_hash,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    lenderPubkey: r.lender_pubkey && r.lender_pubkey !== 'null' ? r.lender_pubkey : undefined,
    expiresAt: r.expires_at && r.expires_at !== 'null' ? parseInt(r.expires_at, 10) : undefined,
    resolvedAt: r.resolved_at && r.resolved_at !== 'null' ? parseInt(r.resolved_at, 10) : undefined,
    description: r.description && r.description !== 'null' ? r.description : undefined,
  };
}

export async function atomicReleaseEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock
  const now = Date.now();
  const res = await sql`
    UPDATE escrows 
    SET state = 'released', resolved_at = ${now} 
    WHERE id = ${id} AND state = 'locked'
    RETURNING id
  `;
  return res.length > 0;
}

export async function fetchListing(id: string): Promise<Listing | null> {
  const sql = getSql();
  if (!sql) return null;
  const res = await sql`SELECT * FROM listings WHERE id = ${id}`;
  if (res.length === 0) return null;
  const r = res[0] as any;
  return {
    id: r.id,
    title: r.title,
    owner: r.owner,
    collateralNIM: r.collateral_nim,
    yieldNIM: r.yield_nim,
    durationDays: r.duration_days,
    kind: r.kind,
    category: r.category,
    description: r.description,
    createdAt: r.created_at && r.created_at !== 'null' ? parseInt(r.created_at, 10) : 0,
    isActive: r.is_active,
    state: r.state,
    txHash: r.tx_hash,
    targetLat: r.target_lat,
    targetLng: r.target_lng
  };
}

export async function atomicReleaseListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  const res = await sql`
    UPDATE listings 
    SET is_active = FALSE 
    WHERE id = ${id} AND is_active = TRUE
    RETURNING id
  `;
  return res.length > 0;
}

export async function cancelListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  const res = await sql`UPDATE listings SET is_active = FALSE WHERE id = ${id} RETURNING id`;
  return res.length > 0;
}

export async function cancelEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  const res = await sql`UPDATE escrows SET state = 'cancelled', resolved_at = ${Date.now()} WHERE id = ${id} AND state = 'locked' RETURNING id`;
  return res.length > 0;
}

```

## `lib/escrow.ts`
```typescript
export type ListingCategory = "tools" | "transport" | "electronics" | "sports" | "household" | "other" | "photo" | "delivery" | "survey" | "cleanup";
export type ListingKind = "borrow" | "bounty" | "bounty_venture" | "bounty_qr" | "bounty_manual" | "bounty_geo";
export type OracleType = "qr_sig" | "vision" | "geo" | "creator" | "system";

export type Act = {
  id: string;
  actorAddress: string;
  type: ActType;
  oracle: OracleType;
  listingId?: string;
  escrowId?: string;
  amountNIM: number;
  feeNIM: number;
  proofJson?: any;
  txHashIn?: string;
  txHashOut?: string;
  createdAt: number;
  settledAt?: number;
  idempotencyKey?: string;
};

export type LenderKey = {
  ownerAddress: string;
  publicKeyHex: string;
  privateKeyHexEncrypted: string;
};

export type EscrowState = "locked" | "settling" | "released" | "cancelled" | "disputed" | "expired";
export type ListingState = "open" | "settling" | "complete" | "cancelled";
export type ActType =
  | "borrow_lock" | "borrow_return" | "bounty" | "checkin" | "scanquest"
  | "creator" | "milestone" | "referral";

export type Listing = {
  id: string;
  title: string;
  owner: string;
  collateralNIM: number;
  yieldNIM?: number;
  durationDays?: number;
  kind: ListingKind;
  category: ListingCategory;
  description: string;
  createdAt: number;
  isActive: boolean;
  state?: ListingState;
  txHash?: string;
  targetLat?: number;
  targetLng?: number;
};

export type Escrow = {
  id: string;
  listingId: string;
  title: string;
  borrower: string; // the one locking funds
  amountNIM: number;
  feeNIM: number;
  yieldNIM: number;
  state: EscrowState;
  txHash: string;
  createdAt: number;
  lenderPubkey?: string;
  expiresAt?: number;
  resolvedAt?: number;
  description?: string;
};

export type UserProfile = {
  address: string;
  trustScore: number;
  totalVolumeNIM: number;
  itemsCompleted: number;
  joinedAt: number;
};

export const ESCROW_VAULT = process.env.NEXT_PUBLIC_VAULT_ADDRESS || "NQ86 845N NUJ3 88U4 2V9E DEDF XV8Y CFES 8RKT";
export const MICRO_FEE_NIM = 0.5;
export const MIN_NETWORK_FEE_NIM = 0.0001;

// Trust score -> collateral discount. 0..100 maps to 0..30% off, floor 70%.
export function discountedCollateral(baseNIM: number, trustScore: number) {
  const clamped = Math.max(0, Math.min(100, trustScore));
  const factor = 1 - clamped * 0.003;
  return Math.max(Math.round(baseNIM * Math.max(0.7, factor)), 1);
}

export function newId(prefix: string): string {
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(4)))
    .map((b) => b.toString(36))
    .join("")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 6);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

```

## `lib/milestones.ts`
```typescript
import { getSql } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import { newId } from "./escrow";
import { insertAct } from "./db";


export const MILESTONES = {
  FIRST_CONNECTION: { id: "ms_first_conn", rewardNIM: 10 },
  FIRST_LOCKED: { id: "ms_first_lock", rewardNIM: 15 },
  FIRST_SETTLED: { id: "ms_first_settle", rewardNIM: 25 },
  FIRST_BOUNTY: { id: "ms_first_bounty", rewardNIM: 25 },
  FIRST_LISTING: { id: "ms_first_listing", rewardNIM: 20 },
};

export async function checkAndAwardMilestone(address: string, milestoneKey: keyof typeof MILESTONES) {
  const sql = getSql();
  if (!sql) return;
  
  const milestone = MILESTONES[milestoneKey];
  
  // Check if this milestone has already been awarded to this address
  const existing = await sql`
    SELECT id FROM acts 
    WHERE actor_address = ${address} AND type = 'milestone' AND proof_json->>'milestone_id' = ${milestone.id}
    LIMIT 1
  `;
  if (existing.length > 0) return; // Already awarded

  try {
    // Attempt payout
    const txHashOut = await executeVaultPayout(address, milestone.rewardNIM, 0.0001); // 0 fee for treasury payouts? Or minimal fee 0.0001
    // We can use 0 for fee if vault covers it entirely, or 0.5 minimum if network demands. executeVaultPayout defaults to 0.5 fee, so reward must be greater.
    // Wait, if reward is 0.1 and fee is 0.5, we can't send!
    // Actually, executeVaultPayout takes (amount, fee). So total deducted from Vault is amount + fee. The user receives amount.
    
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "milestone",
      oracle: "system",
      amountNIM: milestone.rewardNIM,
      feeNIM: 0,
      proofJson: { milestone_id: milestone.id },
      txHashOut,
      createdAt: Date.now(),
      settledAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to award milestone:", err);
  }
}

```

## `lib/nimiq.ts`
```typescript
"use client";

import { useCallback, useEffect, useState } from "react";
import { init, requestDeviceIdentifier, getHostLanguage } from "@nimiq/mini-app-sdk";

export const LUNAS_PER_NIM = 100_000;

export type NimiqStatus = "loading" | "connected" | "error";

type SendArgs = {
  recipient: string;
  value: number;
  fee?: number;
};

type SendDataArgs = SendArgs & { data: string };

interface SignatureResult { publicKey: string; signature: string; }
interface ErrorResponse { error: { type: string; message: string; }; }


export function useNimiq() {
  const [status, setStatus] = useState<NimiqStatus>("loading");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [provider, setProvider] = useState<Awaited<ReturnType<typeof init>> | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [hostLanguage, setHostLanguage] = useState<string | null>(null);
  const [isConsensus, setIsConsensus] = useState<boolean>(false);
  const [blockNumber, setBlockNumber] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await init({ timeout: 2500 });
        if (cancelled) return;
        setProvider(p);
        
        try {
          const lang = getHostLanguage();
          if (!cancelled && typeof lang === 'string') setHostLanguage(lang);
        } catch {
          // ignore
        }

        try {
          const deviceResp = await requestDeviceIdentifier({
            reason: "Acta uses device identity for trust scoring and anti-spam.",
          });
          if (!cancelled && typeof deviceResp === 'string') {
             setDeviceId(deviceResp);
          }
        } catch {
          // user denied or not in Nimiq Pay
        }

        try {
          const accs = await p.listAccounts();
          if (!cancelled) {
            if (Array.isArray(accs)) {
              setAccounts(accs);
            } else if (accs && typeof accs === 'object' && 'error' in accs) {
              setAccounts([]);
            }
          }
        } catch {
          if (!cancelled) setAccounts([]);
        }
        
        if (!cancelled) setStatus("connected");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status !== "connected" || !provider) return;
    
    let cancelled = false;
    
    async function pollConsensus() {
      if (cancelled || !provider) return;
      try {
        const consensus = await provider.isConsensusEstablished();
        if (!cancelled && typeof consensus === 'boolean') {
          setIsConsensus(consensus);
        }
        
        if (consensus) {
          const bn = await provider.getBlockNumber();
          if (!cancelled && typeof bn === 'number') {
            setBlockNumber(bn);
          }
        }
      } catch {
        // ignore
      }
      if (!cancelled) {
        setTimeout(pollConsensus, 30000);
      }
    }
    
    pollConsensus();
    
    return () => {
      cancelled = true;
    };
  }, [provider, status]);

  const connected = status === "connected";

  const sendLock = useCallback(
    async (args: SendArgs): Promise<string> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sendBasicTransaction({
        recipient: args.recipient,
        value: args.value,
        fee: args.fee ?? 10,
      });
      if (typeof res === "string") return res;
      throw new Error(
        `Nimiq send failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );
  
  const sendWithData = useCallback(
    async (args: SendDataArgs): Promise<string> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sendBasicTransactionWithData({
        recipient: args.recipient,
        value: args.value,
        fee: args.fee ?? 10,
        data: args.data,
      });
      if (typeof res === "string") return res;
      throw new Error(
        `Nimiq sendWithData failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );

  const signMessage = useCallback(
    async (message: string | { message: string; isHex?: boolean }): Promise<SignatureResult> => {
      if (!provider || status !== "connected") {
        throw new Error("Nimiq Pay is not connected");
      }
      const res = await provider.sign(message);
      if (res && 'publicKey' in res && 'signature' in res) return res as SignatureResult;
      throw new Error(
        `Nimiq sign failed: ${(res as ErrorResponse)?.error?.message ?? "unknown error"}`
      );
    },
    [provider, status]
  );

  return { status, connected, accounts, deviceId, hostLanguage, isConsensus, blockNumber, sendLock, sendWithData, signMessage };
}

export function nimToLunas(nim: number) {
  return Math.round(nim * LUNAS_PER_NIM);
}

```

## `lib/price.ts`
```typescript
// Simple cache for CoinGecko NIM price
let cachedPrice = 0.0012; // fallback
let lastFetch = 0;

export async function fetchNimUsd(): Promise<number> {
  const now = Date.now();
  if (now - lastFetch < 60_000) return cachedPrice;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd", { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data["nimiq-2"]?.usd) {
        cachedPrice = data["nimiq-2"].usd;
        lastFetch = now;
      }
    }
  } catch (e) {
    console.error("Failed to fetch NIM price", e);
  }
  return cachedPrice;
}

```

## `lib/qr.ts`
```typescript
// Ed25519 QR handshake oracle (Borrowing).
// Payload: base64url(JSON { escrowId, lender, nonce, exp }) + "." + base64url(signature)
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";

// noble ed25519 v3 requires async sha512 injection per docs
ed.hashes.sha512 = sha512;

export type ReturnPayload = {
  escrowId: string;
  lender: string;
  amount: number;
  chain: string;
  nonce: string;
  exp: number;
};

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function generateLenderKeypair() {
  const priv = ed.utils.randomSecretKey();
  const pub = await ed.getPublicKeyAsync(priv);
  return {
    privateKeyHex: Buffer.from(priv).toString("hex"),
    publicKeyHex: Buffer.from(pub).toString("hex"),
  };
}

export function createReturnPayload(escrowId: string, amount: number, chain: string): ReturnPayload {
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return {
    escrowId,
    amount,
    chain,
    lender: "lender-device",
    nonce,
    exp: Date.now() + 1000 * 60 * 10,
  };
}

export async function signReturn(
  payload: ReturnPayload,
  privateKeyHex: string
): Promise<string> {
  const msg = new TextEncoder().encode(JSON.stringify(payload));
  const sig = await ed.signAsync(
    msg,
    Uint8Array.from(Buffer.from(privateKeyHex, "hex"))
  );
  return `${b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))}.${b64urlEncode(sig)}`;
}

export async function verifyReturn(
  token: string,
  publicKeyHex: string
): Promise<ReturnPayload | null> {
  try {
    const [b, s] = token.split(".");
    if (!b || !s) return null;
    const msgBytes = b64urlDecode(b);
    const sigBytes = b64urlDecode(s);
    const ok = await ed.verifyAsync(
      sigBytes,
      msgBytes,
      Uint8Array.from(Buffer.from(publicKeyHex, "hex"))
    );
    if (!ok) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(msgBytes)
    ) as ReturnPayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

```

## `lib/session.ts`
```typescript
import { cookies } from "next/headers";
import * as crypto from "crypto";

const COOKIE = "acta_session";
// Reuse the existing 32-byte secret. Set ENCRYPTION_KEY in env (it already is).
const SECRET = process.env.ENCRYPTION_KEY || "fallback_secret_length_32_bytes_xyz";
const TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export async function setSession(address: string) {
  const payload = JSON.stringify({ address, exp: Date.now() + TTL_MS });
  const value = `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function getSessionAddress(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payloadB64 = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(payload);
    return typeof p.address === "string" && p.exp > Date.now() ? p.address : null;
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

```

## `lib/settle.ts`
```typescript
import { getSql, insertAct } from "./db";
import { executeVaultPayout } from "./backend-nimiq";
import type { Act } from "./escrow";

// ---------- Escrows: locked -> settling -> released|locked ----------

export async function claimEscrow(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true; // mock mode
  const res = await sql`
    UPDATE escrows SET state = 'settling'
    WHERE id = ${id} AND state = 'locked'
    RETURNING id
  `;
  return res.length > 0;
}

export async function finalizeEscrow(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    UPDATE escrows SET state = 'released', resolved_at = ${Date.now()}
    WHERE id = ${id} AND state = 'settling'
  `;
}

export async function unclaimEscrow(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE escrows SET state = 'locked' WHERE id = ${id} AND state = 'settling'`;
}

// ---------- Listings: open -> settling -> complete|open ----------
// Also flips is_active=false at claim time so the claimed bounty
// vanishes from Radar immediately (no double-completion from the UI).

export async function claimListing(id: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return true;
  const res = await sql`
    UPDATE listings SET state = 'settling', is_active = FALSE
    WHERE id = ${id} AND state = 'open'
    RETURNING id
  `;
  return res.length > 0;
}

export async function finalizeListing(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`UPDATE listings SET state = 'complete' WHERE id = ${id} AND state = 'settling'`;
}

export async function unclaimListing(id: string) {
  const sql = getSql();
  if (!sql) return;
  await sql`
    UPDATE listings SET state = 'open', is_active = TRUE
    WHERE id = ${id} AND state = 'settling'
  `;
}

export async function cancelListingWithRefund(
  id: string,
  refundTo: string,
  amountNIM: number
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  // Claim for cancellation; if it was funded, refund before completing.
  const res = await sql`
    UPDATE listings SET state = 'settling', is_active = FALSE
    WHERE id = ${id} AND state = 'open'
    RETURNING tx_hash
  `;
  if (res.length === 0) return false;
  const txHash = (res[0] as any).tx_hash;
  if (txHash) {
    try {
      await executeVaultPayout(refundTo, amountNIM, 0.0001);
    } catch (e) {
      await unclaimListing(id);
      throw e;
    }
  }
  await sql`UPDATE listings SET state = 'cancelled' WHERE id = ${id}`;
  return true;
}

// ---------- The one true settlement pipeline ----------

export async function settleAct(
  act: Omit<Act, "txHashOut" | "settledAt">,
  payout: { to: string; amountNIM: number; feeNIM: number },
  claim: () => Promise<boolean>,
  finalize: () => Promise<void>,
  unclaim: () => Promise<void>
): Promise<{ ok: true; txHashOut: string } | { ok: false; error: string }> {
  if (!(await claim())) {
    return { ok: false, error: "Already settled or claimed" };
  }
  let txHashOut: string;
  try {
    // 1. Money moves FIRST. If this throws, the row returns to its
    //    previous state and the whole operation is safely retryable.
    txHashOut = await executeVaultPayout(payout.to, payout.amountNIM, payout.feeNIM);
  } catch (e) {
    await unclaim();
    throw e;
  }
  // 2. State transitions only after a confirmed broadcast.
  await finalize();
  // 3. The act is recorded last; insertAct also recomputes trust.
  await insertAct({ ...act, txHashOut, settledAt: Date.now() });
  return { ok: true, txHashOut };
}

```

## `lib/trust.ts`
```typescript
import { getSql } from "./db";

// NOTE: also replace `ensureUser` in lib/db.ts with the upsert version at
// the bottom of this file — first-time users currently never get a row,
// so their trust score never persists.

export async function computeAndUpdateTrustScore(address: string): Promise<number> {
  const sql = getSql();
  if (!sql) return 0;

  try {
    const actStats = await sql`
      SELECT 
        COUNT(*) as total_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN 1 ELSE 0 END) as settled_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN amount_nim ELSE 0 END) as total_volume_nim,
        MIN(created_at) as first_act_time,
        COUNT(DISTINCT oracle) as distinct_oracles
      FROM acts 
      WHERE actor_address = ${address}
    `;

    if (!actStats || actStats.length === 0 || Number(actStats[0].total_acts) === 0) {
      return 0;
    }

    const stats = actStats[0] as any;
    const totalActs = Number(stats.total_acts);
    const settledActs = Number(stats.settled_acts);
    const volumeNim = Number(stats.total_volume_nim);
    const distinctOracles = Number(stats.distinct_oracles);
    const firstActTime = Number(stats.first_act_time);

    const completionPoints = (settledActs / totalActs) * 35;
    const volumePoints = Math.min(25, (Math.log10(volumeNim + 1) / 5) * 25);
    const daysSinceFirstAct = (Date.now() - firstActTime) / (1000 * 60 * 60 * 24);
    const tenurePoints = Math.min(20, (daysSinceFirstAct / 90) * 20);
    const diversityPoints = Math.min(10, (distinctOracles / 5) * 10);

    const communityStats = await sql`
      SELECT COUNT(DISTINCT e.id) as community_acts
      FROM escrows e
      JOIN listings l ON e.listing_id = l.id
      WHERE l.owner = ${address} AND e.state = 'released'
    `;
    const communityActs = Number((communityStats[0] as any).community_acts || 0);
    const communityPoints = Math.min(10, (communityActs / 10) * 10);

    const finalScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(completionPoints + volumePoints + tenurePoints + diversityPoints + communityPoints)
      )
    );

    // Upsert, not bare UPDATE — the row may not exist yet.
    await sql`
      INSERT INTO users (address, trust_score, total_volume_nim, items_completed, joined_at)
      VALUES (${address}, ${finalScore}, ${volumeNim}, ${settledActs}, ${Date.now()})
      ON CONFLICT (address) DO UPDATE SET
        trust_score = EXCLUDED.trust_score,
        total_volume_nim = EXCLUDED.total_volume_nim,
        items_completed = EXCLUDED.items_completed
    `;

    return finalScore;
  } catch (e) {
    console.error("Failed to compute trust score:", e);
    return 0;
  }
}

```

## `lib/vision.ts`
```typescript
import OpenAI from "openai";

export const VISION_MODEL =
  process.env.VISION_MODEL ?? "Qwen/Qwen3.6-35B-A3B-FP8";
export const VISION_BASE_URL =
  process.env.OPENAI_BASE_URL ?? "https://inference.hetzner.com/api/v1";

export function visionClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ baseURL: VISION_BASE_URL, apiKey, timeout: 60_000 });
}

export type BountyVerdict = {
  pass: boolean;
  reason: string;
};

const SYSTEM = `You are a strict bounty oracle for a proof-of-action protocol.
Given a task description and one photo, decide if the photo proves the task was done.
Reply with ONLY valid JSON: {"pass": true|false, "reason": "<max 20 words>"}.
Be skeptical of screenshots, stock photos, or unrelated scenes. When in doubt, pass=false.`;

// Simple per-instance throttle: Hetzner allows 10 req/60s per key.
let windowStart = 0;
let windowCount = 0;

export function checkVisionBudget(): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= 9) {
    return { ok: false, retryAfterSec: Math.ceil((60_000 - (now - windowStart)) / 1000) };
  }
  windowCount += 1;
  return { ok: true, retryAfterSec: 0 };
}

function extractJson(text: string): BountyVerdict | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    const obj = JSON.parse(text.slice(start, end + 1)) as {
      pass?: unknown;
      reason?: unknown;
    };
    return {
      pass: obj.pass === true,
      reason: typeof obj.reason === "string" ? obj.reason.slice(0, 140) : "no reason",
    };
  } catch {
    return null;
  }
}

export async function verifyBountyPhoto(
  task: string,
  imageUrl: string
): Promise<BountyVerdict> {
  const client = visionClient();
  const res = await client.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 200,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: `Task: ${task}` },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
  });
  const text = res.choices[0]?.message?.content?.trim() ?? "";
  return (
    extractJson(text) ?? {
      pass: false,
      reason: "unparseable oracle reply",
    }
  );
}

```

## `app/globals.css`
```css
@import "tailwindcss";

/* ============================================================
   ACTA DESIGN SYSTEM — "The Engraved Ledger"
   Two themes from one token set:
     .theme-paper — the landing (18th-century ledger paper)
     .theme-ink   — the app interior (ink & gold on vellum-dark)
   ============================================================ */

@theme inline {
  --font-display: var(--font-display), "Cormorant Garamond", Georgia, serif;
  --font-serif: var(--font-serif), "EB Garamond", Georgia, serif;
  --font-grotesk: var(--font-grotesk), "Space Grotesk", system-ui, sans-serif;
  --font-mono: var(--font-mono), "IBM Plex Mono", ui-monospace, monospace;

  --color-parchment: #efe6d0;
  --color-gold: #9a7418;
  --color-wax: #8e3527;
  --color-verdigris: #40695a;
}

/* ---------- theme tokens ---------- */
.theme-paper {
  --bg: #ece2c9;
  --bg2: #e2d6b8;
  --surface: #f6efdc;
  --surface2: #eadfc4;
  --ink: #221a0f;
  --ink2: #55492f;
  --ink3: #8d7f61;
  --line: rgba(34, 26, 15, 0.16);
  --line-strong: rgba(34, 26, 15, 0.34);
  --gold: #9a7418;
  --gold2: #c19a3f;
  --wax: #8e3527;
  --verdigris: #40695a;
  --glow: rgba(255, 250, 235, 0.55);
  --shadow: rgba(56, 42, 14, 0.28);
}
.theme-ink {
  --bg: #12100c;
  --bg2: #0c0a07;
  --surface: #1a1712;
  --surface2: #221e16;
  --ink: #ece2cb;
  --ink2: #b3a68a;
  --ink3: #7c715c;
  --line: rgba(236, 226, 203, 0.1);
  --line-strong: rgba(236, 226, 203, 0.24);
  --gold: #d2a84e;
  --gold2: #e8c87e;
  --wax: #c05b4d;
  --verdigris: #6fa08c;
  --glow: rgba(236, 226, 203, 0.06);
  --shadow: rgba(0, 0, 0, 0.55);
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--ink);
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
  font-family: var(--font-serif);
}

/* Paper grain over everything. Fixed, non-interactive, theme-aware. */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 90;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.34'/%3E%3C/svg%3E");
  background-size: 240px 240px;
}
.theme-paper body::after { mix-blend-mode: multiply; opacity: 0.4; }
.theme-ink body::after { mix-blend-mode: overlay; opacity: 0.35; }

/* ============================================================
   TYPE ROLES — four fonts, four jobs, never interchangeable
   ============================================================ */
.h-display {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: -0.015em;
  line-height: 0.98;
}
.caps {
  font-family: var(--font-grotesk);
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-weight: 500;
}
.lede {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  line-height: 1.65;
}
.figure {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
.marginalia {
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--ink3);
}

/* ============================================================
   PHYSICAL SURFACES
   ============================================================ */
/* Engraved: pressed INTO the page */
.plate {
  background: linear-gradient(180deg, var(--surface), var(--surface2));
  border: 1px solid var(--line);
  box-shadow:
    inset 0 1px 0 var(--glow),
    inset 0 -1px 0 color-mix(in srgb, var(--bg) 65%, transparent),
    0 24px 48px -28px var(--shadow);
}
.engraved {
  color: color-mix(in srgb, var(--ink) 82%, var(--bg));
  text-shadow: 0 1px 0 var(--glow);
}

/* Floating: lifted OFF the page */
.floaty {
  background: linear-gradient(180deg, var(--surface), var(--surface2));
  border: 1px solid var(--line);
  box-shadow:
    0 1px 0 var(--glow) inset,
    0 30px 60px -30px var(--shadow),
    0 8px 20px -12px var(--shadow);
}
.plate-hover {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.plate-hover:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 0 1px 0 var(--glow),
    0 40px 70px -30px var(--shadow),
    0 12px 24px -12px var(--shadow);
}

/* 3D press button: a physical key with a shoulder you push past */
.press {
  font-family: var(--font-grotesk);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #1c1508;
  background: linear-gradient(180deg, var(--gold2), var(--gold));
  border: 1px solid color-mix(in srgb, var(--gold) 72%, black);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 color-mix(in srgb, var(--gold) 65%, black),
    0 12px 24px -10px var(--shadow),
    0 3px 0 color-mix(in srgb, var(--gold) 55%, black);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
  will-change: transform;
}
.press:hover { filter: brightness(1.06); }
.press:active {
  transform: translateY(3px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 4px 10px -6px var(--shadow),
    0 0 0 color-mix(in srgb, var(--gold) 55%, black);
}
.press:disabled { opacity: 0.45; pointer-events: none; }

/* Ghost: an inked outline that fills on approach */
.ghost {
  font-family: var(--font-grotesk);
  font-weight: 500;
  letter-spacing: 0.08em;
  color: var(--ink2);
  border: 1px solid var(--line-strong);
  background: transparent;
  box-shadow: inset 0 1px 0 var(--glow);
  transition: all 0.2s ease;
}
.ghost:hover {
  color: var(--ink);
  border-color: var(--gold);
  background: color-mix(in srgb, var(--gold) 8%, transparent);
}

/* Wax seal */
.seal {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  color: #f3e2d8;
  background:
    radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.35), transparent 42%),
    radial-gradient(circle at 70% 75%, rgba(0, 0, 0, 0.3), transparent 50%),
    var(--wax);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.25),
    inset 0 -4px 8px rgba(0, 0, 0, 0.4),
    0 10px 22px -8px var(--shadow);
  text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.45);
}
.seal::after {
  content: "";
  position: absolute;
  inset: 14%;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Ornamental rule */
.rule {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--ink3);
}
.rule::before, .rule::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
}

/* Ledger row with dotted leader */
.ledger-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  border-bottom: 1px dotted var(--line-strong);
  padding: 0.9rem 0.15rem;
  transition: background 0.25s ease, padding 0.25s ease;
}
.ledger-row:hover { background: color-mix(in srgb, var(--gold) 6%, transparent); }

/* ============================================================
   MOTION
   ============================================================ */
@keyframes breath {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.035); opacity: 1; }
}
@keyframes inkRise {
  from { opacity: 0; transform: translateY(26px); filter: blur(3px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes sealPop {
  0% { transform: scale(0.5) rotate(-8deg); opacity: 0; }
  62% { transform: scale(1.07) rotate(2deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes spinSlow { to { transform: rotate(360deg); } }
@keyframes scanGold {
  0%, 100% { transform: translateY(0); opacity: 0; }
  12% { opacity: 1; }
  50% { transform: translateY(100%); opacity: 1; }
  88% { opacity: 0; }
}
@keyframes pulseDot {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--verdigris) 55%, transparent); }
  50% { box-shadow: 0 0 0 6px transparent; }
}

.breathe { animation: breath 5.5s ease-in-out infinite; }
.spin-slow { animation: spinSlow 40s linear infinite; }

/* Scroll reveal — elements rise out of the paper like ink */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  filter: blur(4px);
  transition:
    opacity 1s cubic-bezier(0.16, 1, 0.3, 1),
    transform 1s cubic-bezier(0.16, 1, 0.3, 1),
    filter 1s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--d, 0ms);
}
.reveal.revealed { opacity: 1; transform: none; filter: blur(0); }

/* Hero word-by-word ink reveal */
.ink-word {
  display: inline-block;
  opacity: 0;
  animation: inkRise 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--d, 0ms);
}

/* ---------- legacy app classes (kept, re-themed) ---------- */
.tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
.glass {
  background: color-mix(in srgb, var(--surface) 78%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: inset 0 1px 0 var(--glow), 0 24px 48px -30px var(--shadow);
}
.card-borrow {
  background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 80%, #38bdf8 8%));
  border: 1px solid color-mix(in srgb, #38bdf8 22%, var(--line));
}
.card-bounty {
  background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 80%, #fbbf24 8%));
  border: 1px solid color-mix(in srgb, #fbbf24 22%, var(--line));
}
.card-success {
  background: linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface) 80%, #34d399 10%));
  border: 1px solid color-mix(in srgb, #34d399 24%, var(--line));
}
.text-gradient-gold {
  background: linear-gradient(135deg, var(--gold2), var(--gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.btn-press:active { transform: scale(0.97); transition: transform 0.1s; }

.animate-slide-up { animation: inkRise 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-slide-down { animation: inkRise 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-fade-in { animation: inkRise 0.3s ease-out forwards; }
.animate-scale-in { animation: sealPop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.animate-pulse-border { animation: pulseDot 2s ease-in-out infinite; }

input:focus, textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--gold) 60%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--gold) 25%, transparent);
}
* { scroll-behavior: smooth; }



@keyframes color-shimmer {
  0% { color: var(--ink2); text-shadow: 0 0 4px rgba(179, 166, 138, 0.1); }
  33% { color: var(--gold); text-shadow: 0 0 10px rgba(210, 168, 78, 0.4); }
  66% { color: #ffffff; text-shadow: 0 0 12px rgba(255, 255, 255, 0.6); }
  100% { color: var(--ink2); text-shadow: 0 0 4px rgba(179, 166, 138, 0.1); }
}
.tagline {
  animation: color-shimmer 10s ease-in-out infinite;
}
```

## `app/layout.tsx`
```typescript
import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  EB_Garamond,
  Space_Grotesk,
  IBM_Plex_Mono,
} from "next/font/google";
import { ToastProvider } from "@/components/Toast";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const serif = EB_Garamond({ subsets: ["latin"], variable: "--font-serif" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Acta — Money moves when reality changes",
  description:
    "A verifiable proof-of-action protocol for Nimiq. Lock NIM for borrowing and bounties; release on cryptographic, visual, geographic, or human proof.",
  appleWebApp: { capable: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#12100c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${grotesk.variable} ${mono.variable} theme-paper h-full antialiased`}
    >
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-dvh bg-[var(--bg)] text-[var(--ink)] overflow-x-hidden overscroll-none">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}

```

## `app/page.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import {
  Plate,
  Seal,
  PressLink,
  GhostLink,
  Rule,
  Marginalia,
  Kicker,
} from "@/components/Paper";
import { Lock, Scan, Unlock, Eye, MapPin, UserCheck, ArrowUpRight } from "lucide-react";

const HEADLINE = ["Money", "moves", "when", "reality", "changes."];

const ORACLES = [
  {
    n: "I",
    name: "Cryptographic Signature",
    proof: "Ed25519 QR handshake",
    detail:
      "A lender's device signs a single-use, ten-minute token. The chain of custody is mathematical — no photograph, no trust, no intermediary. Replay is impossible by construction.",
  },
  {
    n: "II",
    name: "Machine Vision",
    proof: "Qwen vision oracle",
    detail:
      "A photo is submitted to a vision model sceptical by instruction. It answers one question only: does this image prove the act occurred? Doubt defaults to refusal.",
  },
  {
    n: "III",
    name: "Geolocation",
    proof: "GPS + accuracy bound",
    detail:
      "A check-in is accepted only inside a 50-metre accuracy bound and, where the creator pinned a location, within true haversine distance of it. HTML5 geolocation; hardened SDKs on the roadmap.",
  },
  {
    n: "IV",
    name: "Human Attestation",
    proof: "Creator-as-oracle",
    detail:
      "The creator who locked the funds attests completion personally, releasing the escrow with their own key. For everything a machine cannot yet see.",
  },
];

const DOCTRINE = [
  {
    icon: Lock,
    clause: "First Clause",
    title: "Lock",
    body: "Collateral is sealed in the protocol vault by a real on-chain transaction. One signature. No marketplace ever holds what is yours.",
    hover: "Every lock is a NIM transaction you can read on the explorer — the vault address is public, the flow is auditable.",
  },
  {
    icon: Scan,
    clause: "Second Clause",
    title: "Prove",
    body: "Reality answers. A QR scanned, a photograph judged, a coordinate crossed, a creator's nod. One of four oracles must be satisfied.",
    hover: "Each oracle type used deepens your Trust Score — the protocol rewards those who prove in many ways.",
  },
  {
    icon: Unlock,
    clause: "Third Clause",
    title: "Release",
    body: "The moment proof lands, funds move. Collateral returns minus a half-NIM protocol fee that sustains the treasury.",
    hover: "The fee is not rent — it is what funds every community reward, milestone and drip the protocol pays forward.",
  },
];

export default function Landing() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const s = data?.stats;
  const feed = (data?.feed ?? []).slice(0, 6);
  const fmt = (n: number) =>
    n?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—";

  return (
    <main className="relative">
      {/* ================= MASTHEAD ================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md border-b border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <Seal size={36} className="!text-xs">A</Seal>
            <span className="caps text-sm tracking-[0.3em] font-semibold">Acta</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 caps text-[11px] text-[var(--ink2)]">
            <a href="#doctrine" className="hover:text-[var(--gold)] transition-colors">Doctrine</a>
            <a href="#oracles" className="hover:text-[var(--gold)] transition-colors">Oracles</a>
            <a href="#ledger" className="hover:text-[var(--gold)] transition-colors">Ledger</a>
          </nav>
          <PressLink href="/app" className="!px-5 !py-2.5 !text-xs">
            Enter the Protocol
          </PressLink>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="top" className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* breathing compass ornament */}
        <div className="pointer-events-none absolute -right-40 -top-24 opacity-[0.16] select-none" aria-hidden>
          <div className="breathe relative w-[520px] h-[520px]">
            <div className="absolute inset-0 rounded-full border border-[var(--ink)]" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-[var(--ink)] spin-slow" />
            <div className="absolute inset-[26%] rounded-full border border-[var(--ink)]" />
            <div className="absolute inset-[40%] rounded-full border border-dashed border-[var(--gold)] spin-slow" style={{ animationDirection: "reverse", animationDuration: "28s" }} />
            <div className="absolute inset-[48%] rounded-full bg-[var(--gold)]" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl relative">
          <Reveal>
            <Kicker index="§ 1">A proof-of-action protocol for Nimiq</Kicker>
          </Reveal>

          <h1 className="h-display mt-6 text-[13.5vw] sm:text-7xl lg:text-8xl text-[var(--ink)] max-w-4xl">
            {HEADLINE.map((w, i) => (
              <span key={i} className="ink-word mr-[0.24em]" style={{ "--d": `${200 + i * 130}ms` } as React.CSSProperties}>
                {w === "reality" ? <em className="not-italic text-[var(--gold)]">{w}</em> : w}
              </span>
            ))}
          </h1>

          <Reveal delay={500} className="mt-8 max-w-xl">
            <p className="lede text-[var(--ink2)]">
              Acta binds digital value to physical deeds. Borrow a neighbour&apos;s drill
              by locking NIM; it returns when reality says so. Bounties, quests and
              favours settle the same way — <em>act, prove, paid.</em>
            </p>
          </Reveal>

          <Reveal delay={700} className="mt-10 flex flex-wrap items-center gap-4">
            <PressLink href="/app">Open the App</PressLink>
            <GhostLink href="#doctrine">Read the Doctrine</GhostLink>
            <Marginalia className="w-full md:w-auto md:ml-2">
              No installation. Lives inside Nimiq Pay.
            </Marginalia>
          </Reveal>

          {/* live stat ribbon */}
          <Reveal delay={900} className="mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[var(--line)] divide-x divide-[var(--line)]">
              {[
                { k: "Value Locked", v: s ? `${fmt(s.tvl_nim)} NIM` : "···" },
                { k: "30-Day Volume", v: s ? `${fmt(s.volume_30d)} NIM` : "···" },
                { k: "Protocol Fees", v: s ? `${fmt(s.treasury_fees)} NIM` : "···" },
                { k: "Rewards Paid", v: s ? `${fmt(s.treasury_distributed)} NIM` : "···" },
              ].map((st) => (
                <div key={st.k} className="px-5 py-6">
                  <p className="caps text-[9px] text-[var(--ink3)]">{st.k}</p>
                  <p className="figure text-xl md:text-2xl font-semibold mt-2 text-[var(--ink)]">{st.v}</p>
                </div>
              ))}
            </div>
            <Marginalia className="mt-3 text-xs">
              Figures read live from the protocol database and vault address.
            </Marginalia>
          </Reveal>
        </div>
      </section>

      {/* ================= DOCTRINE ================= */}
      <section id="doctrine" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Rule className="mb-10"><span className="font-serif text-lg">&#10086;</span></Rule>
            <Kicker index="§ 2">The Doctrine</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Three clauses, <em className="not-italic text-[var(--gold)]">one loop.</em>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {DOCTRINE.map((d, i) => (
              <Reveal key={d.title} delay={i * 140}>
                <Plate hover className="group flex flex-col h-fit overflow-hidden">
                  <div className="p-7">
                    <p className="caps text-[9px] text-[var(--gold)]">{d.clause}</p>
                    <div className="flex items-center gap-4 mt-5">
                      <span className="seal !bg-none bg-[var(--gold)] !shadow-none flex items-center justify-center w-11 h-11 rounded-full" style={{ background: "var(--gold)" }}>
                        <d.icon size={18} className="text-[#1c1508]" strokeWidth={1.8} />
                      </span>
                      <h3 className="h-display text-3xl text-[var(--ink)]">{d.title}</h3>
                    </div>
                    <p className="mt-5 text-[15px] leading-relaxed text-[var(--ink2)]">{d.body}</p>
                  </div>
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="overflow-hidden">
                      <div className="p-7 pt-6 bg-[color-mix(in_srgb,var(--verdigris)_12%,transparent)] border-t border-[color-mix(in_srgb,var(--verdigris)_20%,transparent)]">
                        <p className="marginalia text-[13px] text-[color-mix(in_srgb,var(--ink)_80%,var(--verdigris))] saturate-150">
                          {d.hover}
                        </p>
                      </div>
                    </div>
                  </div>
                </Plate>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ORACLES ================= */}
      <section id="oracles" className="px-6 py-24 bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] border-y border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 3">The Oracle Registry</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Reality, witnessed four ways.
            </h2>
            <Marginalia className="mt-4 max-w-lg">
              Every act type names its oracle. A scan cannot satisfy a photograph;
              a photograph cannot satisfy a signature. The proof must fit the deed.
            </Marginalia>
          </Reveal>

          <div className="mt-12">
            {ORACLES.map((o, i) => (
              <Reveal key={o.n} delay={i * 90}>
                <a href={o.n === "I" ? "/app" : o.n === "II" ? "/app?tab=active" : o.n === "III" ? "/app?tab=radar" : "/app?tab=passport"} className="ledger-row group block">
                  <div className="flex items-start">
                    <span className="figure text-sm text-[var(--gold)] w-8 shrink-0 mt-1">{o.n}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-2xl text-[var(--ink)] leading-tight group-hover:text-[var(--gold)] transition-colors">{o.name}</p>
                      <p className="caps text-[9px] text-[var(--ink3)] mt-1">{o.proof}</p>
                      <p className="marginalia text-sm mt-3 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {o.detail}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="text-[var(--ink3)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LEDGER (live feed) ================= */}
      <section id="ledger" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Rule className="mb-10"><span className="font-serif text-lg">&#10086;</span></Rule>
            <a href="/app?tab=active" className="block hover:opacity-80 transition-opacity"><Kicker index="§ 4">The Ledger</Kicker></a>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              The protocol never sleeps.
            </h2>
          </Reveal>

          <div className="mt-12 grid lg:grid-cols-5 gap-8 items-start">
            <Reveal className="lg:col-span-3">
              <Plate className="p-2 sm:p-4">
                {feed.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="marginalia">The first entries are waiting to be written. Be clause one.</p>
                  </div>
                ) : (
                  <ul>
                    {feed.map((a: any) => (
                      <li key={a.id} className="ledger-row !border-b last:!border-0">
                        <span className="figure text-xs text-[var(--ink3)] w-24 shrink-0">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex-1 text-[15px] text-[var(--ink2)] truncate">
                          <span className="figure text-[var(--ink3)]">{a.actor?.slice(0, 10)}…</span>{" "}
                          settled a {a.oracle === "vision" ? "vision" : a.oracle === "geo" ? "geo" : a.oracle === "qr_sig" ? "signature" : a.oracle === "creator" ? "attested" : "protocol"} act
                        </span>
                        <span className="figure text-sm font-semibold text-[var(--gold)] shrink-0">
                          +{fmt(a.amountNIM)} NIM
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Plate>
            </Reveal>

            <Reveal delay={150} className="lg:col-span-2">
              <div className="space-y-5">
                <div className="plate p-6">
                  <a href="/app?tab=passport" className="caps text-[9px] text-[var(--gold)] hover:underline flex items-center gap-1 w-fit">The Trust Mechanic <ArrowUpRight size={10}/></a>
                  <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink2)]">
                    Every settled act compounds a public score — completion, volume,
                    tenure, oracle diversity, community value — and a higher score
                    permanently lowers your collateral. Reputation is not a badge;
                    it is <em>buying power.</em>
                  </p>
                </div>
                <div className="plate p-6">
                  <p className="caps text-[9px] text-[var(--gold)]">The Treasury</p>
                  <p className="figure text-3xl font-semibold mt-3 text-[var(--ink)]">
                    {data?.vault?.balance_nim != null
                      ? `${data.vault.balance_nim.toLocaleString(undefined, { maximumFractionDigits: 0 })} NIM`
                      : "···"}
                  </p>
                  <Marginalia className="mt-2 text-xs">
                    Held at a public vault address, sustained entirely by protocol
                    fees — every reward the protocol pays comes from deeds already proven.
                  </Marginalia>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-6 py-28 text-center border-t border-[var(--line)]">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="flex justify-center mb-8">
              <Seal size={72} className="!text-2xl">A</Seal>
            </div>
            <h2 className="h-display text-5xl sm:text-6xl text-[var(--ink)]">
              Put your NIM where<br /><em className="not-italic text-[var(--gold)]">the world is.</em>
            </h2>
            <Marginalia className="mt-6">
              Deeds settle in seconds. Reputation compounds forever.
            </Marginalia>
            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <PressLink href="/app" className="!px-8 !py-4">Enter the Protocol</PressLink>
              <GhostLink href="https://github.com/Idle0x/nimiq-acta" className="!px-8 !py-4">Read the Code</GhostLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= UNWRAPPING THE PROTOCOL ================= */}
      <section className="px-6 py-32 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 5">Unwrapping the Protocol</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)] max-w-2xl">
              Nimiq at the core. Reality at the edge.
            </h2>
            <Marginalia className="mt-6 max-w-xl">
              Acta is not a traditional web application; it is a zero-trust orchestrator. By stripping away intermediaries and embedding directly into the Nimiq Pay ecosystem, we expose the bare metal of distributed consensus. Here is how the skeleton moves.
            </Marginalia>
          </Reveal>

          <div className="mt-20 grid md:grid-cols-2 gap-x-12 gap-y-16">
            <Reveal delay={100}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>I. The Mini-App Runtime</span>
                  <span className="font-mono text-[9px] opacity-50">window.nimiq</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  Acta does not ask you to install an extension or manage a seed phrase in your browser. It runs purely as an embedded Mini-App within Nimiq Pay. By invoking the native <code className="text-xs bg-[var(--surface)] px-1 py-0.5 rounded">sendBasicTransaction()</code>, funds are locked straight from your wallet into the protocol's vault. No bridging volatile assets, no middleman routing.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>II. Albatross & Sub-Second Settlement</span>
                  <span className="font-mono text-[9px] opacity-50">Nimiq PoS</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  Proof of Action requires instant execution. Because Nimiq operates on the Albatross Proof-of-Stake consensus—capable of generating Micro Blocks in under a second—Acta's oracle verifications trigger immediate on-chain settlement. The moment you scan the return QR, the network reaches consensus, and the escrow unlocks instantly.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>III. Cryptographic Handshakes</span>
                  <span className="font-mono text-[9px] opacity-50">Ed25519</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  The ScanQuest and Borrowing oracles rely on zero-knowledge physical proximity. The lender's device uses Nimiq's native cryptographic curves to sign a ten-minute disposable payload locally. When the borrower scans the QR, they are literally transmitting mathematical proof of return. It is unforgeable by construction.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>IV. Sceptical Machine Vision</span>
                  <span className="font-mono text-[9px] opacity-50">Qwen3.6 & Neon</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  For photo proofs, Acta delegates human arbitration to a stateless AI oracle. We stream image buffers to a heavily-prompted vision model instructed to default to refusal upon any doubt. The state machine and reputation histories are then permanently etched into our Neon Serverless Postgres index, acting as the memory of the protocol.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= COLOPHON & FOOTER ================= */}
      <footer className="px-6 py-16 bg-[var(--bg2)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-16">
            <div className="md:col-span-2">
              <Seal size={32} className="!text-xs mb-4">A</Seal>
              <h3 className="h-display text-2xl text-[var(--ink)] mb-3">Acta</h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that distributed ledger technology isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <h4 className="caps text-[9px] mb-4 text-[#CDBB8A]">Nimiq Ecosystem</h4>
                <ul className="space-y-3 text-[13px]">
                  <li><a href="https://nimiq.com" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Platform</a></li>
                  <li><a href="https://nimiq.com/developers/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Developer Documentation</a></li>
                  <li><a href="https://forum.nimiq.community/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Community Forum</a></li>
                  <li><a href="https://nimiq.com/wallet/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Wallet</a></li>
                </ul>
              </div>

              <div>
                <h4 className="caps text-[9px] mb-4 text-[#BEB0D8]">Acta Project</h4>
                <ul className="space-y-3 text-[13px]">
                  <li><a href="/app" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Launch the App</a></li>
                  <li><a href="/app?tab=passport" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors flex items-center gap-1">Check Trust Score <ArrowUpRight size={12}/></a></li>
                  <li><a href="https://github.com/Idle0x/nimiq-acta" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">GitHub Repository</a></li>
                  <li><a href="#" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Hackathon Submission</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--line-strong)]">
            <p className="caps text-[9px] text-[var(--ink3)]">Acta — MMXXVI</p>
            <p className="marginalia text-xs text-center">
              Set in Cormorant, Garamond, Grotesk & Plex. Printed on the Nimiq blockchain.
            </p>
            <p className="caps text-[10px] font-bold tracking-widest tagline">Money moves when reality changes.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

```

## `app/api/bounty/verify/route.ts`
```typescript
import { NextResponse } from "next/server";
import { checkVisionBudget, verifyBountyPhoto } from "@/lib/vision";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  let body: {
    task?: string; imageUrl?: string; listingId?: string;
    geo?: { lat: number; lng: number; accuracy: number };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.task || !body.imageUrl || !body.listingId) {
    return NextResponse.json({ error: "task, listingId, and imageUrl required" }, { status: 400 });
  }
  if (body.imageUrl.length > 6_000_000) {
    return NextResponse.json({ error: "image too large (6MB cap)" }, { status: 413 });
  }
  if (body.geo && body.geo.accuracy > 50) {
    return NextResponse.json(
      { error: `Geolocation accuracy too low (${Math.round(body.geo.accuracy)}m > 50m)` },
      { status: 400 }
    );
  }

  const listing = await fetchListing(body.listingId);
  if (!listing || !listing.isActive || listing.kind !== "bounty") {
    return NextResponse.json({ error: "Bounty inactive or not found" }, { status: 400 });
  }

  const budget = checkVisionBudget();
  if (!budget.ok) {
    return NextResponse.json(
      { error: "vision oracle rate limit", retryAfterSec: budget.retryAfterSec },
      { status: 429 }
    );
  }

  try {
    const verdict = await verifyBountyPhoto(body.task, body.imageUrl);
    const model = process.env.VISION_MODEL ?? "Qwen/Qwen3.6-35B-A3B-FP8";
    if (!verdict.pass) {
      return NextResponse.json({ ...verdict, model });
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "bounty",
        oracle: "vision",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { verdict, model, geo: body.geo ?? null },
        createdAt: listing.createdAt,
      },
      { to: address, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(body.listingId!),
      () => finalizeListing(body.listingId!),
      () => unclaimListing(body.listingId!)
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ pass: true, reason: verdict.reason, model, txHashOut: result.txHashOut });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "vision call failed";
    const status = /429/.test(msg) ? 429 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}

```

## `app/api/bounty/manual_approve/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getSql, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

// Creator-as-oracle approval. Covers both 'bounty_manual' (creator scans the
// completer's QR) and 'bounty_venture' (creator approves a stored submission).
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { listingId, completerAddress } = (await req.json()) as {
      listingId?: string;
      completerAddress?: string;
    };
    if (!listingId || !completerAddress) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const listing = await fetchListing(listingId);
    if (!listing || (listing.kind !== "bounty_manual" && listing.kind !== "bounty_venture")) {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }
    if (listing.owner !== address) {
      return NextResponse.json({ error: "Only the creator can approve" }, { status: 403 });
    }

    // For Venture: only approve an actual stored pending submission.
    if (listing.kind === "bounty_venture") {
      const sql = getSql()!;
      const sub = await sql`
        UPDATE venture_submissions SET status = 'approved'
        WHERE listing_id = ${listingId} AND completer = ${completerAddress} AND status = 'pending'
        RETURNING id
      `;
      if (sub.length === 0) {
        return NextResponse.json({ error: "No pending submission from this completer" }, { status: 400 });
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: completerAddress,
        type: "bounty",
        oracle: "creator",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { approver: address },
        createdAt: listing.createdAt,
      },
      { to: completerAddress, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(completerAddress, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Manual approve error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

```

## `app/api/bounty/geo/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { getLenderKey, consumeNonce } from "@/lib/db";
import { checkAndAwardMilestone } from "@/lib/milestones";

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  try {
    const body = await req.json();
    if (!body.listingId || typeof body.lat !== "number" || typeof body.lng !== "number" || typeof body.accuracy !== "number") {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const listing = await fetchListing(body.listingId);
    if (!listing || listing.kind !== "bounty_venture") {
      return NextResponse.json({ error: "Invalid listing or not a Geo bounty" }, { status: 404 });
    }

    if (body.accuracy > 50) {
      return NextResponse.json({ pass: false, reason: "Location too inaccurate (>50m)" });
    }

    // If the creator pinned a target, enforce real proximity (haversine).
    const targetLat = (listing as any).targetLat;
    const targetLng = (listing as any).targetLng;
    if (targetLat != null && targetLng != null) {
      const dist = haversineM(body.lat, body.lng, targetLat, targetLng);
      if (dist > 150) {
        return NextResponse.json({ pass: false, reason: `You are ${Math.round(dist)}m from the target location` });
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "bounty",
        oracle: "geo",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { lat: body.lat, lng: body.lng, accuracy: body.accuracy },
        createdAt: listing.createdAt,
      },
      { to: address, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(body.listingId),
      () => finalizeListing(body.listingId),
      () => unclaimListing(body.listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ pass: true, reason: "Verified location", txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Geo Verify Route Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

```

## `app/api/bounty/submit/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, getSql, hasDb } from "@/lib/db";
import { newId } from "@/lib/escrow";

// Completer-side: stores a Venture proof for creator review.
export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const { listingId, proof } = (await req.json()) as { listingId?: string; proof?: string };
  if (!listingId || !proof || proof.trim().length < 3) {
    return NextResponse.json({ error: "listingId and proof required" }, { status: 400 });
  }
  if (proof.length > 2000) {
    return NextResponse.json({ error: "Proof too long (2KB cap)" }, { status: 413 });
  }

  const listing = await fetchListing(listingId);
  if (!listing || listing.kind !== "bounty_venture" || !listing.isActive) {
    return NextResponse.json({ error: "Invalid or inactive Venture bounty" }, { status: 400 });
  }

  const sql = getSql()!;
  // One pending submission per completer per bounty.
  await sql`
    INSERT INTO venture_submissions (id, listing_id, completer, proof, created_at, status)
    VALUES (${newId("vs")}, ${listingId}, ${address}, ${proof.trim()}, ${Date.now()}, 'pending')
    ON CONFLICT DO NOTHING
  `;
  return NextResponse.json({ ok: true });
}

// Creator-side: lists pending submissions for listings they own.
export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ submissions: [] });

  const sql = getSql()!;
  const rows = await sql`
    SELECT s.id, s.listing_id, s.completer, s.proof, s.created_at, l.title
    FROM venture_submissions s
    JOIN listings l ON l.id = s.listing_id
    WHERE l.owner = ${address} AND s.status = 'pending'
    ORDER BY s.created_at DESC
    LIMIT 50
  `;
  return NextResponse.json({
    submissions: rows.map((r: any) => ({
      id: r.id,
      listingId: r.listing_id,
      completer: r.completer,
      proof: r.proof,
      title: r.title,
      createdAt: Number(r.created_at),
    })),
  });
}

```

## `app/api/bounty/scanquest/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb, getLenderKey, consumeNonce } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const parts = token.split(".");
    if (parts.length !== 2) return NextResponse.json({ error: "Invalid token format" }, { status: 400 });

    const b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    const listingId: string = payload.escrowId; // field reused as subject id

    const listing = await fetchListing(listingId);
    if (!listing || listing.kind !== "bounty_qr") {
      return NextResponse.json({ error: "Invalid listing" }, { status: 404 });
    }

    const creatorKey = await getLenderKey(listing.owner);
    if (!creatorKey) return NextResponse.json({ error: "Creator keys missing" }, { status: 400 });

    const verified = await verifyReturn(token, creatorKey.publicKeyHex);
    if (!verified) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    if (verified.escrowId !== listingId) {
      return NextResponse.json({ error: "Token does not match this quest" }, { status: 400 });
    }

    const fresh = await consumeNonce(verified.nonce);
    if (!fresh) return NextResponse.json({ error: "QR code already used" }, { status: 400 });

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "scanquest",
        oracle: "qr_sig",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { nonce: verified.nonce },
        createdAt: listing.createdAt,
      },
      { to: address, amountNIM: listing.collateralNIM, feeNIM: MIN_NETWORK_FEE_NIM },
      () => claimListing(listingId),
      () => finalizeListing(listingId),
      () => unclaimListing(listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  } catch (err) {
    console.error("ScanQuest error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

```

## `app/api/cancel/route.ts`
```typescript
import { NextResponse } from "next/server";
import { fetchEscrow, fetchListing, cancelEscrow, hasDb } from "@/lib/db";
import { cancelListingWithRefund, claimEscrow, unclaimEscrow } from "@/lib/settle";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { getSessionAddress } from "@/lib/session";
import { insertAct, getSql } from "@/lib/db";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const { type, id } = (await req.json()) as { type?: string; id?: string };
  if (!id || (type !== "listing" && type !== "escrow")) {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
  }

  // ---- Cancel a listing: only the owner; funded bounties are refunded ----
  if (type === "listing") {
    const listing = await fetchListing(id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (listing.owner !== address) {
      return NextResponse.json({ error: "Not your listing" }, { status: 403 });
    }
    if (listing.state && listing.state !== "open") {
      return NextResponse.json({ error: "Listing already claimed or closed" }, { status: 400 });
    }
    try {
      const ok = await cancelListingWithRefund(id, address, listing.collateralNIM);
      if (!ok) return NextResponse.json({ error: "Could not cancel listing" }, { status: 400 });
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Listing refund failed:", e);
      return NextResponse.json({ error: "Refund broadcast failed — listing unchanged" }, { status: 500 });
    }
  }

  // ---- Cancel an escrow: only the borrower; full refund, no fee on cancel ----
  const escrow = await fetchEscrow(id);
  if (!escrow || escrow.state !== "locked") {
    return NextResponse.json({ error: "Cannot cancel this contract" }, { status: 400 });
  }
  if (escrow.borrower !== address) {
    return NextResponse.json({ error: "Not your contract" }, { status: 403 });
  }

  // Claim so two cancels can't race, then refund in full.
  if (!(await claimEscrow(id))) {
    return NextResponse.json({ error: "Contract is being settled" }, { status: 409 });
  }
  try {
    await executeVaultPayout(address, escrow.amountNIM, MIN_NETWORK_FEE_NIM);
  } catch (e) {
    await unclaimEscrow(id);
    console.error("Refund failed:", e);
    return NextResponse.json({ error: "Refund broadcast failed" }, { status: 500 });
  }
  await cancelEscrow(id); // marks 'cancelled'

  // Close out the open lock act so it doesn't drag the completion ratio down.
  const sql = getSql();
  if (sql) {
    await sql`
      UPDATE acts SET settled_at = ${Date.now()}, fee_nim = 0
      WHERE escrow_id = ${id} AND type = 'borrow_lock' AND settled_at IS NULL
    `;
  }
  await insertAct({
    id: newId("act"),
    actorAddress: address,
    type: "borrow_lock",
    oracle: "system",
    listingId: escrow.listingId,
    escrowId: escrow.id,
    amountNIM: 0,
    feeNIM: 0,
    proofJson: { cancelled: true, refundTx: true },
    createdAt: Date.now(),
    settledAt: Date.now(),
  });

  return NextResponse.json({ ok: true });
}

```

## `app/api/auth/session/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";

export const dynamic = "force-dynamic";

// Lightweight probe so the client can cache auth state and avoid
// re-signing on every action.
export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ address });
}

```

## `app/api/auth/verify/route.ts`
```typescript
import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { getSql, hasDb, ensureUser } from "@/lib/db";
import { checkAndAwardMilestone } from "@/lib/milestones";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
ed.hashes.sha512 = sha512;
import * as Nimiq from "@nimiq/core";

const NONCE_TTL_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { publicKeyHex, signatureHex, nonce } = (await req.json()) as {
      publicKeyHex?: string;
      signatureHex?: string;
      nonce?: string;
    };
    if (!publicKeyHex || !signatureHex || !nonce) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Consume the challenge nonce — single use, 5 min TTL, server-issued only.
    if (hasDb()) {
      const sql = getSql()!;
      const del = await sql`
        DELETE FROM auth_nonces
        WHERE nonce = ${nonce} AND created_at > ${Date.now() - NONCE_TTL_MS}
        RETURNING nonce
      `;
      if (del.length === 0) {
        return NextResponse.json({ error: "Invalid or expired challenge" }, { status: 401 });
      }
    }

    // 2. Verify the Ed25519 signature over the nonce.
    const msg = new TextEncoder().encode(nonce);
    const pub = Uint8Array.from(Buffer.from(publicKeyHex.replace(/^0x/, ""), "hex"));
    const sig = Uint8Array.from(Buffer.from(signatureHex.replace(/^0x/, ""), "hex"));
    if (sig.length !== 64 || pub.length !== 32) {
      return NextResponse.json({ error: "Malformed key material" }, { status: 400 });
    }
    const isValid = await ed.verifyAsync(sig, msg, pub);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Identity = the Nimiq address DERIVED from the key that signed.
    //    Never trust a client-supplied address.
    let address: string;
    try {
      address = new Nimiq.PublicKey(pub).toAddress().toUserFriendlyAddress();
    } catch {
      address = new Nimiq.PublicKey(pub).toAddress().toUserFriendlyAddress();
    }

    // 4. Ensure the user row exists (upsert) so trust scores persist.
    await ensureUser(address);

    await setSession(address);
    checkAndAwardMilestone(address, "FIRST_CONNECTION").catch(() => {});
    return NextResponse.json({ ok: true, address });
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 400 });
  }
}

```

## `app/api/auth/challenge/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { newId } from "@/lib/escrow";

const NONCE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const nonce = newId("n");
  if (hasDb()) {
    const sql = getSql()!;
    await sql`INSERT INTO auth_nonces (nonce, created_at) VALUES (${nonce}, ${Date.now()})`;
    // Opportunistic TTL cleanup
    sql`DELETE FROM auth_nonces WHERE created_at < ${Date.now() - NONCE_TTL_MS}`
      .catch(() => {});
  }
  return NextResponse.json({ nonce });
}

```

## `app/api/dashboard/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { fetchNimUsd } from "@/lib/price";
import { getSessionAddress } from "@/lib/session";
import { ESCROW_VAULT } from "@/lib/escrow";

export const dynamic = "force-dynamic";

// Real on-chain vault balance — the treasury card must reconcile with the
// chain, or it contradicts the product's entire thesis.
async function fetchVaultBalanceLunas(): Promise<number | null> {
  try {
    const res = await fetch(process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "getAccountByAddress",
        params: [ESCROW_VAULT],
        id: 3,
      }),
      next: { revalidate: 30 },
    });
    const data = await res.json();
    const bal = data?.result?.data?.balance;
    if (bal == null) return null;
    return Number(bal); // lunas
  } catch {
    return null;
  }
}

export async function GET() {
  const price = await fetchNimUsd();
  const vaultBalanceNIM = await fetchVaultBalanceLunas().then(
    (l) => (l == null ? null : l / 100_000)
  );

  if (!hasDb()) {
    return NextResponse.json({
      price,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: { tvl_nim: 0, volume_30d: 0, escrows_7d: 0, escrows_30d: 0, treasury_fees: 0, treasury_distributed: 0 },
      leaderboard: [],
      feed: [],
      error: "No DB connection",
    });
  }

  const sql = getSql()!;
  try {
    const address = await getSessionAddress();
    let userStats = null;
    if (address) {
      const userRes = await sql`
        SELECT trust_score, total_volume_nim, items_completed
        FROM users WHERE address = ${address}
      `;
      if (userRes.length > 0) {
        userStats = {
          trustScore: userRes[0].trust_score,
          totalVolumeNIM: userRes[0].total_volume_nim,
          itemsCompleted: userRes[0].items_completed,
        };
      }
    }

    const [
      tvlEscrowRes, tvlListingRes, vol30dRes,
      esc7dRes, esc30dRes, leaderboardRes, feedRes,
      feesRes, distrRes,
    ] = await Promise.all([
      sql`SELECT COALESCE(SUM(amount_nim), 0) as tvl FROM escrows WHERE state IN ('locked','settling')`,
      sql`SELECT COALESCE(SUM(collateral_nim), 0) as tvl FROM listings WHERE state = 'open' AND kind LIKE 'bounty%'`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as vol FROM acts WHERE settled_at IS NOT NULL AND settled_at > ${Date.now() - 2592000000}`,
      sql`SELECT COUNT(*) as count FROM acts WHERE created_at > ${Date.now() - 604800000}`,
      sql`SELECT COUNT(*) as count FROM acts WHERE created_at > ${Date.now() - 2592000000}`,
      sql`SELECT address, trust_score, items_completed FROM users ORDER BY trust_score DESC, items_completed DESC LIMIT 10`,
      sql`SELECT id, actor_address, type, oracle, amount_nim, created_at, tx_hash_out, proof_json FROM acts ORDER BY created_at DESC LIMIT 20`,
      sql`SELECT COALESCE(SUM(fee_nim), 0) as fees FROM acts WHERE settled_at IS NOT NULL`,
      sql`SELECT COALESCE(SUM(amount_nim), 0) as distr FROM acts WHERE type IN ('milestone','referral') AND settled_at IS NOT NULL`,
    ]);

    return NextResponse.json({
      price,
      user: userStats,
      vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM },
      stats: {
        tvl_nim: Number(tvlEscrowRes[0].tvl) + Number(tvlListingRes[0].tvl),
        volume_30d: Number(vol30dRes[0].vol),
        escrows_7d: Number(esc7dRes[0].count),
        escrows_30d: Number(esc30dRes[0].count),
        treasury_fees: Number(feesRes[0].fees),
        treasury_distributed: Number(distrRes[0].distr),
      },
      leaderboard: leaderboardRes.map((r: any) => ({
        address: r.address, trustScore: r.trust_score, itemsCompleted: r.items_completed,
      })),
      feed: feedRes.map((r: any) => ({
        id: r.id, actor: r.actor_address, type: r.type, oracle: r.oracle,
        amountNIM: r.amount_nim, createdAt: Number(r.created_at),
        txHash: r.tx_hash_out, proofJson: r.proof_json,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price, vault: { address: ESCROW_VAULT, balance_nim: vaultBalanceNIM }, error: "Stats query failed" }, { status: 500 });
  }
}

```

## `app/api/escrows/route.ts`
```typescript
import { NextResponse } from "next/server";
import {
  fetchEscrows, fetchListings, fetchEscrow, fetchListing, hasDb,
  insertEscrow, insertListing, initDbSchema, getSql, consumeNonce,
} from "@/lib/db";
import type { Escrow, Listing } from "@/lib/escrow";
import { getSessionAddress } from "@/lib/session";
import { verifyReturn } from "@/lib/qr";
import { newId } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";
import { claimEscrow, finalizeEscrow, unclaimEscrow, settleAct } from "@/lib/settle";

if (hasDb()) {
  initDbSchema().catch(console.error);
}

export async function GET() {
  if (!hasDb()) return NextResponse.json({ listings: [], escrows: [] });
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows });
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });
  const data = await req.json();
  const idemKey: string | undefined = req.headers.get("idempotency-key") ?? data.idempotencyKey;

  // ---- Escrow creation (borrow locks & bounty accepts) ----
  if (data.type === "escrow") {
    const e = data.payload as Escrow;
    const sql = getSql()!;

    // Idempotency: a retried lock returns the already-recorded escrow.
    if (idemKey) {
      const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, existing: true, escrow: (existing[0] as any).payload });
      }
    }

    await insertEscrow(e);
    if (idemKey) {
      await sql`
        INSERT INTO idempotent_actions (key, kind, payload, created_at)
        VALUES (${idemKey}, 'escrow', ${JSON.stringify(e)}, ${Date.now()})
        ON CONFLICT (key) DO NOTHING
      `;
    }

    const { insertAct } = await import("@/lib/db");
    await insertAct({
      id: newId("act"),
      actorAddress: address,
      type: "borrow_lock",
      oracle: "system",
      listingId: e.listingId,
      escrowId: e.id,
      amountNIM: e.amountNIM,
      feeNIM: e.feeNIM,
      txHashIn: e.txHash,
      createdAt: Date.now(),
      idempotencyKey: idemKey,
    });
    checkAndAwardMilestone(address, "FIRST_LOCKED").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  // ---- Listing creation ----
  if (data.type === "listing") {
    const listing = data.payload as Listing;
    const sql = getSql()!;

    if (idemKey) {
      const existing = await sql`SELECT payload FROM idempotent_actions WHERE key = ${idemKey}`;
      if (existing.length > 0) {
        return NextResponse.json({ ok: true, existing: true, listing: (existing[0] as any).payload });
      }
    }

    await insertListing({ ...listing, txHash: data.txHash });
    if (idemKey) {
      await sql`
        INSERT INTO idempotent_actions (key, kind, payload, created_at)
        VALUES (${idemKey}, 'listing', ${JSON.stringify(listing)}, ${Date.now()})
        ON CONFLICT (key) DO NOTHING
      `;
    }

    if (listing.kind.startsWith("bounty") && data.txHash) {
      const { insertAct } = await import("@/lib/db");
      await insertAct({
        id: newId("act"),
        actorAddress: address,
        type: "creator",
        oracle: "system",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: 0,
        txHashIn: data.txHash,
        createdAt: Date.now(),
        idempotencyKey: idemKey,
      });
    }
    checkAndAwardMilestone(address, "FIRST_LISTING").catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad payload" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  const body = (await req.json()) as {
    id?: string;
    token?: string;
    lenderPubkey?: string;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // ---- Bind the release key: LENDER ONLY, ONCE ONLY ----
  if (body.lenderPubkey) {
    const escrow = await fetchEscrow(body.id);
    if (!escrow) return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    const listing = await fetchListing(escrow.listingId);
    if (!listing || listing.owner !== address) {
      return NextResponse.json({ error: "Only the lender may bind the release key" }, { status: 403 });
    }
    if (escrow.state !== "locked") {
      return NextResponse.json({ error: "Escrow is not locked" }, { status: 400 });
    }
    const sql = getSql()!;
    const res = await sql`
      UPDATE escrows SET lender_pubkey = ${body.lenderPubkey}
      WHERE id = ${body.id} AND lender_pubkey IS NULL AND state = 'locked'
      RETURNING id
    `;
    if (res.length === 0) {
      return NextResponse.json({ error: "Release key already bound" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  // ---- Cryptographic release via signed QR token ----
  if (body.token) {
    const escrow = await fetchEscrow(body.id);
    if (!escrow || escrow.state !== "locked") {
      return NextResponse.json({ error: "Invalid escrow state" }, { status: 400 });
    }
    if (!escrow.lenderPubkey) {
      return NextResponse.json({ error: "Lender public key not registered" }, { status: 400 });
    }

    const payload = await verifyReturn(body.token, escrow.lenderPubkey);
    if (!payload) {
      return NextResponse.json({ error: "Invalid QR signature or expired" }, { status: 400 });
    }
    // Bind the token to THIS escrow: id + amount must match what was signed.
    if (payload.escrowId !== body.id) {
      return NextResponse.json({ error: "Token does not match this escrow" }, { status: 400 });
    }
    if (payload.amount !== escrow.amountNIM) {
      return NextResponse.json({ error: "Token amount mismatch" }, { status: 400 });
    }

    const fresh = await consumeNonce(payload.nonce);
    if (!fresh) {
      return NextResponse.json({ error: "QR code already used (replay protection)" }, { status: 400 });
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "borrow_return",
        oracle: "qr_sig",
        listingId: escrow.listingId,
        escrowId: escrow.id,
        amountNIM: escrow.amountNIM,
        feeNIM: escrow.feeNIM,
        proofJson: { nonce: payload.nonce },
        createdAt: escrow.createdAt,
      },
      { to: escrow.borrower, amountNIM: escrow.amountNIM - escrow.feeNIM, feeNIM: escrow.feeNIM },
      () => claimEscrow(body.id!),
      () => finalizeEscrow(body.id!),
      () => unclaimEscrow(body.id!)
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    checkAndAwardMilestone(address, "FIRST_SETTLED").catch(() => {});
    return NextResponse.json({ ok: true, txHashOut: result.txHashOut });
  }

  return NextResponse.json({ error: "Invalid PATCH action" }, { status: 400 });
}

```

## `app/api/passport/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDb()) return NextResponse.json({ error: "No DB connection" }, { status: 500 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ error: "DB Error" }, { status: 500 });

  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Re-calculate or fetch Trust Breakdown logic natively here so we can return the breakdown
    const actStats = await sql`
      SELECT 
        COUNT(*) as total_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN 1 ELSE 0 END) as settled_acts,
        SUM(CASE WHEN settled_at IS NOT NULL THEN amount_nim ELSE 0 END) as total_volume_nim,
        MIN(created_at) as first_act_time,
        COUNT(DISTINCT oracle) as distinct_oracles
      FROM acts 
      WHERE actor_address = ${address}
    `;
    const communityStats = await sql`
      SELECT COUNT(DISTINCT e.id) as community_acts
      FROM escrows e
      JOIN listings l ON e.listing_id = l.id
      WHERE l.owner = ${address} AND e.state = 'released'
    `;

    let breakdown = { completion: 0, volume: 0, tenure: 0, diversity: 0, community: 0, total: 0 };
    if (actStats && actStats.length > 0 && Number(actStats[0].total_acts) > 0) {
      const stats = actStats[0];
      const totalActs = Number(stats.total_acts);
      const settledActs = Number(stats.settled_acts);
      const volumeNim = Number(stats.total_volume_nim);
      const distinctOracles = Number(stats.distinct_oracles);
      const firstActTime = Number(stats.first_act_time);

      const completionRatio = totalActs > 0 ? settledActs / totalActs : 0;
      const completionPoints = completionRatio * 35;
      const volumeLog = Math.log10(volumeNim + 1);
      const volumePoints = Math.min(25, (volumeLog / 5) * 25);
      const daysSinceFirstAct = (Date.now() - firstActTime) / (1000 * 60 * 60 * 24);
      const tenurePoints = Math.min(20, (daysSinceFirstAct / 90) * 20);
      const diversityPoints = Math.min(10, (distinctOracles / 5) * 10);
      const communityActs = Number(communityStats[0]?.community_acts || 0);
      const communityPoints = Math.min(10, (communityActs / 10) * 10);

      breakdown = {
        completion: Math.round(completionPoints),
        volume: Math.round(volumePoints),
        tenure: Math.round(tenurePoints),
        diversity: Math.round(diversityPoints),
        community: Math.round(communityPoints),
        total: Math.max(0, Math.min(100, Math.round(completionPoints + volumePoints + tenurePoints + diversityPoints + communityPoints)))
      };
    }

    // 2. Fetch recent settled acts for stamps (last 6 distinct types/oracles to make stamps)
    const stampsRes = await sql`
      SELECT id, type, oracle, created_at, amount_nim 
      FROM acts 
      WHERE actor_address = ${address} AND settled_at IS NOT NULL
      ORDER BY settled_at DESC LIMIT 6
    `;
    
    // 3. Compute Streak (acts settled per day in last 7 days)
    const streakRes = await sql`
      SELECT COUNT(*) as count, date_trunc('day', to_timestamp(settled_at / 1000)) as day 
      FROM acts 
      WHERE actor_address = ${address} AND settled_at > (extract(epoch from now()) * 1000 - 604800000)
      GROUP BY day ORDER BY day DESC
    `;
    
    // 4. Milestones
    const milestonesRes = await sql`
      SELECT proof_json->>'milestone_id' as m_id, created_at
      FROM acts 
      WHERE actor_address = ${address} AND type = 'milestone'
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      breakdown,
      stamps: stampsRes,
      streak: streakRes,
      milestones: milestonesRes
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch passport data" }, { status: 500 });
  }
}

```

## `app/api/qr/generate/route.ts`
```typescript
import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { getLenderKey, setLenderKey, hasDb } from "@/lib/db";
import { generateLenderKeypair, createReturnPayload, signReturn } from "@/lib/qr";
import * as crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || "0e67de05b40fce79b7099a9542bd273deb2cbeb9e0fa8d4462935b2775ac8147", "hex");

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function decrypt(encryptedText: string) {
  const parts = encryptedText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encrypted = Buffer.from(parts[1], "hex");
  const authTag = Buffer.from(parts[2], "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });
  
  const { escrowId, amount, chain } = await req.json();
  if (!escrowId || !amount || !chain) return NextResponse.json({ error: "escrowId, amount, chain required" }, { status: 400 });

  let key = await getLenderKey(address);
  let privKeyHex = "";
  if (!key) {
    const keypair = await generateLenderKeypair();
    privKeyHex = keypair.privateKeyHex;
    key = {
      ownerAddress: address,
      publicKeyHex: keypair.publicKeyHex,
      privateKeyHexEncrypted: encrypt(privKeyHex)
    };
    await setLenderKey(key);
  } else {
    privKeyHex = decrypt(key.privateKeyHexEncrypted);
  }
  
  const payload = createReturnPayload(escrowId, amount, chain);
  const token = await signReturn(payload, privKeyHex);
  
  return NextResponse.json({ token, publicKeyHex: key.publicKeyHex });
}

```

## `app/app/layout.tsx`
```typescript
// The app interior lives at /app. Move your current app/page.tsx here
// (app/app/page.tsx) — it needs no other changes.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-ink min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-[var(--line)]">
        {children}
      </div>
    </div>
  );
}

```

## `app/app/page.tsx`
```typescript
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import BottomTabs, { type Tab } from "@/components/BottomTabs";
import BorrowWizard from "@/components/BorrowWizard";
import BountyVerify from "@/components/BountyVerify";
import { Leaderboard, ActivityFeed } from "@/components/LivenessLayer";
import { TreasuryCard } from "@/components/TreasuryCard";
import { ensureAuthed } from "@/lib/auth-client";
import { AppHeader, EngravedTabs } from "@/components/AppChrome";
import CreatorApprovals from "@/components/CreatorApprovals";
import PassportDetails from "@/components/PassportDetails";
import { MapRadar } from "@/components/MapRadar";
import { SuccessPayoff } from "@/components/SuccessPayoff";
import CheckInVerify from "@/components/CheckInVerify";
import ManualVerify from "@/components/ManualVerify";
import VentureVerify from "@/components/VentureVerify";
import QrOverlay from "@/components/QrOverlay";
import QrScanner from "@/components/QrScanner";
import CreateListing from "@/components/CreateListing";
import Onboarding from "@/components/Onboarding";
import TrustRing from "@/components/TrustRing";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkeletonCard, SkeletonEscrow } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";
import HubApi from "@nimiq/hub-api";
import {
  RadarIcon,
  LockIcon,
  UnlockIcon,
  ScanIcon,
  PlusIcon,
  SearchIcon,
  WifiIcon,
  ClockIcon,
  CheckIcon,
  MapPinIcon,
  ZapIcon,
  StarIcon,
} from "@/components/icons";
import { useNimiq } from "@/lib/nimiq";
import {
  ESCROW_VAULT,
  MIN_NETWORK_FEE_NIM,
  MICRO_FEE_NIM,
  discountedCollateral,
  newId,
  type Escrow,
  type Listing,
} from "@/lib/escrow";
import {
  generateLenderKeypair,
  createReturnPayload,
  signReturn,
  verifyReturn,
  type ReturnPayload,
} from "@/lib/qr";

function categoryBadge(listing: Listing) {
  const labels: Record<string, string> = {
    tools: "Tools", transport: "Transport", electronics: "Electronics", sports: "Sports",
    household: "Household", photo: "Photo", delivery: "Delivery", survey: "Survey",
    cleanup: "Cleanup", other: "Other",
  };
  return labels[listing.category ?? "other"] ?? "Other";
}

function timeRemaining(expiresAt: number | undefined) {
  if (!expiresAt) return "Indefinite";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const hrs = Math.floor(ms / (1000 * 60 * 60));
  if (hrs > 48) return `${Math.floor(hrs / 24)} days left`;
  if (hrs > 0) return `${hrs} hours left`;
  const mins = Math.floor(ms / (1000 * 60));
  return `${mins} mins left`;
}

export default function Home() {
  const { status, accounts, sendLock, signMessage } = useNimiq();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("radar");
  const [showMap, setShowMap] = useState(false);
  const [payoffAmount, setPayoffAmount] = useState<number | null>(null);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [dashboard, setDashboard] = useState<{price: number, stats: any, vault?: any, user?: any, feed?: any[], leaderboard?: any[]} | null>(null);

  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<Listing | null>(null);
  const [locking, setLocking] = useState(false);
  const [qrToken, setQrToken] = useState<{ token: string; escrow: Escrow } | null>(null);
  const [lenderKeys, setLenderKeys] = useState<Record<string, { pub: string; priv: string }>>({});
  const [showScanner, setShowScanner] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const borrower = accounts[0] ?? "Anonymous";
  const isConnected = status === "connected" || isDemoMode;

  // Real Trust Score (0-100) from the server
  const trustScore = dashboard?.user?.trustScore || 0;

  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined" && !localStorage.getItem("acta.onboarded")) {
        setShowOnboarding(true);
      }
    } catch {}
  }, []);

  // Fetch true Database State
  useEffect(() => {
    let cancelled = false;
    
    fetch("/api/dashboard").then(r => r.json()).then(d => {
      if(!cancelled && d.price) setDashboard(d);
    }).catch(() => {});

    fetch("/api/escrows")
      .then((r) => r.json())
      .then((d: { listings?: Listing[]; escrows?: Escrow[]; shared?: boolean }) => {
        if (cancelled || !d) return;
        if (Array.isArray(d.listings)) setListings(d.listings);
        if (Array.isArray(d.escrows)) setEscrows(d.escrows);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => { cancelled = true; };
  }, []);

  const activeCount = escrows.filter((e) => e.state === "locked").length;

  async function handleLock(listing: Listing, amountNIM: number) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to lock funds", "error");
      return null;
    }

    setLocking(true);
    try {
      let txHash = "0x" + Date.now().toString(16);
      
      if (!listing.kind.startsWith("bounty")) {
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(amountNIM * 100_000),
          fee: 10,
        });
      }

      const e: Escrow = {
        id: newId("esc"),
        listingId: listing.id,
        title: listing.title,
        borrower,
        amountNIM,
        feeNIM: MICRO_FEE_NIM,
        yieldNIM: listing.yieldNIM || 0,
        state: "locked",
        txHash,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * (listing.durationDays || 1),
        description: listing.description,
      };
      
      const res = await fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "escrow", payload: e }),
      });

      if (!res.ok) {
        throw new Error("Server failed to record the lock transaction. Your funds may be locked on chain but unrecorded.");
      }

      setEscrows((p) => [e, ...p]);
      setTab("active");
      toast(`Locked ${amountNIM.toLocaleString()} NIM for ${listing.title}`, "success"); 
      return e;
    } catch (err) {
      toast(err instanceof Error ? err.message : "Lock failed", "error");
      return null;
    } finally {
      setLocking(false);
    }
  }

  const ensureAuth = useCallback(async (): Promise<boolean> => {
    if (!accounts[0]) return false;
    try {
      // Fast check if already authed (mocking the check by just trying the challenge)
      // Actually, we can just do the auth if any secure request fails, or preemptively
      const res = await fetch("/api/auth/challenge");
      const { nonce } = await res.json();
      const sigRes = await signMessage(nonce);
      
      const toHex = (buf: any) => buf instanceof Uint8Array 
        ? Array.from(buf).map(b => b.toString(16).padStart(2,'0')).join('') 
        : buf;

      const authRes = await fetch("/api/auth/verify", {
         method: "POST", body: JSON.stringify({
            address: accounts[0],
            publicKeyHex: toHex(sigRes.publicKey),
            signatureHex: toHex(sigRes.signature),
            nonce
         })
      });
      return authRes.ok;
    } catch {
      return false;
    }
  }, [accounts, signMessage]);

  async function handleMakeLenderQr(escrow: Escrow) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to generate secure QR", "error");
      return;
    }

    try {
      const res = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escrowId: escrow.id, amount: escrow.amountNIM, chain: "nimiq-testnet" })
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      const { token, publicKeyHex } = await res.json();
      
      setEscrows((p) => p.map((e) => (e.id === escrow.id ? { ...e, lenderPubkey: publicKeyHex } : e)));
      // Also update escrow with the lender's public key
      await fetch("/api/escrows", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: escrow.id, lenderPubkey: publicKeyHex }),
      });
      
      setQrToken({ token, escrow });
    } catch (e) {
      toast("QR generation failed", "error");
    }
  }

  const handleScan = useCallback(
    async (token: string) => {
      const t = token.trim();
      if (!t) return;
      
      const isAuthed = await ensureAuth();
      if (!isAuthed) {
        toast("Authentication required to process QR scan", "error");
        setShowScanner(false);
        return;
      }

      // 1. Handle CreatorVerified manual request (completer shows QR to creator)
      if (t.startsWith("manual_req:")) {
        setShowScanner(false);
        const [_, listingId, completerAddress] = t.split(":");
        if (!listingId || !completerAddress) return toast("Invalid manual request QR", "error");

        const res = await fetch("/api/bounty/manual_approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, completerAddress }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          return toast(data.error || "Approval failed", "error");
        }
        
        toast(`Approved completion for ${completerAddress.substring(0,8)}...`, "success");
        window.location.reload();
        return;
      }

      // 2. Try Escrows (Borrow Item Returns)
      let matched = false;
      for (const e of escrows) {
        if (e.state !== "locked" || !e.lenderPubkey) continue;
        const payload = await verifyReturn(t, e.lenderPubkey).catch(() => null);
        if (payload && payload.escrowId === e.id) {
          matched = true;
          setShowScanner(false);
          const res = await fetch("/api/escrows", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: e.id, token: t }),
          });
          
          if (!res.ok) {
            const data = await res.json();
            toast(data.error || "Failed to release", "error");
            return;
          }
          
          setEscrows((p) => p.map((x) => (x.id === e.id ? { ...x, state: "released" } : x)));
          toast(`Released ${(e.amountNIM - e.feeNIM).toLocaleString()} NIM (${e.title})`, "success"); setPayoffAmount(-1);
          return;
        }
      }

      // 3. Try ScanQuest (Creator placed QR, Completer scans it)
      if (!matched && t.split('.').length === 2) {
        setShowScanner(false);
        const res = await fetch("/api/bounty/scanquest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        
        if (!res.ok) {
          const data = await res.json();
          toast(data.error || "ScanQuest verification failed", "error");
          return;
        }
        
        toast("Quest completed! Reward claimed.", "success"); setPayoffAmount(-1);
        window.location.reload();
        return;
      }

      toast("Invalid QR or no matching locked escrow", "error");
      setShowScanner(false);
    },
    [escrows, ensureAuth]
  );

  async function handleCancel(type: "listing" | "escrow", id: string) {
    if (!confirm("Are you sure you want to cancel this? Funds will be refunded.")) return;
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id })
      });
      if (res.ok) {
        toast("Cancelled successfully", "success");
        if (type === "listing") setListings(p => p.filter(l => l.id !== id));
        if (type === "escrow") setEscrows(p => p.map(e => e.id === id ? { ...e, state: "cancelled" } : e));
      } else {
        const err = await res.json();
        toast(err.error || "Failed to cancel", "error");
      }
    } catch (e) {
      toast("Error cancelling", "error");
    }
  }

  async function handleCreateListing(data: any) {
    const isAuthed = await ensureAuth();
    if (!isAuthed) {
      toast("Authentication required to create a listing", "error");
      return;
    }

    let txHash: string | undefined;
    if (data.kind.startsWith("bounty")) {
      try {
        txHash = await sendLock({
          recipient: ESCROW_VAULT,
          value: Math.round(data.collateralNIM * 100_000),
          fee: Math.max(10, MIN_NETWORK_FEE_NIM * 100_000), // network minimum fee
        });
      } catch (err) {
        toast("Failed to fund bounty: " + (err instanceof Error ? err.message : "unknown"), "error");
        return;
      }
    }

    const listing: Listing = {
      id: newId("list"),
      title: data.title,
      owner: borrower,
      collateralNIM: data.collateralNIM,
      yieldNIM: data.yieldNIM || 0,
      durationDays: data.durationDays || 1,
      kind: data.kind,
      category: data.category || "other",
      description: data.description,
      createdAt: Date.now(),
      isActive: true
    };

    try {
      const res = await fetch("/api/escrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", payload: listing, txHash }),
      });
      if (!res.ok) throw new Error("Failed to save listing");
      
      setListings((p) => [listing, ...p]);
      setShowCreateListing(false);
      toast("Listing deployed to network.", "success");
    } catch (e) {
      console.error(e);
      toast("Failed to deploy listing", "error");
    }
  }

  if (status === "loading") {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-pulse">
         <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
         </div>
         <h2 className="text-xl font-bold mb-2 text-white">Initializing Protocol</h2>
         <p className="text-slate-400 text-sm">Connecting to Nimiq Pay Engine...</p>
      </div>
    );
  }

  if (status === "error" && !isConnected) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
          <LockIcon size={28} className="text-slate-950" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Connection Failed</h2>
        <div className="text-slate-400 text-sm mb-6 leading-relaxed max-w-[300px] flex flex-col gap-3">
          <p>Acta is a native Mini App designed for Nimiq Pay. We couldn't establish a secure connection.</p>
          <p className="text-amber-400/90 font-medium">Please ensure you are opening this app from within a supported Nimiq wallet environment.</p>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          className="bg-amber-400 text-slate-950 font-bold py-3 px-8 rounded-full mb-3 w-full max-w-[260px] btn-press shadow-[0_0_15px_rgba(251,191,36,0.4)]"
        >
          Retry Connection
        </button>

        <a 
          href="https://nimiq.com/wallet/" 
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-800 text-white font-semibold py-3 px-8 rounded-full mb-6 w-full max-w-[260px] border border-slate-700 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 btn-press"
        >
          Get Nimiq Wallet
        </a>
        
        <button 
          onClick={() => setIsDemoMode(true)}
          className="mt-2 text-slate-500 text-xs underline decoration-slate-700 hover:text-slate-300 transition-colors"
        >
          Continue in Read-Only Demo Mode
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed top-0 left-0 right-0 bottom-0 h-[100dvh] bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-amber-500/30 overflow-hidden">
        <header className="px-4 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1.5 flex justify-between items-center bg-slate-950/90 z-10 backdrop-blur-md shrink-0 border-b border-white/5">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent">Acta</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
              ACTION ECONOMY {isDemoMode && <span className="bg-rose-500 text-white ml-2 px-1 rounded">READ-ONLY DEMO</span>}
            </p>
          </div>
          <button
            onClick={() => setShowCreateListing(true)} disabled={isDemoMode}
            className="flex h-10 items-center gap-2 rounded-full bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 btn-press border border-white/10"
          >
            <PlusIcon size={16} /> New
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 no-scrollbar">
          
          {tab === "radar" && (
            <div className="pb-10 animate-fade-in">
              {dashboard && <TreasuryCard fees={dashboard.stats.treasury_fees} distributed={dashboard.stats.treasury_distributed} price={dashboard.price} balance={dashboard.vault?.balance_nim ?? null} vaultAddress={dashboard.vault?.address} tvl={dashboard.stats.tvl_nim} volume={dashboard.stats.volume_30d} />}
              

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ZapIcon size={14} className="text-amber-400" /> Earn NIM (Bounties)
                </h3>
                <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 text-xs transition-colors ${showMap ? "bg-sky-500/20 text-sky-400" : "bg-slate-900 text-slate-400 hover:text-white"}`}>
                  <MapPinIcon size={12} /> {showMap ? "List View" : "Map View"}
                </button>
              </div>
              
              
              <button onClick={() => setShowCreateListing(true)} className="w-full mb-4 py-2.5 px-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400/80 hover:text-amber-400 flex items-center justify-center gap-2 transition-all group btn-press">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-transform">
                   <PlusIcon size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Deploy Protocol Bounty</span>
              </button>

              {showMap && <div className="pb-6 mb-2"><MapRadar listings={listings.filter(l => l.kind.startsWith("bounty"))} /></div>}
              {!showMap && (
              <div className="flex gap-4 overflow-x-auto pb-6 mb-2 no-scrollbar snap-x">
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
                ) : listings.filter(l => l.kind.startsWith("bounty")).length === 0 ? (
                  <EmptyState title="No Bounties" subtitle="No bounties available. Create one!" icon={<ZapIcon size={32} />} />
                ) : (
                  listings.filter(l => l.kind.startsWith("bounty")).map(l => (
                    <div key={l.id} className="min-w-[280px] snap-center card-bounty p-4 rounded-2xl flex flex-col justify-between border border-amber-500/20 group relative overflow-hidden transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">{categoryBadge(l)}</span>
                          <div className="text-right">
                            <p className="text-lg font-bold tnum text-amber-400">{l.collateralNIM.toLocaleString()} NIM</p>
                            {dashboard && <p className="text-[10px] text-amber-400/70">~${(l.collateralNIM * dashboard.price).toFixed(2)} USD</p>}
                          </div>
                        </div>
                        <h4 className="font-semibold text-lg leading-tight mb-2 text-white">{l.title}</h4>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{l.description}</p>
                      </div>
                      {/* Hover Info */}
                      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md p-5 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 z-10 flex flex-col justify-between overflow-y-auto">
                        <div>
                           <h5 className="text-[10px] uppercase text-amber-400 mb-1.5 tracking-widest font-bold">Mission Details</h5>
                           <p className="text-xs text-slate-300 leading-relaxed mb-4">{l.description}</p>
                           <h5 className="text-[10px] uppercase text-amber-400 mb-1.5 tracking-widest font-bold">Protocol Rules</h5>
                           <p className="text-[10px] text-slate-400 leading-relaxed">Funds are locked in escrow upon acceptance. Payout is autonomously triggered by peer consensus or cryptographic proof. Slashed reputation for non-delivery.</p>
                        </div>
                      {l.owner === borrower && l.kind === "bounty_qr" ? (
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/qr/generate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ type: "scan_quest", escrowId: l.id, amount: l.collateralNIM, chain: "nimiq-testnet" }),
                            });
                            const data = await res.json();
                            if (res.ok) setQrToken({ token: data.token, escrow: { title: l.title, amountNIM: l.collateralNIM } as any });
                            else toast(data.error, "error");
                          }}
                          className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"
                        >
                          Show Quest QR
                        </button>
                      ) : l.owner === borrower ? (
                        <button disabled className="w-full py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs cursor-not-allowed">
                          Your Bounty
                        </button>
                      ) : (
                        <button
                          onClick={() => setWizard(l)}
                          disabled={isDemoMode}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press disabled:opacity-50"
                        >
                          Accept Bounty
                        </button>
                      )}
                      </div>

                      {l.owner === borrower && l.kind === "bounty_qr" ? (
                        <button
                          onClick={async () => {
                            const res = await fetch("/api/qr/generate", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ type: "scan_quest", escrowId: l.id, amount: l.collateralNIM, chain: "nimiq-testnet" }),
                            });
                            const data = await res.json();
                            if (res.ok) setQrToken({ token: data.token, escrow: { title: l.title, amountNIM: l.collateralNIM } as any });
                            else toast(data.error, "error");
                          }}
                          className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press"
                        >
                          Show Quest QR
                        </button>
                      ) : l.owner === borrower ? (
                        <button disabled className="w-full py-2 bg-slate-800 text-slate-500 font-bold rounded-lg text-xs cursor-not-allowed">
                          Your Bounty
                        </button>
                      ) : (
                        <button
                          onClick={() => setWizard(l)}
                          disabled={isDemoMode}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all btn-press disabled:opacity-50"
                        >
                          Accept Bounty
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              )}

              <div className="flex items-center justify-between mb-4 mt-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPinIcon size={14} className="text-blue-400" /> Available Nearby (Borrow)
                </h3>
              </div>
              
              
              <button onClick={() => setShowCreateListing(true)} className="w-full mb-4 py-2.5 px-4 rounded-xl border border-dashed border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-400/80 hover:text-blue-400 flex items-center justify-center gap-2 transition-all group btn-press">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-transform">
                   <PlusIcon size={12} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">List Asset for Borrowing</span>
              </button>

              <div className="space-y-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : listings.filter(l => l.kind === "borrow").length === 0 ? (
                  <EmptyState title="No Items" subtitle="No items available to borrow." icon={<MapPinIcon size={32} />} />
                ) : (
                  listings.filter(l => l.kind === "borrow").map((l) => (
                    <div key={l.id} className="card-borrow p-3 rounded-xl border border-blue-500/20 group relative overflow-hidden transition-all duration-300">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-semibold text-sm leading-tight text-white truncate">{l.title}</h4>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{l.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tnum text-blue-400 flex items-center justify-end gap-1">
                            <LockIcon size={12} />
                            {l.collateralNIM.toLocaleString()} NIM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg mb-3 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{(l.owner || 'A').charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Lender</p>
                            <p className="text-[10px] font-semibold text-white">{l.owner.slice(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] text-slate-400 uppercase">Yield</p>
                           <p className="text-[10px] font-bold text-emerald-400 tnum">+{l.yieldNIM || 0.5} NIM</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWizard(l)}
                        disabled={isDemoMode}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all btn-press shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                      >
                        Review Contract
                      </button>
                    </div>
                  ))
                )}
              
              </div>

              {dashboard?.feed && <ActivityFeed data={dashboard.feed} />}
              {dashboard?.leaderboard && <Leaderboard data={dashboard.leaderboard} />}
            </div>
          )}

          {tab === "active" && (

            <div className="space-y-4 animate-fade-in">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <SkeletonEscrow key={i} />)
              ) : escrows.length === 0 ? (
                <EmptyState title="No Contracts" subtitle="No active contracts. Start a task or borrow an item!" icon={<CheckIcon size={32} />} />
              ) : (
                escrows.map((e) => (
                  <div key={e.id} className="card p-3 rounded-xl mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{e.title}</h4>
                        <p className="tnum mt-0.5 text-lg font-extrabold text-white">
                          {e.amountNIM.toLocaleString()} <span className="text-xs text-slate-400">NIM</span>
                        </p>
                      </div>
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase ${
                          e.state === "locked" ? "bg-amber-300/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"
                        }`}>
                        {e.state}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                      <span className="tnum">Tx: {e.txHash.slice(0, 16)}...</span>
                      <span>Fee: {e.feeNIM} NIM</span>
                    </div>

                    {e.state === "locked" && (
                      <>
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                          <ClockIcon size={12} />
                          <span>{timeRemaining(e.expiresAt)}</span>
                        </div>
                        {e.borrower === accounts[0] && (
                          <button onClick={() => handleCancel("escrow", e.id)} disabled={isDemoMode} className="mt-2 w-full disabled:opacity-50 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md text-[10px] uppercase font-bold hover:bg-rose-500/20">Cancel & Refund</button>
                        )}
                        
                        {(() => {
                          const kind = listings.find(l => l.id === e.listingId)?.kind;
                          const handleSuccess = () => {
                            setEscrows(p => p.map(x => x.id === e.id ? { ...x, state: "released" } : x));
                            setPayoffAmount(e.amountNIM - e.feeNIM);
                          };
                          if (kind === "bounty") {
                            return <BountyVerify task={e.title} listingId={e.listingId} onSuccess={handleSuccess} />;
                          } else if (kind === "bounty_venture") {
                            return <VentureVerify listingId={e.listingId} />;
                          } else if (kind === "bounty_manual") {
                            return <ManualVerify listingId={e.listingId} />;
                          } else if (kind === "bounty_geo") {
                            return <CheckInVerify listingId={e.listingId} onSuccess={handleSuccess} />;
                          } else if (kind === "bounty_qr") {
                            return (
                              <button
                                onClick={() => setShowScanner(true)}
                                disabled={isDemoMode}
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-400/25 btn-press disabled:opacity-50"
                              >
                                <ScanIcon size={14} /> Scan ScanQuest QR
                              </button>
                            );
                          }
                          return (
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => handleMakeLenderQr(e)}
                                disabled={isDemoMode}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20 btn-press disabled:opacity-50"
                              >
                                <StarIcon size={14} /> Show return QR
                              </button>
                              <button
                                onClick={() => setShowScanner(true)}
                                disabled={isDemoMode}
                                className="flex items-center gap-2 rounded-xl bg-sky-400/15 px-5 py-3 text-sm font-semibold text-sky-300 transition-all hover:bg-sky-400/25 btn-press disabled:opacity-50"
                              >
                                <ScanIcon size={14} /> Scan
                              </button>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "passport" && (
            <div className="space-y-4 animate-fade-in">
              <div className="card rounded-3xl p-4 text-center border border-white/5">
                <div className="flex justify-center">
                  <TrustRing score={trustScore} size={160} />
                </div>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Every contract successfully returned builds your on-chain reputation. Higher trust tiers unlock massive collateral discounts.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-white">{escrows.length}</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Contracts</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-emerald-400">
                      {escrows.filter((e) => e.state === "released").length}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Settled</p>
                  </div>
                  <div className="rounded-2xl bg-black/40 p-4 border border-white/5">
                    <p className="tnum text-xl font-black text-amber-400">{activeCount}</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">Active</p>
                  </div>
                </div>
              </div>

              <div className="card rounded-2xl p-4 space-y-4 border border-white/5">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <WifiIcon size={14} className={isConnected ? "text-emerald-400" : "text-slate-500"} />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Connection State</p>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Address</span>
                    <span className="tnum text-xs font-mono bg-black px-2 py-1 rounded-md">{borrower.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider">Mode</span>
                    {isConnected ? (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">Connected</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">Waiting...</span>
                    )}
                  </div>
                </div>
              </div>

              <PassportDetails />

              {escrows.length > 0 && (
                <div className="card rounded-2xl p-4 border border-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-white/5">
                    Global Ledger History
                  </p>
                  <div className="space-y-3">
                    {escrows.slice(0, 10).map((e) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${e.state === 'locked' ? 'bg-amber-400/10 text-amber-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
                            {e.state === "locked" ? <LockIcon size={14} /> : <CheckIcon size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{e.title}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {new Date(e.createdAt).toLocaleDateString()} · {e.txHash.slice(0,8)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="tnum text-sm font-bold text-white">
                            {e.amountNIM.toLocaleString()} NIM
                          </p>
                          {dashboard && <p className="text-[9px] text-slate-500">~${(e.amountNIM * dashboard.price).toFixed(2)} USD</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <EngravedTabs tab={tab} setTab={setTab} activeCount={activeCount} />

        {wizard && (
          <BorrowWizard price={dashboard?.price} 
            listing={wizard}
            trustScore={trustScore}
            borrower={borrower}
            locking={locking}
            onLock={handleLock}
            onClose={() => setWizard(null)}
          />
        )}
        {qrToken && (
          <QrOverlay token={qrToken.token} escrow={qrToken.escrow} onClose={() => setQrToken(null)} />
        )}
        {showScanner && (
          <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
        )}
        {showCreateListing && (
          <CreateListing onSubmit={handleCreateListing} onClose={() => setShowCreateListing(false)} />
        )}
        {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
        {payoffAmount !== null && <SuccessPayoff amount={payoffAmount} onClose={() => setPayoffAmount(null)} />}
      </div>
    </ErrorBoundary>
  );
}

```

