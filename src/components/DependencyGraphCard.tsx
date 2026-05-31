/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Typography } from '@material-ui/core';
import { Theme, useTheme } from '@material-ui/core/styles';
import cytoscape from 'cytoscape';
import React, { useEffect, useRef, useState } from 'react';
import { kubeAtlasApiRef, ResourceDetail } from '../api/types';
import { resourceRefFromEntity } from '../lib/entityRef';
import { buildStylesheet, elementsFromDetail, Palette } from '../lib/cytoscape';

function paletteFromTheme(theme: Theme): Palette {
  const dark = theme.palette.type === 'dark';
  return {
    background: theme.palette.background.default,
    node: dark ? '#90caf9' : '#1976d2',
    center: theme.palette.primary.main,
    edge: dark ? '#5a5a5a' : '#b5b5b5',
    text: theme.palette.text.primary,
  };
}

// DependencyGraphCard renders the one-hop dependency neighbourhood of
// the entity's backing Kubernetes resource, fetched from KubeAtlas and
// drawn with Cytoscape. Graph analysis stays server-side (invariant
// 2.4) — the card only renders what the API returns.
export const DependencyGraphCard = () => {
  const { entity } = useEntity();
  const api = useApi(kubeAtlasApiRef);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);

  const ref = resourceRefFromEntity(entity);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    api
      .getResourceDetail(ref)
      .then(d => {
        if (!cancelled) setDetail(d);
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

  useEffect(() => {
    if (!detail || !containerRef.current) return undefined;
    const cy = cytoscape({
      container: containerRef.current,
      elements: elementsFromDetail(detail),
      style: buildStylesheet(paletteFromTheme(theme)),
    });
    cy.layout({
      name: 'concentric',
      concentric: (node: cytoscape.NodeSingular) =>
        node.data('role') === 'center' ? 2 : 1,
      levelWidth: () => 1,
      minNodeSpacing: 40,
      padding: 16,
      fit: true,
    } as cytoscape.LayoutOptions).run();
    return () => cy.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, theme.palette.type]);

  const isEmpty =
    detail !== null && detail.incoming.length + detail.outgoing.length === 0;

  return (
    <InfoCard title="Dependency graph">
      {loading && <Progress />}
      {error && <ResponseErrorPanel error={error} />}
      {isEmpty && (
        <Typography variant="body2">
          No dependencies recorded for {ref.kind}/{ref.name}.
        </Typography>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', height: 360, backgroundColor: theme.palette.background.default }}
      />
    </InfoCard>
  );
};
