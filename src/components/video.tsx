import {
  useRef,
  useEffect,
  useCallback,
  DetailedHTMLProps,
  ForwardedRef,
  VideoHTMLAttributes,
} from 'react';
import Size from '../types/size';

/**
 * The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width', which are calculated from the sizes property, and 'ref', which you pass to the ReactResponsiveVideo component itself. id, className, autoPlay... are examples of valid
 * @typedef {Object} VideoProps
 */
export type VideoProps = Omit<
  DetailedHTMLProps<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>,
  'poster' | 'height' | 'width' | 'ref'
>;

type Props = {
  videoProps?: VideoProps;
  size: Size | undefined;
  show: boolean;
  poster?: string;
  forwardedRef?: ForwardedRef<HTMLVideoElement>;
};

export default function Video({
  videoProps,
  size,
  show,
  poster,
  forwardedRef,
}: Props) {
  const { children: userChildren, ...restVideoProps } = videoProps ?? {};

  const overRidenVideoProps = Object.assign(
    {},
    restVideoProps,
    show ? {} : { style: { display: 'none' } },
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // The element is needed here (to reload on size changes) and by the user,
  // through the ref given to <ReactResponsiveVideo>
  const setVideoRef = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      if (typeof forwardedRef === 'function') forwardedRef(video);
      else if (forwardedRef) forwardedRef.current = video;
    },
    [forwardedRef],
  );

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
      ref={setVideoRef}
    >
      {size?.videoSources.map(({ url, format }) => (
        <source key={`${size.mediaQuery}-${url}`} src={url} type={format} />
      ))}
      {userChildren}
    </video>
  );
}
