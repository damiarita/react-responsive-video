'use client';

import { useState, useEffect } from 'react';
import Size from '../types/size';

function getSelectedSize(sizes: Size[]): Size | undefined {
  return sizes.find(
    ({ mediaQuery }) =>
      mediaQuery === undefined || window.matchMedia(mediaQuery).matches,
  );
}

// The first Size whose media query matches the viewport. It is undefined until
// mounted, because media queries can only be evaluated in the browser.
export default function (sizes: Size[]) {
  const [selectedSize, setSelectedSize] = useState<Size | undefined>();

  // Re-evaluate whenever `sizes` changes and whenever one of its media queries
  // starts or stops matching, so the video and its poster keep up with the
  // native <picture> behaviour. Unlike `resize`, media query `change` events
  // only fire when a breakpoint is crossed, and they also cover zoom, screen
  // rotation and non-width queries (e.g. orientation, resolution).
  useEffect(() => {
    let warned = false;
    const updateSelectedSize = () => {
      const size = getSelectedSize(sizes);
      // Without a match the video has no sources and silently stays empty.
      // Warn once per `sizes` (not on every change), in development only.
      if (process.env.NODE_ENV !== 'production' && !size && !warned) {
        warned = true;
        console.warn(
          '[react-responsive-video] No item of `sizes` matches the current ' +
            'viewport, so the video has no sources. Add a last item without ' +
            'a `mediaQuery` as a fallback. Media queries: ' +
            sizes.map(({ mediaQuery }) => mediaQuery).join(', '),
        );
      }
      setSelectedSize(size);
    };
    updateSelectedSize();
    const mediaQueryLists = Array.from(
      new Set(sizes.map(({ mediaQuery }) => mediaQuery)),
    )
      .filter((mediaQuery): mediaQuery is string => mediaQuery !== undefined)
      .map((mediaQuery) => window.matchMedia(mediaQuery));
    mediaQueryLists.forEach((mediaQueryList) =>
      mediaQueryList.addEventListener('change', updateSelectedSize),
    );
    return () => {
      mediaQueryLists.forEach((mediaQueryList) =>
        mediaQueryList.removeEventListener('change', updateSelectedSize),
      );
    };
  }, [sizes]);

  return selectedSize;
}
