/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { KubeAtlasEdge } from '../api/types';

// idLabel shortens a KubeAtlas resource id "namespace/Kind/name"
// (optionally "clusterId:namespace/Kind/name") to "Kind/name" for
// display. Falls back to the raw id if it is not in that shape.
export function idLabel(id: string): string {
  const parts = id.split('/');
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
  return id;
}

// RuntimePeer is one runtime-call peer of a resource: the other endpoint
// of a CALLS_AT_RUNTIME edge, which way the call flows, the observed
// call count, and the peer's OTel service.name.
export interface RuntimePeer {
  id: string;
  direction: 'calls' | 'called-by';
  callCount: number;
  service: string;
}

// topPeers ranks the runtime-call peers of resourceId from an overlay's
// edges, busiest first, and returns at most n. An edge FROM the resource
// is an outbound call ('calls'); an edge TO it is inbound ('called-by').
// Edges not incident on the resource are ignored, and a missing/NaN
// call_count sorts as 0.
export function topPeers(
  edges: KubeAtlasEdge[],
  resourceId: string,
  n: number,
): RuntimePeer[] {
  const peers: RuntimePeer[] = [];
  for (const e of edges) {
    const callCount = Number(e.attributes?.call_count ?? '') || 0;
    if (e.from === resourceId) {
      peers.push({ id: e.to, direction: 'calls', callCount, service: e.attributes?.to_service ?? '' });
    } else if (e.to === resourceId) {
      peers.push({ id: e.from, direction: 'called-by', callCount, service: e.attributes?.from_service ?? '' });
    }
  }
  peers.sort((a, b) => b.callCount - a.callCount);
  return peers.slice(0, n);
}
