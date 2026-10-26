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

  // Re-evaluate whenever `sizes` changes and on viewport resize too, so the
  // video and its poster keep up with the native <picture> behaviour. This is
  // a cheap no-op on most resize ticks: `sizes.find` returns the same object
  // reference until the viewport actually crosses a breakpoint, and React
  // bails out of re-rendering when the new state is reference-equal to the
  // old one.
  useEffect(() => {
    const updateSelectedSize = () => {
      setSelectedSize(getSelectedSize(sizes));
    };
    updateSelectedSize();
    window.addEventListener('resize', updateSelectedSize);
    return () => {
      window.removeEventListener('resize', updateSelectedSize);
    };
  }, [sizes]);

  return selectedSize;
}
