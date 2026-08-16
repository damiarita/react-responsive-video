import {
  useRef,
  useEffect,
  useState,
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
  sizes: Size[];
  show: boolean;
  poster?: string;
};

function getSelectedSize(sizes: Size[]): Size | undefined {
  return sizes.find(
    ({ mediaQuery }) =>
      mediaQuery === undefined || window.matchMedia(mediaQuery).matches,
  );
}

export default function Video({ videoProps, sizes, show, poster }: Props) {
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(() =>
    getSelectedSize(sizes),
  );

  // Re-evaluate which size applies whenever the `sizes` prop itself changes.
  useEffect(() => {
    setSelectedSize(getSelectedSize(sizes));
  }, [sizes]);

  // Re-evaluate on viewport resize too, so the video keeps up with the
  // poster's native <picture> behaviour instead of only updating whenever
  // something else happens to re-render this component. This is a cheap
  // no-op on most resize ticks: `sizes.find` returns the same object
  // reference until the viewport actually crosses a breakpoint, and React
  // bails out of re-rendering when the new state is reference-equal to the
  // old one.
  useEffect(() => {
    const handleResize = () => {
      setSelectedSize(getSelectedSize(sizes));
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sizes]);

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
      {userChildren}
    </video>
  );
}
