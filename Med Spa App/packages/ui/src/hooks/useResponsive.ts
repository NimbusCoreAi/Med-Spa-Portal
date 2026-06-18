'use client';

import { useEffect, useState } from 'react';
import { breakpoints } from '../constants/spacing';

type Breakpoint = keyof typeof breakpoints;

export function useResponsive(breakpoint: Breakpoint = 'md'): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [breakpoint]);

  return matches;
}
