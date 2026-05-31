/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigApi, FetchApi } from '@backstage/core-plugin-api';
import {
  BlastRadius,
  KubeAtlasApi,
  ResourceDetail,
  ResourceRef,
} from './types';

// CLUSTER_SCOPED is the sentinel KubeAtlas uses in URL paths for a
// cluster-scoped resource (empty namespace).
const CLUSTER_SCOPED = '_';

function encodeRef(ref: ResourceRef): string {
  const ns = ref.namespace || CLUSTER_SCOPED;
  return `${encodeURIComponent(ns)}/${encodeURIComponent(ref.kind)}/${encodeURIComponent(ref.name)}`;
}

// resourcePath builds the resource-detail endpoint path (no leading
// slash — it is joined onto the configured base URL).
export function resourcePath(ref: ResourceRef): string {
  return `api/v1/resources/${encodeRef(ref)}`;
}

// blastRadiusPath builds the blast-radius endpoint path.
export function blastRadiusPath(ref: ResourceRef): string {
  return `api/v1/blast-radius/${encodeRef(ref)}`;
}

// KubeAtlasClient talks to a KubeAtlas v1 API over HTTP. The base URL
// comes from Backstage config (`kubeatlas.baseUrl`) — never hard-coded
// (invariant 2.4) — and requests go through Backstage's fetchApi so
// they carry the app's auth context.
export class KubeAtlasClient implements KubeAtlasApi {
  private readonly configApi: ConfigApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { configApi: ConfigApi; fetchApi: FetchApi }) {
    this.configApi = options.configApi;
    this.fetchApi = options.fetchApi;
  }

  private baseUrl(): string {
    const url = this.configApi.getOptionalString('kubeatlas.baseUrl');
    if (!url) {
      throw new Error(
        'KubeAtlas base URL is not configured. Set kubeatlas.baseUrl in app-config.yaml.',
      );
    }
    return url.replace(/\/+$/, '');
  }

  private async getJSON<T>(path: string): Promise<T> {
    const resp = await this.fetchApi.fetch(`${this.baseUrl()}/${path}`);
    if (!resp.ok) {
      throw new Error(
        `KubeAtlas request to /${path} failed: ${resp.status} ${resp.statusText}`,
      );
    }
    return (await resp.json()) as T;
  }

  getResourceDetail(ref: ResourceRef): Promise<ResourceDetail> {
    return this.getJSON<ResourceDetail>(resourcePath(ref));
  }

  getBlastRadius(
    ref: ResourceRef,
    opts?: { maxDepth?: number },
  ): Promise<BlastRadius> {
    const query = opts?.maxDepth ? `?max_depth=${opts.maxDepth}` : '';
    return this.getJSON<BlastRadius>(`${blastRadiusPath(ref)}${query}`);
  }
}
