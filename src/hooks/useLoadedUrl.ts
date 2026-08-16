'use client';

import { useState, useEffect } from 'react';
import Size from '../types/size';
import createPicture from '../utils/createPictureElement';

export default function (sizes: Size[]) {
  const [loadedUrl, setLoadedUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    const setLoadedUrlIfNotCancelled = (url: string) => {
      if (!cancelled) setLoadedUrl(url);
    };
    createPicture(
      sizes,
      setLoadedUrlIfNotCancelled,
      setLoadedUrlIfNotCancelled,
    );
    return () => {
      cancelled = true;
    };
  }, [sizes]);
  return loadedUrl;
}
