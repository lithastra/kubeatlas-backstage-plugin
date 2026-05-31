/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { ResourceRef } from '../api/types';

// Annotations an integrator sets on a catalog Entity to point it at the
// backing Kubernetes resource KubeAtlas should graph. All optional —
// sensible defaults keep the common case (a Component backed by a
// Deployment of the same name) zero-config.
export const KUBEATLAS_KIND_ANNOTATION = 'kubeatlas.io/kind';
export const KUBEATLAS_NAME_ANNOTATION = 'kubeatlas.io/name';
export const KUBEATLAS_NAMESPACE_ANNOTATION = 'kubeatlas.io/namespace';

// Backstage's own Kubernetes-namespace annotation is honoured as a
// fallback so an entity already wired for the Kubernetes plugin needs
// no extra KubeAtlas-specific namespace annotation.
const BACKSTAGE_K8S_NAMESPACE_ANNOTATION = 'backstage.io/kubernetes-namespace';

const DEFAULT_KIND = 'Deployment';
const DEFAULT_NAMESPACE = 'default';

// resourceRefFromEntity maps a catalog Entity to the KubeAtlas resource
// to look up. Precedence: explicit kubeatlas.io/* annotations, then the
// Backstage Kubernetes-namespace fallback, then defaults (a Deployment
// named after the entity, in the default namespace).
export function resourceRefFromEntity(entity: Entity): ResourceRef {
  const ann = entity.metadata.annotations ?? {};
  return {
    kind: ann[KUBEATLAS_KIND_ANNOTATION] ?? DEFAULT_KIND,
    name: ann[KUBEATLAS_NAME_ANNOTATION] ?? entity.metadata.name,
    namespace:
      ann[KUBEATLAS_NAMESPACE_ANNOTATION] ??
      ann[BACKSTAGE_K8S_NAMESPACE_ANNOTATION] ??
      DEFAULT_NAMESPACE,
  };
}
