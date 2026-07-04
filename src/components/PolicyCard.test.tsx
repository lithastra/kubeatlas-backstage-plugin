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
import { PolicyCard } from './PolicyCard';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', annotations: { 'kubeatlas.io/namespace': 'petclinic' } },
};

function apiWith(incoming: KubeAtlasEdge[]): KubeAtlasApi {
  return {
    getBlastRadius: jest.fn(),
    getOtelOverlay: jest.fn(),
    getResourceDetail: jest.fn().mockResolvedValue({
      resource: { kind: 'Deployment', name: 'api', namespace: 'petclinic' },
      incoming,
      outgoing: [],
    }),
  };
}

async function render(api: KubeAtlasApi) {
  await renderInTestApp(
    <TestApiProvider apis={[[kubeAtlasApiRef, api]]}>
      <EntityProvider entity={entity}>
        <PolicyCard />
      </EntityProvider>
    </TestApiProvider>,
  );
}

describe('PolicyCard', () => {
  it('lists enforcing constraints with their violation status, ignoring non-policy edges', async () => {
    await render(
      apiWith([
        {
          from: 'gatekeeper/K8sRequiredLabels/require-team',
          to: 'petclinic/Deployment/api',
          type: 'ENFORCES',
          attributes: { violated: 'true', violation_message: 'missing team label' },
        },
        { from: 'petclinic/ConfigMap/app', to: 'petclinic/Deployment/api', type: 'USES_CONFIGMAP' },
      ]),
    );
    expect(await screen.findByText('K8sRequiredLabels/require-team')).toBeInTheDocument();
    expect(screen.getByText('Violating')).toBeInTheDocument();
    expect(screen.getByText('missing team label')).toBeInTheDocument();
    // A non-ENFORCES edge must not appear.
    expect(screen.queryByText('ConfigMap/app')).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing enforces the resource', async () => {
    await render(apiWith([]));
    expect(await screen.findByText(/No admission policies enforce/i)).toBeInTheDocument();
  });
});
