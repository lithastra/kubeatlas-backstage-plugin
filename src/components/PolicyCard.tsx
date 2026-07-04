/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Chip, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { KubeAtlasEdge, kubeAtlasApiRef } from '../api/types';
import { resourceRefFromEntity } from '../lib/entityRef';
import { idLabel } from '../lib/overlay';

// PolicyCard shows the admission policies (Gatekeeper Constraints /
// Kyverno policies) that enforce the entity's backing resource, with
// their live violation status. It reads the resource's incoming
// ENFORCES edges from the KubeAtlas API — KubeAtlas observes the policy
// engines, so no policy is re-evaluated here (F-205 parity with the
// Headlamp plugin's Policies view, scoped to this entity).
export const PolicyCard = () => {
  const { entity } = useEntity();
  const api = useApi(kubeAtlasApiRef);
  const ref = resourceRefFromEntity(entity);

  const [enforcing, setEnforcing] = useState<KubeAtlasEdge[] | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    api
      .getResourceDetail(ref)
      .then(d => {
        if (!cancelled) {
          setEnforcing((d.incoming ?? []).filter(e => e.type === 'ENFORCES'));
        }
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.namespace, ref.kind, ref.name]);

  return (
    <InfoCard title="Admission policies">
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {!loading && !error && enforcing && enforcing.length === 0 && (
        <Typography variant="body2">No admission policies enforce this resource.</Typography>
      )}
      {!loading && !error && enforcing && enforcing.length > 0 && (
        <List dense>
          {enforcing.map(e => {
            const violated = e.attributes?.violated === 'true';
            return (
              <ListItem key={e.from}>
                <ListItemText
                  primary={idLabel(e.from)}
                  secondary={e.attributes?.violation_message}
                />
                <Chip
                  size="small"
                  label={violated ? 'Violating' : 'Compliant'}
                  style={{ backgroundColor: violated ? '#c0392b' : '#2e7d32', color: '#ffffff' }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </InfoCard>
  );
};
