interface Source {
  url: string;
  format?: string;
}
export default interface Size {
  height?: number;
  width?: number;
  mediaQuery?: string;
  videoSources: Source[];
  posterSources: Source[];
}
