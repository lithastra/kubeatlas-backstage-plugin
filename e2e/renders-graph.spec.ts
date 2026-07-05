/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { expect, test, type Page } from '@playwright/test';

// The dev app (createDevApp) mounts a guest SignInPage. Its provider first
// tries an auth backend that the standalone plugin app doesn't run; on
// failure it opens a confirm() dialog offering the legacy guest token.
// Headless browsers auto-dismiss that dialog (so the sign-in throws), so
// we register a handler to accept it, then click the guest "Enter" button —
// which then signs in as guest and renders the requested route.
async function openPluginPage(page: Page): Promise<void> {
  page.on('dialog', dialog => {
    dialog.accept().catch(() => {});
  });
  await page.goto('/kubeatlas');
  await page.getByRole('button', { name: 'Enter' }).click();
}

// Full flow: load the dev app's KubeAtlas page (which mounts the Entity
// tab against a mock API) and confirm all four cards render and the graph
// canvas draws — this doubles as the Headlamp-parity check (invariant
// 2.6): dependency graph, blast radius, admission policies (F-205), and
// runtime calls (F-204).
test('renders the KubeAtlas Entity tab with all parity cards', async ({ page }) => {
  await openPluginPage(page);

  await expect(page.getByText('Dependency graph')).toBeVisible();
  await expect(page.getByText('Blast radius')).toBeVisible();
  await expect(page.getByText('Admission policies')).toBeVisible();
  await expect(page.getByText('Runtime calls (OTel)')).toBeVisible();

  // Cytoscape draws into a <canvas> once the mock data resolves.
  await expect(page.locator('canvas').first()).toBeVisible();

  // The blast-radius card shows the mock count (2) and its summary.
  await expect(page.getByText('2 resources depend on this')).toBeVisible();

  // The policy card shows the enforcing constraint (compliant in the fixture).
  await expect(page.getByText('K8sRequiredLabels/require-team')).toBeVisible();
  await expect(page.getByText('Compliant')).toBeVisible();

  // The OTel card shows a runtime peer with its call count.
  await expect(page.getByText('← frontend')).toBeVisible();
  await expect(page.getByText('128')).toBeVisible();
});

test('expands the affected-resource list', async ({ page }) => {
  await openPluginPage(page);
  await page.getByRole('button', { name: /show affected resources/i }).click();
  await expect(page.getByText('Pod/orders-1')).toBeVisible();
});
