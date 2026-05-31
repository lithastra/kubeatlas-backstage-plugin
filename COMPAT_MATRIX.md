# Compatibility matrix

Each plugin release lists the version combinations it has been **tested**
against. Other combinations may work but are not verified.

| Plugin version | KubeAtlas server | Backstage |
|---|---|---|
| 0.1.x | v1.4.x (v1 API) | 1.30 – 1.34 |

Notes:

- The plugin only calls the KubeAtlas **v1** API (`/api/v1/resources/*`,
  `/api/v1/blast-radius/*`), so it is unaffected by the v1alpha1
  deprecation cycle.
- Backstage support tracks the two most recent minor releases at the
  time each plugin version ships.
