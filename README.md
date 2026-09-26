# KubeAtlas plugin for Backstage

> **Source-only delivery (1.0.1).** The packaging fix is available in Git,
> but 1.0.1 has not been published to npm. Use the pinned-source instructions
> below; the existing npm 1.0.0 package does not contain this fix.

See [CHANGELOG.md](./CHANGELOG.md) for the changes and
[COMPAT_MATRIX.md](./COMPAT_MATRIX.md) for the validation limits. Source
delivery and local package checks are not a new host/server compatibility claim.

A Backstage **frontend plugin** that embeds [KubeAtlas](https://github.com/lithastra/kubeatlas)
dependency-graph views directly into your catalog Entity pages. It
answers *"what does this service depend on, and what breaks if it
goes away?"* without leaving Backstage.

## What you get

- **Dependency graph card** — the one-hop dependency neighbourhood of an
  Entity's backing Kubernetes resource, rendered with Cytoscape.
- **Blast radius card** — how many resources transitively depend on this
  one, graded green / amber / red, with an expandable top-10 list.
- **Admission policies card** — the Gatekeeper/Kyverno admission policies that enforce this Entity's resource, read from its `ENFORCES` edges (F-205). Degrades gracefully on servers that don't report them.
- **Runtime calls (OTel) card** — the resource's top observed runtime-call peers from the OpenTelemetry overlay (`GET /api/v1/otel/overlay`), shown when the server is Tier 2 with `otel.enabled` (F-204). Shows a clear note when the overlay is unavailable.
- **KubeAtlas Entity tab** — all four cards on a dedicated tab.

It talks directly to a KubeAtlas server's v1 API. It does **not** depend
on `@backstage/plugin-kubernetes` or any Backstage backend plugin.

## Prerequisites

- A running [KubeAtlas server](https://docs.kubeatlas.lithastra.com)
  (>= v1.4) reachable from the browser. The **Admission policies** card
  needs >= v1.4; the **Runtime calls (OTel)** card needs >= v1.5 with
  `otel.enabled`.
- Backstage >= 1.30 (see the compatibility matrix).

## Install

### Build from the pinned source

Registry installation is not the delivery path for the current 1.0.1 fix.
Do not expect `yarn add @lithastra/plugin-kubeatlas` to retrieve it: npm
currently provides 1.0.0, whose tarball has the entrypoint problem described
in the changelog. A Git dependency is not a substitute for building and
packing the plugin.

Use a new checkout of the reviewed source commit, with Node.js 24 and npm 11:

```bash
git clone https://github.com/lithastra/kubeatlas-backstage-plugin.git
cd kubeatlas-backstage-plugin
git checkout --detach 5776db282de5222d8e723f135e233e72724a1028
nvm install && nvm use # or use another manager providing Node.js 24 / npm 11
npm ci
npm run test:package
npm pack --pack-destination ..
```

This creates `lithastra-plugin-kubeatlas-1.0.1.tgz` beside the checkout,
without publishing anything. Keep lifecycle scripts enabled: `prepack`
builds the JavaScript and declarations and prepares the distributed
entrypoints; `postpack` restores the source manifest.

Copy that archive to a `vendor/` directory in your Backstage app. From the
app's root directory, install the local artifact:

```bash
yarn --cwd packages/app add file:../../vendor/lithastra-plugin-kubeatlas-1.0.1.tgz
```

Keep the archive available to the app's dependency installer, and run the
app's own build and host integration tests before using it. Repository
package checks verify entrypoints and imports, not a complete Backstage
host or live KubeAtlas server pairing. npm publication remains a separate
maintainer decision; do not push a version tag to distribute this source
snapshot because the tag workflow publishes to npm.

## Configure

Point the plugin at your KubeAtlas server in `app-config.yaml`:

```yaml
kubeatlas:
  baseUrl: https://kubeatlas.example.com
```

Wire the Entity tab into `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityKubeAtlasContent } from '@lithastra/plugin-kubeatlas';

// inside the service/component EntityLayout:
<EntityLayout.Route path="/kubeatlas" title="KubeAtlas">
  <EntityKubeAtlasContent />
</EntityLayout.Route>
```

Prefer individual cards? `EntityDependencyGraphCard` and
`EntityBlastRadiusCard` are exported too.

### Mapping an Entity to a Kubernetes resource

By default the plugin looks up a `Deployment` named after the Entity in
the `default` namespace. Override per Entity with annotations:

```yaml
metadata:
  annotations:
    kubeatlas.io/kind: StatefulSet
    kubeatlas.io/name: orders-db
    kubeatlas.io/namespace: shop
```

The Backstage `backstage.io/kubernetes-namespace` annotation is honoured
as a namespace fallback.

## Compatibility

See [COMPAT_MATRIX.md](./COMPAT_MATRIX.md) for tested version
combinations.

## Development

The plugin ships a standalone dev app that mounts the Entity tab against
a mock KubeAtlas API, so you can see the cards render without a cluster:

Use Node.js 24 and npm 11 for this repository's development tooling. CI and
release builds read the same Node major from `.nvmrc`. This is a maintainer
toolchain requirement, not a change to the plugin's React or Router peer ranges.

```bash
nvm install && nvm use # or install Node.js 24 with your preferred version manager
npm ci             # honours .npmrc (legacy-peer-deps, required by MUI v4)
npm start          # opens the dev app; visit /kubeatlas
```

Gates:

```bash
npm run audit:production # fails on high/critical production dependency findings
npm run audit:all        # also checks development tooling
npm run lint
npm run tsc
npm test           # Jest unit tests with coverage
npm run build
npm run test:package # packs locally and verifies the distributed entrypoints
```

End-to-end (Playwright drives the dev app):

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

The unit suite and the e2e both run in CI on every pull request
(`.github/workflows/ci.yml` and `e2e.yml`).

## License

Apache-2.0. See [LICENSE](./LICENSE).
