'use client';

import { useState, useEffect } from 'react';

export default function () {
  const [isClient, setIsClient] = useState<boolean>(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}
