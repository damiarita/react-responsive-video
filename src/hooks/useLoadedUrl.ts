'use client';

import { useState, useEffect, RefObject } from 'react';
import Size from '../types/size';
import createPosterImage from '../utils/createPosterImage';

type PosterState = {
  // True once the poster image is ready to be shown or has failed to load
  isSettled: boolean;
  // The source the browser picked, only set if the image loaded successfully
  url?: string;
};

// Finds the poster for the selected size. While <Poster> is on the page, its
// own <img> is watched. decode() is used instead of load/error events because
// it also settles for images that loaded (or failed) before hydration, when
// React was not listening to their events yet. Once <Poster> has been swapped
// for the video, a breakpoint change loads the new size's poster in a detached
// <picture>. The previous poster is kept until the new one is ready.
export default function (
  imgRef: RefObject<HTMLImageElement | null>,
  selectedSize: Size | undefined,
): PosterState {
  const [posterState, setPosterState] = useState<PosterState>({
    isSettled: false,
  });
  useEffect(() => {
    const img =
      imgRef.current ??
      (selectedSize && createPosterImage(selectedSize.posterSources));
    if (!img) {
      // No size matches the viewport: there is no poster to show
      setPosterState((state) => ({ isSettled: state.isSettled }));
      return;
    }
    let cancelled = false;
    const waitForPoster = () => {
      const src = img.currentSrc;
      img.decode().then(
        () => {
          if (!cancelled)
            setPosterState({ isSettled: true, url: img.currentSrc });
        },
        () => {
          if (cancelled) return;
          // decode() also rejects when the browser switches to another source
          // while loading (e.g. a poster breakpoint was crossed). That is not a
          // failure: wait for the new source instead.
          if (img.currentSrc !== src) waitForPoster();
          else setPosterState({ isSettled: true });
        },
      );
    };
    waitForPoster();
    return () => {
      cancelled = true;
    };
  }, [imgRef, selectedSize]);
  return posterState;
}
