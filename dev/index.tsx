/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import React from 'react';

import { KubeAtlasApi, kubeAtlasApiRef } from '../src/api/types';
import { EntityKubeAtlasContent, kubeAtlasPlugin } from '../src/plugin';

// A fixture entity, mapped (via annotations) to a petclinic Deployment.
const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'orders',
    namespace: 'default',
    annotations: { 'kubeatlas.io/namespace': 'petclinic' },
  },
  spec: { type: 'service', lifecycle: 'production', owner: 'team-a' },
};

// A mock KubeAtlas API so the dev app (and the e2e test) render a fixed
// graph without a real KubeAtlas server. It overrides the plugin's real
// client for this app only.
const mockApi: KubeAtlasApi = {
  getResourceDetail: async () => ({
    resource: { kind: 'Deployment', name: 'orders', namespace: 'petclinic' },
    incoming: [
      { from: 'petclinic/ReplicaSet/orders-rs', to: 'petclinic/Deployment/orders', type: 'OWNS' },
    ],
    outgoing: [
      { from: 'petclinic/Deployment/orders', to: 'petclinic/ConfigMap/orders-config', type: 'USES_CONFIGMAP' },
      { from: 'petclinic/Deployment/orders', to: 'petclinic/Secret/orders-db', type: 'USES_SECRET' },
    ],
  }),
  getBlastRadius: async () => ({
    source: { kind: 'Deployment', name: 'orders', namespace: 'petclinic' },
    affected: [
      { kind: 'Pod', name: 'orders-1', namespace: 'petclinic' },
      { kind: 'Pod', name: 'orders-2', namespace: 'petclinic' },
    ],
    count: 2,
    maxDepth: 5,
  }),
};

createDevApp()
  .registerPlugin(kubeAtlasPlugin)
  .registerApi({
    api: kubeAtlasApiRef,
    deps: {},
    factory: () => mockApi,
  })
  .addPage({
    title: 'KubeAtlas',
    path: '/kubeatlas',
    element: (
      <EntityProvider entity={entity}>
        <EntityKubeAtlasContent />
      </EntityProvider>
    ),
  })
  .render();
