/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { KubeAtlasApi, kubeAtlasApiRef } from '../api/types';
import { BlastRadiusCard } from './BlastRadiusCard';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'api', annotations: { 'kubeatlas.io/namespace': 'petclinic' } },
};

function mockApi(count: number): KubeAtlasApi {
  return {
    getResourceDetail: jest.fn(),
    getBlastRadius: jest.fn().mockResolvedValue({
      source: { kind: 'Deployment', name: 'api', namespace: 'petclinic' },
      affected: Array.from({ length: count }, (_, i) => ({
        kind: 'Pod',
        name: `api-${i}`,
        namespace: 'petclinic',
      })),
      count,
      maxDepth: 5,
    }),
  };
}

async function render(api: KubeAtlasApi) {
  await renderInTestApp(
    <TestApiProvider apis={[[kubeAtlasApiRef, api]]}>
      <EntityProvider entity={entity}>
        <BlastRadiusCard />
      </EntityProvider>
    </TestApiProvider>,
  );
}

describe('BlastRadiusCard', () => {
  it('renders the blast-radius count and summary', async () => {
    await render(mockApi(7));
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText(/7 resources depend on this/i)).toBeInTheDocument();
  });

  it('expands the affected-resource list on demand', async () => {
    await render(mockApi(3));
    const toggle = await screen.findByText(/show affected resources/i);
    fireEvent.click(toggle);
    expect(await screen.findByText('Pod/api-0')).toBeInTheDocument();
  });
});
