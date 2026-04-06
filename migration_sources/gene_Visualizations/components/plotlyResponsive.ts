'use client';

import { useEffect } from 'react';

/** Triggers Plotly to re-measure after mount (avoids blurry canvas on first paint). */
export function usePlotlyResizeOnMount() {
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
    return () => cancelAnimationFrame(raf);
  }, []);
}

export const plotlyResponsiveConfig: Record<string, unknown> = {
  responsive: true,
  displayModeBar: true,
  doubleClick: 'reset',
};

/** Base layout: autosize, transparent backgrounds, default margins (override per chart). */
export function plotlyBaseLayout(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { t: 40, l: 40, r: 40, b: 40 },
    ...overrides,
  };
}
