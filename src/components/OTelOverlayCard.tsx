/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Chip, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { kubeAtlasApiRef } from '../api/types';
import { resourceRefFromEntity } from '../lib/entityRef';
import { idLabel, RuntimePeer, topPeers } from '../lib/overlay';

const TOP_N = 5;

// OTelOverlayCard shows the top runtime-call peers of the entity's
// backing resource — the workloads it calls or is called by, observed
// from OpenTelemetry traces (F-204 parity with the Headlamp plugin's
// OTel Overlay view, scoped to this entity). The overlay is Tier 2 +
// otel.enabled only; on any other server the card surfaces a clear note
// rather than a scary error panel — an unconfigured overlay is expected,
// not a failure.
export const OTelOverlayCard = () => {
  const { entity } = useEntity();
  const api = useApi(kubeAtlasApiRef);
  const ref = resourceRefFromEntity(entity);
  const resourceId = `${ref.namespace}/${ref.kind}/${ref.name}`;

  const [peers, setPeers] = useState<RuntimePeer[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMsg(undefined);
    api
      .getOtelOverlay(ref.namespace)
      .then(ov => {
        if (!cancelled) setPeers(topPeers(ov.edges ?? [], resourceId, TOP_N));
      })
      .catch(e => {
        if (!cancelled) setErrorMsg(e instanceof Error ? e.message : String(e));
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
    <InfoCard title="Runtime calls (OTel)">
      {loading && <Progress />}
      {!loading && errorMsg && (
        <Typography variant="body2" color="textSecondary">
          Runtime overlay unavailable: {errorMsg}. It needs a Tier 2 KubeAtlas with{' '}
          <code>otel.enabled</code> and OTLP traces flowing.
        </Typography>
      )}
      {!loading && !errorMsg && peers && peers.length === 0 && (
        <Typography variant="body2">
          No runtime calls observed for this resource in the recent window.
        </Typography>
      )}
      {!loading && !errorMsg && peers && peers.length > 0 && (
        <List dense>
          {peers.map(p => (
            <ListItem key={`${p.direction}:${p.id}`}>
              <ListItemText
                primary={`${p.direction === 'calls' ? '→ ' : '← '}${p.service || idLabel(p.id)}`}
                secondary={idLabel(p.id)}
              />
              <Chip size="small" label={`${p.callCount}`} />
            </ListItem>
          ))}
        </List>
      )}
    </InfoCard>
  );
};
