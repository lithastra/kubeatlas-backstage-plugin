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
npm ci             # honours .npmrc (legacy-peer-deps, required by MUI v4)
npm run audit:production
npm run lint
npm run tsc
npm test
npm run build
```

`npm test` runs the Jest suite with coverage. Keep coverage at or above
the project threshold (70%).

## Dependency updates

Keep React, React DOM, Router, and TypeScript on the supported major versions
unless the change explicitly includes a compatibility migration. Review major
updates separately instead of merging them into a grouped maintenance update.
Do not use `npm audit fix --force` to bypass that review.

CI and release builds reject high or critical findings in the committed
production dependency tree with `npm run audit:production`. Run the full
`npm audit` as well: development-tool findings and moderate production findings
still need triage, even when the production gate passes. A green gate is not a
claim that the dependency tree has no advisories or that every advisory is
reachable in the shipped browser bundle.

Dependency changes require lint, TypeScript, unit tests, a production build,
and the Playwright suite. The dev app uses mock KubeAtlas responses; those tests
do not establish compatibility with a newly released KubeAtlas server.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- The plugin is a **frontend plugin only** — it calls the KubeAtlas v1
  API directly and must not depend on `@backstage/plugin-kubernetes` or
  any Backstage backend plugin.
- Don't re-implement graph analysis in the plugin; call the API.

## Reporting issues

Open an issue on this repository. For security reports, follow
[SECURITY.md](./SECURITY.md).
