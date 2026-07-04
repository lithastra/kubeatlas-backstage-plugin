/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Grid } from '@material-ui/core';
import { BlastRadiusCard } from './BlastRadiusCard';
import { DependencyGraphCard } from './DependencyGraphCard';
import { OTelOverlayCard } from './OTelOverlayCard';
import { PolicyCard } from './PolicyCard';

// EntityKubeAtlasContent is the full "KubeAtlas" Entity tab: the
// dependency graph alongside the blast-radius summary, the admission
// policies enforcing the resource (F-205), and its observed runtime-call
// peers (F-204). Card + tab embedding only — it is not a mirror of the
// KubeAtlas web UI, and it stays at Headlamp parity, never more or less
// (invariant 2.6).
export const EntityKubeAtlasContent = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={7}>
      <DependencyGraphCard />
    </Grid>
    <Grid item xs={12} md={5}>
      <BlastRadiusCard />
    </Grid>
    <Grid item xs={12} md={6}>
      <PolicyCard />
    </Grid>
    <Grid item xs={12} md={6}>
      <OTelOverlayCard />
    </Grid>
  </Grid>
);
