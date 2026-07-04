/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import React from 'react';
import { KubeAtlasApi, kubeAtlasApiRef } from '../api/types';
import { DependencyGraphCard } from './DependencyGraphCard';

// Cytoscape needs a real canvas/layout engine that jsdom does not
// provide; mock it so the component mounts and we assert on the React
// shell (the real rendering is covered by e2e).
jest.mock('cytoscape', () => {
  const instance = { layout: () => ({ run: jest.fn() }), destroy: jest.fn() };
  return { __esModule: true, default: jest.fn(() => instance) };
});

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', annotations: { 'kubeatlas.io/namespace': 'petclinic' } },
};

describe('DependencyGraphCard', () => {
  it('fetches the entity neighbours and renders the card', async () => {
    const api: KubeAtlasApi = {
      getBlastRadius: jest.fn(),
      getOtelOverlay: jest.fn(),
      getResourceDetail: jest.fn().mockResolvedValue({
        resource: { kind: 'Deployment', name: 'api', namespace: 'petclinic' },
        incoming: [],
        outgoing: [
          { from: 'petclinic/Deployment/api', to: 'petclinic/ConfigMap/cfg', type: 'USES_CONFIGMAP' },
        ],
      }),
    };

    await renderInTestApp(
      <TestApiProvider apis={[[kubeAtlasApiRef, api]]}>
        <EntityProvider entity={entity}>
          <DependencyGraphCard />
        </EntityProvider>
      </TestApiProvider>,
    );

    expect(await screen.findByText('Dependency graph')).toBeInTheDocument();
    expect(api.getResourceDetail).toHaveBeenCalledWith({
      kind: 'Deployment',
      name: 'api',
      namespace: 'petclinic',
    });
  });
});
