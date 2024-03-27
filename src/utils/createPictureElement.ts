import Size from '../types/size';
export default function (
  sizes: Size[],
  handleLoad: (url: string) => void,
  handleError: (url: string) => void,
) {
  const picture = document.createElement('picture');
  sizes
    .flatMap(({ mediaQuery, posterSources }) =>
      posterSources.map(function ({ url, format }) {
        const source = document.createElement('source');
        source.srcset = url;
        if (mediaQuery) {
          source.media = mediaQuery;
        }
        if (format) {
          source.type = format;
        }
        return source;
      }),
    )
    .forEach((source) => picture.appendChild(source));
  const image = document.createElement('img');
  image.onload = () => handleLoad(image.currentSrc);
  image.onerror = () => handleError(image.currentSrc);
  picture.appendChild(image);
  return picture;
}
