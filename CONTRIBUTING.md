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

Use Node.js 24 and npm 11. `.nvmrc` is shared with all GitHub Actions workflows;
`devEngines` checks the repository tooling without adding a Node engine
restriction to applications that consume the published plugin.

```bash
nvm install && nvm use # optional: use any manager that provides Node.js 24
npm ci             # honours .npmrc (legacy-peer-deps, required by MUI v4)
npm run audit:production
npm run audit:all
npm run lint
npm run tsc
npm test
npm run build
npm run test:package
```

`npm test` runs the Jest suite with coverage. Keep coverage at or above
the project threshold (70%).

## Package verification

`npm pack` builds fresh JavaScript and declarations, then uses Backstage's
`prepack` command to switch the package entrypoints from `src` to `dist`.
`postpack` restores the source manifest. Keep both lifecycle hooks enabled;
`npm pack --ignore-scripts` does not produce a valid release artifact.

`npm run test:package` creates a real tarball without publishing it. It unpacks
that tarball into an isolated consumer layout and checks JavaScript and
TypeScript entry resolution, plugin metadata, and the package-local import
graph, including lazy card imports. It also confirms the source manifest and
lockfile are unchanged. The test uses Node.js and declared npm dependencies,
not shell archive tools, workstation paths, or a Kubernetes cluster. Successful
fixtures are removed; failed fixtures are retained in the system temporary
directory with their location printed for diagnosis.

CI and the release workflow run this check before publication. This checks the
package artifact, not rendering in a real Backstage host or live-server API
compatibility. If an interrupted pack leaves `package.json-prepack`, inspect
the files and run `npm run postpack` to restore the source manifest before
continuing; do not commit the generated manifest or backup.

## Dependency updates

Keep React, React DOM, Router, and TypeScript on the supported major versions
unless the change explicitly includes a compatibility migration. Review major
updates separately instead of merging them into a grouped maintenance update.
Do not use `npm audit fix --force` to bypass that review.

Backstage CLI and Jest/jsdom updates are also reviewed separately: a CLI
pre-1.0 minor update can change build defaults and test-environment contracts.
The repository declares Jest 30, its types, the abstract jsdom environment,
and jsdom 27 explicitly, as required by the current Backstage CLI. Do not rely
on automatic peer installation because `.npmrc` uses `legacy-peer-deps`.

One temporary transitive override pins `@yarnpkg/core` to 4.9.1. Version 4.9.2
was published with a Yarn-only `patch:got@...` dependency that npm cannot
resolve, including when it is installed indirectly by the Backstage CLI.
Remove this pin after an npm-installable upstream release passes a clean
installation, the full audit, and the normal test/build gates. Do not replace
the patch dependency with an arbitrary `got` version to silence the error.

A second override applies only to `@module-federation/dts-plugin`: its exact
`adm-zip@0.6.0` dependency is replaced with the upstream 0.6.1 security patch
for extraction and decompression issues. Remove this override once that
dependency is updated upstream; validate the archive API and build before
changing it.

CI and release builds reject high or critical findings in both the committed
production tree (`npm run audit:production`) and the full tree including
development tools (`npm run audit:all`). The required `Production dependency
audit` check runs both commands. Lower-severity findings still need triage,
even when the gate passes. A green gate is not a
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
