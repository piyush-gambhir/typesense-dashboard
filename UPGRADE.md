# Node 26 upgrade verification

Reviewed on 25 October 2026 against `d75f9b2` on the default `release` branch.

## Compatibility

Development and Docker use Node 26.12.1 and pnpm 12.15.0. Vercel currently
supports Node 24, so its manual deployment workflow stays on 24.22.1. CI checks
both versions. No deployment workflow was enabled or invoked.
[Supported Vercel runtimes](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

TypeScript 7.0.2 performs the main typecheck. Next.js, ESLint, and import tooling
retain the TypeScript 6.0.3 compiler API. Both checks invoke explicit compiler
paths because both packages expose a `tsc` executable. ESLint stays on 9.39.5
for the Next.js plugin's peer requirements. These are the two direct-dependency
holdbacks reported by `pnpm outdated`.

Compatible dependencies are updated, including Typesense 3.2.0. Existing Next.js
security configuration and bounded DOMPurify overrides are preserved. The
recent react-resizable-panels 4.15.0 release is explicitly allowed by the
package-age policy.

## Behavior fixes

The real Typesense 30.2 browser test exposed a rejected schema-update request.
The client now sends new fields without creation-only collection options,
rejects attempts to change those options, and retrieves the full collection
after the SDK's partial update response. An unnecessary collection-list request
was removed. Four focused regression cases cover the update request contract,
unchanged schemas, and rejected creation-only option changes.

Collection creation dates use an explicit locale and UTC so server and browser
render the same text. Browser verification adds a field, checks the stored schema
and document count, and reloads the page without hydration errors.

Docker installs pnpm explicitly because Node 26 has no bundled Corepack. Both
Dockerfiles install from the frozen lockfile. The build context excludes `.env*`
credentials while retaining the example files.

## Verification and measurements

- Frozen installation and peer checks pass. Full and production dependency
  audits report zero known advisories, not a complete application security audit.
- 130 tests pass on Node 24.22.1. TypeScript 7 and TypeScript 6 checks and
  production builds pass on Node 24.22.1 and Node 26.12.1.
- Lint reports zero errors. The initial full run reported 39 existing warnings;
  lint failures now fail CI instead of being ignored.
- The Node 26 production Docker image builds and serves setup, metrics, and
  collection pages against a disposable local Typesense server. The same schema
  update and reload workflow passes against the rebuilt container. The image
  contains no credential environment files.
- The real browser schema-update flow preserves collection identity, one indexed
  document, and the default sorting field after adding a field and reloading.
- A local compiler comparison on identical sources and dependencies measured
  2,581 ms for TypeScript 6 and 428 ms for TypeScript 7, about 6.0x faster. Each
  compiler had one warm-up and five alternating samples with emit and incremental
  checking disabled. This is not a full-build or application-runtime speedup.
  [Raw samples](benchmarks/typecheck-2026-10-25.json).

## Reproduce

```bash
pnpm install --frozen-lockfile
pnpm peers check
pnpm lint
pnpm typecheck
pnpm typecheck:compat
pnpm test
pnpm build
pnpm audit
pnpm audit --prod
node scripts/benchmark-typecheck.mjs
docker build -f Dockerfile.production -t typesense-dashboard:review .
```

Run the same compiler checks, tests, and build under Node 24.22.1 before deploying
to Vercel. The manual production workflow remains a separate action.
