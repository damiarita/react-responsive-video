import React, {
  ImgHTMLAttributes,
  DetailedHTMLProps,
  HTMLAttributes,
} from 'react';
import Size from '../types/size';

export type PictureProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
>;
export type ImageProps = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

type Props = {
  pictureProps?: PictureProps;
  imgProps?: ImageProps;
  sizes: Size[];
};

export default function Poster({ pictureProps, imgProps, sizes }: Props) {
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
      <img {...imgProps} />
    </picture>
  );
}
