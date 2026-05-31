/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import type cytoscape from 'cytoscape';
import { KubeAtlasEdge, KubeAtlasResource, ResourceDetail } from '../api/types';

// Palette drives the graph stylesheet. Derived from the Backstage MUI
// theme in the component so the graph reads as part of the same product
// as the standalone KubeAtlas UI (invariant 2.4 — consistent look,
// independent implementation).
export interface Palette {
  background: string;
  node: string;
  center: string;
  edge: string;
  text: string;
}

// idOfResource recomputes a resource's KubeAtlas id so the center node
// lines up with the from/to ids the edges carry.
export function idOfResource(r: KubeAtlasResource): string {
  const base = `${r.namespace}/${r.kind}/${r.name}`;
  return r.clusterId ? `${r.clusterId}:${base}` : base;
}

// parseId splits a KubeAtlas id ("[clusterId:]namespace/Kind/name")
// into parts for labelling.
export function parseId(id: string): { kind?: string; name?: string } {
  let rest = id;
  const colon = id.indexOf(':');
  const slash = id.indexOf('/');
  if (colon > -1 && (slash === -1 || colon < slash)) {
    rest = id.slice(colon + 1);
  }
  const parts = rest.split('/');
  if (parts.length === 3) {
    return { kind: parts[1], name: parts[2] };
  }
  return {};
}

function labelFor(id: string): string {
  const { kind, name } = parseId(id);
  return kind && name ? `${kind}/${name}` : id;
}

function edgeElement(e: KubeAtlasEdge): cytoscape.ElementDefinition {
  return {
    data: {
      id: `${e.from}|${e.type}|${e.to}`,
      source: e.from,
      target: e.to,
      label: e.type,
    },
  };
}

// elementsFromDetail turns a one-hop ResourceDetail into Cytoscape
// elements: the centre resource plus every neighbour, and one edge per
// incoming/outgoing dependency. Every edge endpoint is added as a node
// so no edge dangles.
export function elementsFromDetail(detail: ResourceDetail): cytoscape.ElementDefinition[] {
  const center = idOfResource(detail.resource);
  const nodeIds = new Set<string>([center]);
  const edges: cytoscape.ElementDefinition[] = [];

  for (const e of [...detail.incoming, ...detail.outgoing]) {
    nodeIds.add(e.from);
    nodeIds.add(e.to);
    edges.push(edgeElement(e));
  }

  const nodes: cytoscape.ElementDefinition[] = [...nodeIds].map(id => ({
    data: {
      id,
      label: labelFor(id),
      role: id === center ? 'center' : 'neighbor',
    },
  }));

  return [...nodes, ...edges];
}

// buildStylesheet renders the palette into a Cytoscape stylesheet. The
// centre node is emphasised; neighbours and edges use the muted theme
// colours.
export function buildStylesheet(palette: Palette): cytoscape.StylesheetCSS[] {
  return [
    {
      selector: 'node',
      css: {
        'background-color': palette.node,
        label: 'data(label)',
        color: palette.text,
        'font-size': '10px',
        'text-valign': 'bottom',
        'text-margin-y': 4,
        width: 22,
        height: 22,
      },
    },
    {
      selector: 'node[role = "center"]',
      css: {
        'background-color': palette.center,
        width: 32,
        height: 32,
        'font-size': '12px',
        'font-weight': 'bold',
      },
    },
    {
      selector: 'edge',
      css: {
        width: 1.5,
        'line-color': palette.edge,
        'target-arrow-color': palette.edge,
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'font-size': '8px',
        color: palette.text,
        label: 'data(label)',
        'text-rotation': 'autorotate',
      },
    },
  ];
}
