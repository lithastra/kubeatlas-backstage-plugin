/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { blastSeverity, severityColor, severityLabel } from './blastSeverity';

describe('blastSeverity', () => {
  it.each([
    [0, 'none'],
    [1, 'low'],
    [5, 'low'],
    [6, 'medium'],
    [20, 'medium'],
    [21, 'high'],
    [500, 'high'],
  ])('grades %d as %s', (count, want) => {
    expect(blastSeverity(count)).toBe(want);
  });
});

describe('severityColor', () => {
  it('is red for high, amber for medium, green otherwise', () => {
    expect(severityColor('high')).toBe('#d32f2f');
    expect(severityColor('medium')).toBe('#ed6c02');
    expect(severityColor('low')).toBe('#2e7d32');
    expect(severityColor('none')).toBe('#2e7d32');
  });
});

describe('severityLabel', () => {
  it('reads naturally for 0, 1, and many', () => {
    expect(severityLabel(0)).toMatch(/nothing depends/i);
    expect(severityLabel(1)).toMatch(/1 resource depends/i);
    expect(severityLabel(4)).toMatch(/4 resources depend/i);
  });
});
