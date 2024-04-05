import Source from './source';

/**
 * The elements of the array of sizes that are passed to the Responsive Video React Component. Based on the media queries, only one of the element is selected on the client. Sources (both for images and videos) are defined here
 * @typedef {Object} Size
 * @property {number} [height] - The height, in pixels, of the sources included in this element. All the video and images sources included in the Size element should have the same size.
 * @property {number} [width] - The width, in pixels, of the sources included in this element. All the video and images sources included in the Size element should have the same size.
 * @property {string} [mediaQuery] - A string representing a valid media query.
 * @property {Source[]} videoSources - An array of valid Source elements with video URLs to be used if this Size object is selected.
 * @property {Source[]} posterSources - An array of valid Source elements with image URLs to be used as posters if this Size object is selected.
 */
type Size = {
  height?: number;
  width?: number;
  mediaQuery?: string;
  videoSources: Source[];
  posterSources: Source[];
};

export default Size;
