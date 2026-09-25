# Security policy

## Reporting a vulnerability

Please report security vulnerabilities privately. Do **not** open a
public issue for a security problem.

Email the maintainers at **security@lithastra.com** with details and, if
possible, a reproduction. You can expect an acknowledgement within a few
business days.

This plugin is a thin client over the KubeAtlas server's v1 API. Issues
in KubeAtlas itself should be reported through the
[main repository's security policy](https://github.com/lithastra/kubeatlas/security/policy).

## Supported versions

Only the latest published plugin release receives security fixes. Older
releases are not maintained in parallel. Unreleased changes on the main
branch are not a published security fix.

## Dependency checks

CI and release builds reject high or critical findings in the locked production
dependency tree. Development-tool advisories and lower-severity findings must
be reviewed separately; passing this gate does not mean there are no known
advisories or prove that a vulnerable code path is unreachable.

The npm package does not impose this repository's lockfile on a consuming
Backstage application. Operators must audit and update their application's
own dependency tree; a fixed maintainer lockfile does not repair an existing
installation automatically.
