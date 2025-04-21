import {
  useRef,
  useEffect,
  SyntheticEvent,
  DetailedHTMLProps,
  VideoHTMLAttributes,
} from 'react';
import Size from '../types/size';

/**
 * The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width'. These are calculated from the sizes property. id, className, autoPlay... are examples of valid
 * @typedef {Object} VideoProps
 */
export type VideoProps = Omit<
  DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>,
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentTime = videoRef?.current?.currentTime;
    const wasPlaying = !videoRef?.current?.paused;

    videoRef?.current?.load();

    // After loading, restore the time position
    if (currentTime) videoRef.current.currentTime = currentTime;
    // If the video was playing, resume playback
    if (wasPlaying) videoRef?.current?.play();
  }, [selectedSize]);

  return (
    <video
      {...overRidenVideoProps}
      height={selectedSize?.height}
      width={selectedSize?.width}
      poster={poster}
      ref={videoRef}
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
