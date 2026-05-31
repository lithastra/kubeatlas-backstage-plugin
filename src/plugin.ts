/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { KubeAtlasClient } from './api/client';
import { kubeAtlasApiRef } from './api/types';
import { rootRouteRef } from './routes';

// kubeAtlasPlugin registers the KubeAtlas utility API. The client reads
// its base URL from config (kubeatlas.baseUrl) and fetches through
// Backstage's fetchApi, so it depends on no Backstage backend plugin
// and no @backstage/plugin-kubernetes (invariant 2.4).
export const kubeAtlasPlugin = createPlugin({
  id: 'kubeatlas',
  apis: [
    createApiFactory({
      api: kubeAtlasApiRef,
      deps: { configApi: configApiRef, fetchApi: fetchApiRef },
      factory: ({ configApi, fetchApi }) =>
        new KubeAtlasClient({ configApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

// EntityKubeAtlasContent is the full "KubeAtlas" Entity tab. Mount it in
// your EntityPage with an <EntityLayout.Route path="/kubeatlas">.
export const EntityKubeAtlasContent = kubeAtlasPlugin.provide(
  createComponentExtension({
    name: 'EntityKubeAtlasContent',
    component: {
      lazy: () =>
        import('./components/EntityKubeAtlasContent').then(
          m => m.EntityKubeAtlasContent,
        ),
    },
  }),
);

// EntityDependencyGraphCard / EntityBlastRadiusCard are the individual
// cards, for integrators who want to place them on an existing tab
// rather than use the dedicated KubeAtlas tab.
export const EntityDependencyGraphCard = kubeAtlasPlugin.provide(
  createComponentExtension({
    name: 'EntityDependencyGraphCard',
    component: {
      lazy: () =>
        import('./components/DependencyGraphCard').then(
          m => m.DependencyGraphCard,
        ),
    },
  }),
);

export const EntityBlastRadiusCard = kubeAtlasPlugin.provide(
  createComponentExtension({
    name: 'EntityBlastRadiusCard',
    component: {
      lazy: () =>
        import('./components/BlastRadiusCard').then(m => m.BlastRadiusCard),
    },
  }),
);
