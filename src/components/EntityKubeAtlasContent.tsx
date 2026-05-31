/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Grid } from '@material-ui/core';
import { BlastRadiusCard } from './BlastRadiusCard';
import { DependencyGraphCard } from './DependencyGraphCard';

// EntityKubeAtlasContent is the full "KubeAtlas" Entity tab: the
// dependency graph alongside the blast-radius summary. Card + tab
// embedding only — it is not a mirror of the KubeAtlas web UI
// (invariant 2.4).
export const EntityKubeAtlasContent = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={7}>
      <DependencyGraphCard />
    </Grid>
    <Grid item xs={12} md={5}>
      <BlastRadiusCard />
    </Grid>
  </Grid>
);
