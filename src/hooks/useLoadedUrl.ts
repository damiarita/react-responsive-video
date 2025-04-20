'use client';

import { useState, useEffect } from 'react';
import Size from '../types/size';
import createPicture from '../utils/createPictureElement';

export default function (sizes: Size[]) {
  const [loadedUrl, setLoadedUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    createPicture(sizes, setLoadedUrl, setLoadedUrl);
  }, [sizes]);
  return loadedUrl;
}
