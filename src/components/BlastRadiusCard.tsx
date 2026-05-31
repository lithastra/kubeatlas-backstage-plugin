/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Box,
  Button,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { BlastRadius, kubeAtlasApiRef } from '../api/types';
import { resourceRefFromEntity } from '../lib/entityRef';
import { blastSeverity, severityColor, severityLabel } from '../lib/blastSeverity';

const TOP_N = 10;

// BlastRadiusCard shows how many resources transitively depend on the
// entity's backing resource, graded green/amber/red, with an expandable
// list of the top affected resources. The count and the set come
// straight from the KubeAtlas API — no analysis is re-implemented here.
export const BlastRadiusCard = () => {
  const { entity } = useEntity();
  const api = useApi(kubeAtlasApiRef);
  const ref = resourceRefFromEntity(entity);

  const [data, setData] = useState<BlastRadius | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    api
      .getBlastRadius(ref)
      .then(d => {
        if (!cancelled) setData(d);
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

  const severity = data ? blastSeverity(data.count) : 'none';
  const top = data ? data.affected.slice(0, TOP_N) : [];

  return (
    <InfoCard title="Blast radius">
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {!loading && !error && data && (
        <Box>
          <Chip
            label={`${data.count}`}
            style={{
              backgroundColor: severityColor(severity),
              color: '#ffffff',
              fontWeight: 'bold',
            }}
          />
          <Typography variant="body2" style={{ marginTop: 8 }}>
            {severityLabel(data.count)}
          </Typography>
          {data.count > 0 && (
            <Box>
              <Button
                size="small"
                color="primary"
                onClick={() => setExpanded(v => !v)}
                style={{ marginTop: 8 }}
              >
                {expanded
                  ? 'Hide affected resources'
                  : `Show affected resources (top ${Math.min(TOP_N, data.count)})`}
              </Button>
              <Collapse in={expanded}>
                <List dense>
                  {top.map(r => (
                    <ListItem key={`${r.namespace}/${r.kind}/${r.name}`}>
                      <ListItemText
                        primary={`${r.kind}/${r.name}`}
                        secondary={r.namespace}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          )}
        </Box>
      )}
    </InfoCard>
  );
};
