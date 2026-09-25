# Changelog

## 1.0.1 — Unreleased

This is a packaging and dependency-maintenance patch. It does not add plugin
features or change the public React/Router peer ranges. This entry describes a
release candidate, not an already published npm version.

### Fixed

- Publish compiled JavaScript and declarations from `dist`. The 1.0.0 tarball
  pointed `main` and `types` at `src/index.ts` but omitted the source modules it
  imported. The packaging lifecycle now builds fresh output, prepares the
  distributed manifest, and restores the development manifest after packing.
- Include and check the package-local import graph, including lazily loaded
  cards, rather than treating a successful source build as package validation.
- Supply the Backstage plugin ID and package relationship metadata required
  by the standard publishing lifecycle.

### Dependency and maintainer updates

- Update `@backstage/core-components` to `^0.18.14` and `@backstage/theme` to
  `^0.7.3`, and refresh the locked dependency tree. The React 17/18 and Router 6
  public peer ranges remain unchanged.
- Use Node.js 24 / npm 11, Backstage CLI 0.36.x, and Jest 30 / jsdom 27 for
  repository development and CI. TypeScript remains on 5.4. These are
  maintainer-tooling requirements, not a new Node engine restriction on the
  consuming application.
- Reject high/critical findings in both the locked production and development
  dependency trees. Verify a real npm tarball before publication, and enforce
  DCO and Conventional Commits checks on contributions.
- Keep CLI/Jest/jsdom and major dependency migrations out of the general
  Dependabot maintenance group. Temporary Yarn-core and ZIP overrides, with
  their removal criteria, are documented in [CONTRIBUTING.md](./CONTRIBUTING.md).

### Upgrade and validation limits

After 1.0.1 is published, upgrade the plugin dependency in the Backstage app to
receive the packaging fix. No component wiring or KubeAtlas configuration
migration is introduced by this patch.

The standalone app uses mock KubeAtlas responses. Package-consumption checks
with React 18 / Router 6 verify artifact imports, not rendering in a complete
Backstage host or compatibility with a live KubeAtlas 1.6 server. See
[COMPAT_MATRIX.md](./COMPAT_MATRIX.md) for the distinction between historical
ranges and this candidate's validation scope.

Lower-severity dependency advisories remain. Consumers must audit their own
application lockfile; the maintainer lockfile is not imposed on installations,
and passing the release gate does not mean that every dependency is free of
known advisories. Only the latest published plugin version receives fixes.

Related changes: [#10](https://github.com/lithastra/kubeatlas-backstage-plugin/pull/10),
[#16](https://github.com/lithastra/kubeatlas-backstage-plugin/pull/16),
[#17](https://github.com/lithastra/kubeatlas-backstage-plugin/pull/17).
