# Contributing

Thanks for your interest in the KubeAtlas Backstage plugin!

## Developer Certificate of Origin

All commits must be signed off under the [DCO](./DCO). Add `-s` to your
commit:

```bash
git commit -s -m "fix: ..."
```

This appends a `Signed-off-by` trailer certifying you wrote the code or
have the right to contribute it.

## Local development

```bash
npm install        # honours .npmrc (legacy-peer-deps, required by MUI v4)
npm run lint
npm run tsc
npm test
npm run build
```

`npm test` runs the Jest suite with coverage. Keep coverage at or above
the project threshold (70%).

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- The plugin is a **frontend plugin only** — it calls the KubeAtlas v1
  API directly and must not depend on `@backstage/plugin-kubernetes` or
  any Backstage backend plugin.
- Don't re-implement graph analysis in the plugin; call the API.

## Reporting issues

Open an issue on this repository. For security reports, follow
[SECURITY.md](./SECURITY.md).
