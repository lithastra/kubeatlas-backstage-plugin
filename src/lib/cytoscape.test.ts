/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResourceDetail } from '../api/types';
import {
  buildStylesheet,
  elementsFromDetail,
  idOfResource,
  parseId,
} from './cytoscape';

describe('parseId', () => {
  it('splits a plain id', () => {
    expect(parseId('petclinic/Deployment/api')).toEqual({
      kind: 'Deployment',
      name: 'api',
    });
  });

  it('strips a cluster-id prefix', () => {
    expect(parseId('prod:petclinic/Pod/api-1')).toEqual({ kind: 'Pod', name: 'api-1' });
  });

  it('returns empty parts for a non-conforming id', () => {
    expect(parseId('weird')).toEqual({});
  });
});

describe('idOfResource', () => {
  it('embeds the cluster id when present', () => {
    expect(
      idOfResource({ kind: 'Pod', name: 'p', namespace: 'ns', clusterId: 'east' }),
    ).toBe('east:ns/Pod/p');
  });
});

describe('elementsFromDetail', () => {
  const detail: ResourceDetail = {
    resource: { kind: 'Deployment', name: 'api', namespace: 'petclinic' },
    incoming: [
      { from: 'petclinic/ReplicaSet/api-rs', to: 'petclinic/Deployment/api', type: 'OWNS' },
    ],
    outgoing: [
      { from: 'petclinic/Deployment/api', to: 'petclinic/ConfigMap/cfg', type: 'USES_CONFIGMAP' },
      { from: 'petclinic/Deployment/api', to: 'petclinic/Secret/sec', type: 'USES_SECRET' },
    ],
  };

  it('produces at least three nodes and two edges', () => {
    const els = elementsFromDetail(detail);
    const nodes = els.filter(e => !(e.data as any).source);
    const edges = els.filter(e => (e.data as any).source);
    expect(nodes.length).toBeGreaterThanOrEqual(3);
    expect(edges.length).toBeGreaterThanOrEqual(2);
  });

  it('marks exactly one node as the centre', () => {
    const els = elementsFromDetail(detail);
    const centers = els.filter(e => (e.data as any).role === 'center');
    expect(centers).toHaveLength(1);
    expect((centers[0].data as any).id).toBe('petclinic/Deployment/api');
  });
});

describe('buildStylesheet', () => {
  it('produces node, center, and edge selectors', () => {
    const sheet = buildStylesheet({
      background: '#fff',
      node: '#111',
      center: '#222',
      edge: '#333',
      text: '#444',
    });
    expect(sheet.map(s => s.selector)).toEqual(
      expect.arrayContaining(['node', 'node[role = "center"]', 'edge']),
    );
  });
});
