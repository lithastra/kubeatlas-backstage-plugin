/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { KubeAtlasEdge } from '../api/types';
import { idLabel, topPeers } from './overlay';

describe('idLabel', () => {
  it('shortens ns/Kind/name to Kind/name', () => {
    expect(idLabel('petclinic/Deployment/api')).toBe('Deployment/api');
  });

  it('returns a bare id unchanged', () => {
    expect(idLabel('standalone')).toBe('standalone');
  });
});

describe('topPeers', () => {
  const edges: KubeAtlasEdge[] = [
    {
      from: 'petclinic/Deployment/frontend',
      to: 'petclinic/Deployment/api',
      type: 'CALLS_AT_RUNTIME',
      attributes: { call_count: '9', from_service: 'frontend' },
    },
    {
      from: 'petclinic/Deployment/api',
      to: 'petclinic/Deployment/db',
      type: 'CALLS_AT_RUNTIME',
      attributes: { call_count: '3', to_service: 'db' },
    },
    {
      from: 'other/Deployment/x',
      to: 'other/Deployment/y',
      type: 'CALLS_AT_RUNTIME',
      attributes: { call_count: '5' },
    },
  ];

  it('returns inbound and outbound peers of a resource, busiest first', () => {
    const peers = topPeers(edges, 'petclinic/Deployment/api', 5);
    expect(peers).toHaveLength(2);
    expect(peers[0]).toMatchObject({
      id: 'petclinic/Deployment/frontend',
      direction: 'called-by',
      callCount: 9,
    });
    expect(peers[1]).toMatchObject({
      id: 'petclinic/Deployment/db',
      direction: 'calls',
      callCount: 3,
    });
  });

  it('ignores edges not incident on the resource', () => {
    const peers = topPeers(edges, 'petclinic/Deployment/api', 5);
    expect(peers.some(p => p.id.startsWith('other/'))).toBe(false);
  });

  it('caps at n', () => {
    expect(topPeers(edges, 'petclinic/Deployment/api', 1)).toHaveLength(1);
  });

  it('treats a missing call_count as 0', () => {
    const bare: KubeAtlasEdge[] = [{ from: 'a', to: 'b', type: 'CALLS_AT_RUNTIME' }];
    expect(topPeers(bare, 'a', 5)[0].callCount).toBe(0);
  });
});
