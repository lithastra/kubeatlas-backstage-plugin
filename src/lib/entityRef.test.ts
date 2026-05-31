/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity } from '@backstage/catalog-model';
import { resourceRefFromEntity } from './entityRef';

function entity(annotations?: Record<string, string>): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'orders', annotations },
  };
}

describe('resourceRefFromEntity', () => {
  it('defaults to a Deployment named after the entity in the default namespace', () => {
    expect(resourceRefFromEntity(entity())).toEqual({
      kind: 'Deployment',
      name: 'orders',
      namespace: 'default',
    });
  });

  it('honours explicit kubeatlas.io annotations', () => {
    const ref = resourceRefFromEntity(
      entity({
        'kubeatlas.io/kind': 'StatefulSet',
        'kubeatlas.io/name': 'orders-db',
        'kubeatlas.io/namespace': 'shop',
      }),
    );
    expect(ref).toEqual({ kind: 'StatefulSet', name: 'orders-db', namespace: 'shop' });
  });

  it('falls back to the Backstage Kubernetes-namespace annotation', () => {
    const ref = resourceRefFromEntity(
      entity({ 'backstage.io/kubernetes-namespace': 'shop' }),
    );
    expect(ref.namespace).toBe('shop');
  });

  it('prefers the kubeatlas namespace annotation over the Backstage one', () => {
    const ref = resourceRefFromEntity(
      entity({
        'kubeatlas.io/namespace': 'a',
        'backstage.io/kubernetes-namespace': 'b',
      }),
    );
    expect(ref.namespace).toBe('a');
  });
});
