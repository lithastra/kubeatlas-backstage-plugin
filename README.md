# KubeAtlas plugin for Backstage

> **Stable (v1.0.x).** This plugin follows semver from v1.0.0 and tracks Headlamp-plugin feature parity. Pin a version and see the compatibility matrix below.

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

```bash
# from your Backstage app
yarn --cwd packages/app add @lithastra/plugin-kubeatlas
```

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

```bash
npm install        # honours .npmrc (legacy-peer-deps, required by MUI v4)
npm start          # opens the dev app; visit /kubeatlas
```

Gates:

```bash
npm run lint
npm run tsc
npm test           # Jest unit tests with coverage
npm run build
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
