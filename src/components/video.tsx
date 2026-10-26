import {
  useRef,
  useEffect,
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
  'poster' | 'height' | 'width'
>;

type Props = {
  videoProps?: VideoProps;
  size: Size | undefined;
  show: boolean;
  poster?: string;
};

export default function Video({ videoProps, size, show, poster }: Props) {
  const { children: userChildren, ...restVideoProps } = videoProps ?? {};

  const overRidenVideoProps = Object.assign(
    {},
    restVideoProps,
    show ? {} : { style: { display: 'none' } },
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const currentTime = videoRef?.current?.currentTime;
    const wasPlaying = !videoRef?.current?.paused;

    videoRef?.current?.load();

    // After loading, restore the time position
    if (currentTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
    // If the video was playing, resume playback
    if (wasPlaying) videoRef?.current?.play();
  }, [size]);

  return (
    <video
      {...overRidenVideoProps}
      height={size?.height}
      width={size?.width}
      poster={poster}
      ref={videoRef}
    >
      {size?.videoSources.map(({ url, format }) => (
        <source key={`${size.mediaQuery}-${url}`} src={url} type={format} />
      ))}
      {userChildren}
    </video>
  );
}
