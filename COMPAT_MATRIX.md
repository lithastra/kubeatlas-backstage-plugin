# Compatibility matrix

## Historical compatibility records

The ranges below were documented for earlier plugin releases. They have not
been revalidated by the 1.0.1 packaging checks and must not be read as a new
host/server compatibility claim for that candidate.

| Plugin version | KubeAtlas server | Backstage |
|---|---|---|
| 1.0.0 | v1.4 – v1.5 (v1 API) | 1.30 – 1.34 |
| 0.1.x | v1.4.x (v1 API) | 1.30 – 1.34 |

Notes:

- The plugin only calls the KubeAtlas **v1** API (`/api/v1/resources/*`,
  `/api/v1/blast-radius/*`, `/api/v1/otel/overlay`), so it is unaffected
  by the v1alpha1 deprecation cycle.
- **1.0.x** reaches Headlamp-plugin feature parity: it adds the
  **Admission policies** card (F-205, reads the resource's ENFORCES
  edges — needs KubeAtlas **>= v1.4**) and the **Runtime calls (OTel)**
  card (F-204, top runtime peers — needs KubeAtlas **>= v1.5** with
  `otel.enabled`). Both degrade gracefully on a server that predates or
  has not enabled the feature.
- New Backstage host or KubeAtlas server combinations require explicit
  validation; these historical ranges are not a moving support guarantee.

## 1.0.1 candidate validation scope

The patch retains the declared React 17/18 and Router 6 peer ranges. Local
package-consumption checks use React 18 and Router 6; React 17 has not been
retested as part of this patch. Unit tests and the standalone development-app
E2E suite use mock API responses. Artifact checks cover the actual npm tarball,
its JavaScript and type entrypoints, and its package-local lazy imports.

These checks do not establish a newly verified full Backstage host / live
KubeAtlas server pairing, including KubeAtlas 1.6. Version 1.0.1 is currently
delivered as source only; npm publication is deferred. Follow the
[pinned-source installation instructions](./README.md#install)
to build a local artifact. A locally packed 1.0.1 archive is not an official
npm release or an expansion of the historical compatibility matrix.

## Maintainer toolchain (1.0.1 candidate)

Repository development, CI, and release builds use Node.js 24, npm 11,
Backstage CLI 0.36.x, and Jest 30 with jsdom 27. TypeScript remains on 5.4,
and the React 17/18 and Router 6 public peer ranges are unchanged.

This tooling update does not add a newly verified Backstage host or KubeAtlas
server combination to the table above. The development app and Playwright
suite use mock API responses, not a live KubeAtlas server.
