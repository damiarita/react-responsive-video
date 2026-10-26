import { ImgHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from 'react';
import Size from '../types/size';

export type PictureProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;
export type ImageProps = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

// A structural type rather than RefObject: `RefObject<HTMLImageElement | null>`
// (what useRef returns with React 19 types) is rejected by the <img> `ref` of
// React 18 types, while this shape is accepted by both
export type ImgRef = { current: HTMLImageElement | null };

type Props = {
  pictureProps?: PictureProps;
  imgProps?: ImageProps;
  sizes: Size[];
  imgRef: ImgRef;
};

export default function Poster({
  pictureProps,
  imgProps,
  sizes,
  imgRef,
}: Props) {
  return (
    <picture {...pictureProps}>
      {sizes.flatMap(({ height, width, mediaQuery, posterSources }) =>
        posterSources.map(({ url, format }) => (
          <source
            key={`${mediaQuery}-${url}`}
            height={height}
            width={width}
            media={mediaQuery}
            srcSet={url}
            type={format}
          />
        )),
      )}
      <img {...imgProps} ref={imgRef} />
    </picture>
  );
}
