'use client';

import { useMemo } from 'react';
import Size from '../types/size';

// Returns the same array reference for as long as the content of `sizes` does
// not change, so that an inline array literal (a new reference on every render
// of the parent) does not re-trigger the effects that reload the video and the
// poster. `Size` is plain data, so JSON is a cheap and complete content key.
export default function (sizes: Size[]) {
  const contentKey = JSON.stringify(sizes);
  return useMemo(() => sizes, [contentKey]);
}
