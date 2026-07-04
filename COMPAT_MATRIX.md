# Compatibility matrix

Each plugin release lists the version combinations it has been **tested**
against. Other combinations may work but are not verified.

| Plugin version | KubeAtlas server | Backstage |
|---|---|---|
| 1.0.x | v1.4 – v1.5 (v1 API) | 1.30 – 1.34 |
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
- Backstage support tracks the two most recent minor releases at the
  time each plugin version ships.
