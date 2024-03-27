import Size from '../../src/types/size';

export const sizes: Size[] = [
  {
    mediaQuery: '(min-width: 9999999px)',
    posterSources: [
      {
        url: 'https://www.example.com/mobile.jpg',
        format: 'image/jpeg',
      },
    ],
    videoSources: [
      {
        url: 'https://www.example.com/mobile.webm',
        format: 'video/webm',
      },
    ],
  },
];
