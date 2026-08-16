/**
 * A single media source (image or video) for a given Size. One or more Sources make up a Size's videoSources/posterSources arrays.
 * @typedef {Object} Source
 * @property {string} url - The URL where the media can be found
 * @property {string} [format] - A MIME-type to be passed to the <source> element as type.
 */
type Source = {
  url: string;
  format?: string;
};

export default Source;
