/*
 * Copyright 2026 The KubeAtlas Authors
 * SPDX-License-Identifier: Apache-2.0
 */

// Severity buckets the blast-radius count into a traffic-light grade so
// the card can colour it green / amber / red. Thresholds are
// deliberately simple — the point is a glanceable signal, not a precise
// risk score.
export type Severity = 'none' | 'low' | 'medium' | 'high';

export function blastSeverity(count: number): Severity {
  if (count <= 0) return 'none';
  if (count <= 5) return 'low';
  if (count <= 20) return 'medium';
  return 'high';
}

// severityColor returns the hex used to tint the count chip. none/low
// are green (nothing, or little, depends on this resource), medium amber,
// high red.
export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'high':
      return '#d32f2f';
    case 'medium':
      return '#ed6c02';
    case 'low':
    case 'none':
    default:
      return '#2e7d32';
  }
}

export function severityLabel(count: number): string {
  if (count <= 0) return 'Nothing depends on this resource';
  if (count === 1) return '1 resource depends on this';
  return `${count} resources depend on this`;
}
