/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  kubeAtlasPlugin,
  EntityKubeAtlasContent,
  EntityDependencyGraphCard,
  EntityBlastRadiusCard,
} from './plugin';

export { kubeAtlasApiRef } from './api/types';
export type {
  KubeAtlasApi,
  KubeAtlasResource,
  KubeAtlasEdge,
  ResourceDetail,
  ResourceRef,
  BlastRadius,
} from './api/types';
