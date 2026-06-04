/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, test } from '@playwright/test';

// Full flow: load the dev app's KubeAtlas page (which mounts the Entity
// tab against a mock API) and confirm both cards render and the graph
// canvas draws.
test('renders the KubeAtlas Entity tab with a dependency graph', async ({ page }) => {
  await page.goto('/kubeatlas');

  await expect(page.getByText('Dependency graph')).toBeVisible();
  await expect(page.getByText('Blast radius')).toBeVisible();

  // Cytoscape draws into a <canvas> once the mock data resolves.
  await expect(page.locator('canvas').first()).toBeVisible();

  // The blast-radius card shows the mock count (2) and its summary.
  await expect(page.getByText('2 resources depend on this')).toBeVisible();
});

test('expands the affected-resource list', async ({ page }) => {
  await page.goto('/kubeatlas');
  await page.getByRole('button', { name: /show affected resources/i }).click();
  await expect(page.getByText('Pod/orders-1')).toBeVisible();
});
