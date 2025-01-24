'use client';

import { useState } from 'react';
import Size from '../types/size';
import createPicture from '../utils/createPictureElement';

export default function (sizes: Size[]) {
  const [loadedUrl, setLoadedUrl] = useState<string | undefined>(undefined);

  if (document) {
    createPicture(sizes, setLoadedUrl, setLoadedUrl);
  }
  return loadedUrl;
}
