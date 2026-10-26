'use client';

import { useState, useEffect, RefObject } from 'react';
import Size from '../types/size';

type PosterState = {
  // True once the poster image is ready to be shown or has failed to load
  isSettled: boolean;
  // The source the browser picked, only set if the image loaded successfully
  url?: string;
};

// Watches the poster <img> rendered by <Poster>. decode() is used instead of
// load/error events because it also settles for images that loaded (or failed)
// before hydration, when React was not listening to their events yet.
export default function (
  imgRef: RefObject<HTMLImageElement>,
  sizes: Size[],
): PosterState {
  const [posterState, setPosterState] = useState<PosterState>({
    isSettled: false,
  });
  useEffect(() => {
    const img = imgRef.current;
    if (!img) {
      // The poster was already swapped for the video. The URL we have belongs
      // to the previous `sizes`, so it is dropped rather than shown as poster.
      setPosterState((state) => ({ isSettled: state.isSettled }));
      return;
    }
    let cancelled = false;
    img.decode().then(
      () => {
        if (!cancelled)
          setPosterState({ isSettled: true, url: img.currentSrc });
      },
      () => {
        if (!cancelled) setPosterState({ isSettled: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [imgRef, sizes]);
  return posterState;
}
