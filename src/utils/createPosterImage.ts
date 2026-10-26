import Source from '../types/source';

// Builds a detached <picture> with the given poster sources and returns its
// <img>. The browser picks the first format it supports and starts loading it,
// as it does for the <picture> on the page.
export default function (posterSources: Source[]) {
  const picture = document.createElement('picture');
  posterSources.forEach(({ url, format }) => {
    const source = document.createElement('source');
    source.srcset = url;
    if (format) {
      source.type = format;
    }
    picture.appendChild(source);
  });
  const image = document.createElement('img');
  picture.appendChild(image);
  return image;
}
