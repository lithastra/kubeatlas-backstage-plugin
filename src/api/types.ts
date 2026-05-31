/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createApiRef } from '@backstage/core-plugin-api';

// Wire types mirroring the KubeAtlas v1 REST API. The plugin is a
// client, so these must match what the server emits; the code is the
// plugin's own and shares nothing with the KubeAtlas frontend or the
// Headlamp plugin (invariant 2.4 — independent implementations).

// KubeAtlasResource is one node of the dependency graph.
export interface KubeAtlasResource {
  kind: string;
  name: string;
  namespace: string;
  groupVersion?: string;
  uid?: string;
  labels?: Record<string, string>;
  clusterId?: string;
}

// KubeAtlasEdge is one directed dependency. `from` and `to` are
// KubeAtlas resource ids of the form "namespace/Kind/name"
// (optionally "clusterId:namespace/Kind/name" in federated mode).
export interface KubeAtlasEdge {
  from: string;
  to: string;
  type: string;
}

// ResourceDetail is the body of GET /api/v1/resources/{ns}/{kind}/{name}:
// a resource plus its one-hop incoming and outgoing edges.
export interface ResourceDetail {
  resource: KubeAtlasResource;
  incoming: KubeAtlasEdge[];
  outgoing: KubeAtlasEdge[];
}

// BlastRadius is the body of GET /api/v1/blast-radius/{ns}/{kind}/{name}:
// the transitive set of resources that depend on the source.
export interface BlastRadius {
  source: KubeAtlasResource;
  affected: KubeAtlasResource[];
  count: number;
  maxDepth: number;
}

// ResourceRef identifies a single KubeAtlas resource to look up.
export interface ResourceRef {
  namespace: string;
  kind: string;
  name: string;
}

// KubeAtlasApi is the Backstage utility-API the plugin's components
// consume. Implemented by KubeAtlasClient and provided through
// kubeAtlasApiRef so tests can swap in a mock.
export interface KubeAtlasApi {
  getResourceDetail(ref: ResourceRef): Promise<ResourceDetail>;
  getBlastRadius(ref: ResourceRef, opts?: { maxDepth?: number }): Promise<BlastRadius>;
}

export const kubeAtlasApiRef = createApiRef<KubeAtlasApi>({
  id: 'plugin.kubeatlas.service',
});
