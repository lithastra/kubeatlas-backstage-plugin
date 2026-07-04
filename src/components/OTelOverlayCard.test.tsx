/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { KubeAtlasApi, KubeAtlasEdge, kubeAtlasApiRef } from '../api/types';
import { OTelOverlayCard } from './OTelOverlayCard';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', annotations: { 'kubeatlas.io/namespace': 'petclinic' } },
};

function apiWithEdges(edges: KubeAtlasEdge[]): KubeAtlasApi {
  return {
    getBlastRadius: jest.fn(),
    getResourceDetail: jest.fn(),
    getOtelOverlay: jest
      .fn()
      .mockResolvedValue({ namespace: 'petclinic', edges, count: edges.length }),
  };
}

async function render(api: KubeAtlasApi) {
  await renderInTestApp(
    <TestApiProvider apis={[[kubeAtlasApiRef, api]]}>
      <EntityProvider entity={entity}>
        <OTelOverlayCard />
      </EntityProvider>
    </TestApiProvider>,
  );
}

describe('OTelOverlayCard', () => {
  it('shows the top runtime peers with call counts', async () => {
    await render(
      apiWithEdges([
        {
          from: 'petclinic/Deployment/frontend',
          to: 'petclinic/Deployment/api',
          type: 'CALLS_AT_RUNTIME',
          attributes: { call_count: '9', from_service: 'frontend' },
        },
      ]),
    );
    // Secondary line is the resource-id label; primary is "← frontend".
    expect(await screen.findByText('Deployment/frontend')).toBeInTheDocument();
    expect(screen.getByText('← frontend')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('shows an empty state when no runtime calls are observed', async () => {
    await render(apiWithEdges([]));
    expect(await screen.findByText(/No runtime calls observed/i)).toBeInTheDocument();
  });

  it('surfaces a friendly note when the overlay is unavailable (otel off / Tier 1)', async () => {
    const api: KubeAtlasApi = {
      getBlastRadius: jest.fn(),
      getResourceDetail: jest.fn(),
      getOtelOverlay: jest.fn().mockRejectedValue(new Error('failed: 503 Service Unavailable')),
    };
    await render(api);
    expect(await screen.findByText(/Runtime overlay unavailable/i)).toBeInTheDocument();
  });
});
