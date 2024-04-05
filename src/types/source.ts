/**
 * The elements of the array of sizes that are passed to the Responsive Video React Component. Based on the media queries, only one of the element is selected on the client. Sources (both for images and videos) are defined here
 * @typedef {Object} Source
 * @property {string} url - The URL where the media can be found
 * @property {string} [format] - A MIME-type to be pased to the <source> element as type. 
 */
type Source = {
    url: string;
    format?: string;
  }

export default Source;