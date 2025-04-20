import React, { VideoHTMLAttributes, SyntheticEvent } from 'react';
import Size from '../types/size';

/**
 * The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width'. These are calculated from the sizes property. id, className, autoPlay... are examples of valid
 * @typedef {Object} VideoProps
 */
export type VideoProps = Omit<
  React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  >,
  'poster' | 'heigth' | 'width'
>;

type Props = {
  videoProps?: VideoProps;
  sizes: Size[];
  show: boolean;
  poster?: string;
  onLoadStart: () => void;
};

export default function Video({
  videoProps,
  sizes,
  show,
  poster,
  onLoadStart,
}: Props) {
  const selectedSize = sizes.find(
    ({ mediaQuery }) =>
      mediaQuery === undefined || window.matchMedia(mediaQuery).matches,
  );
  const overRidenVideoProps = Object.assign(
    {},
    videoProps,
    show ? {} : { style: { display: 'none' } },
    {
      onLoadStart: (e: SyntheticEvent<HTMLVideoElement>) => {
        onLoadStart();
        if (videoProps?.onLoad) {
          videoProps.onLoad(e);
        }
      },
    },
  );
  return (
    <video
      {...overRidenVideoProps}
      height={selectedSize?.height}
      width={selectedSize?.width}
      poster={poster}
    >
      {selectedSize?.videoSources.map(({ url, format }) => (
        <source
          key={`${selectedSize.mediaQuery}-${url}`}
          src={url}
          type={format}
        />
      ))}
    </video>
  );
}
