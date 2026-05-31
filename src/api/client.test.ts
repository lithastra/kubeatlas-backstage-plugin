/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigApi, FetchApi } from '@backstage/core-plugin-api';
import {
  KubeAtlasClient,
  blastRadiusPath,
  resourcePath,
} from './client';

describe('path builders', () => {
  it('builds the resource-detail path', () => {
    expect(resourcePath({ namespace: 'petclinic', kind: 'Deployment', name: 'api' })).toBe(
      'api/v1/resources/petclinic/Deployment/api',
    );
  });

  it('uses the "_" sentinel for a cluster-scoped resource', () => {
    expect(resourcePath({ namespace: '', kind: 'Node', name: 'worker-1' })).toBe(
      'api/v1/resources/_/Node/worker-1',
    );
  });

  it('url-encodes path segments', () => {
    expect(
      blastRadiusPath({ namespace: 'team a', kind: 'Deployment', name: 'a/b' }),
    ).toBe('api/v1/blast-radius/team%20a/Deployment/a%2Fb');
  });
});

function fakeConfig(baseUrl?: string): ConfigApi {
  return {
    getOptionalString: (key: string) =>
      key === 'kubeatlas.baseUrl' ? baseUrl : undefined,
  } as unknown as ConfigApi;
}

function fakeFetch(body: unknown, ok = true): { api: FetchApi; calls: string[] } {
  const calls: string[] = [];
  const api = {
    fetch: (input: string) => {
      calls.push(input);
      return Promise.resolve({
        ok,
        status: ok ? 200 : 500,
        statusText: ok ? 'OK' : 'Internal Server Error',
        json: () => Promise.resolve(body),
      } as Response);
    },
  } as unknown as FetchApi;
  return { api, calls };
}

describe('KubeAtlasClient', () => {
  const ref = { namespace: 'petclinic', kind: 'Deployment', name: 'api' };

  it('fetches resource detail from the configured base URL', async () => {
    const detail = { resource: ref, incoming: [], outgoing: [] };
    const { api: fetchApi, calls } = fakeFetch(detail);
    const client = new KubeAtlasClient({
      configApi: fakeConfig('https://ka.example.com/'),
      fetchApi,
    });

    await expect(client.getResourceDetail(ref)).resolves.toEqual(detail);
    // trailing slash on the base URL is trimmed
    expect(calls).toEqual([
      'https://ka.example.com/api/v1/resources/petclinic/Deployment/api',
    ]);
  });

  it('passes max_depth to the blast-radius endpoint', async () => {
    const { api: fetchApi, calls } = fakeFetch({
      source: ref,
      affected: [],
      count: 0,
      maxDepth: 3,
    });
    const client = new KubeAtlasClient({
      configApi: fakeConfig('https://ka.example.com'),
      fetchApi,
    });

    await client.getBlastRadius(ref, { maxDepth: 3 });
    expect(calls[0]).toBe(
      'https://ka.example.com/api/v1/blast-radius/petclinic/Deployment/api?max_depth=3',
    );
  });

  it('throws a helpful error when the base URL is not configured', async () => {
    const { api: fetchApi } = fakeFetch({});
    const client = new KubeAtlasClient({ configApi: fakeConfig(undefined), fetchApi });
    await expect(client.getResourceDetail(ref)).rejects.toThrow(/not configured/);
  });

  it('throws on a non-2xx response', async () => {
    const { api: fetchApi } = fakeFetch({}, false);
    const client = new KubeAtlasClient({
      configApi: fakeConfig('https://ka.example.com'),
      fetchApi,
    });
    await expect(client.getResourceDetail(ref)).rejects.toThrow(/failed: 500/);
  });
});
