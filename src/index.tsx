import {useWindowWidth} from '@react-hook/window-size/throttled';
import Size from './types/size'
import Poster, {ImageProps, PictureProps} from './poster'
import Video, {VideoProps} from './video'
import useLoadedUrl from './hooks/useLoadedUrl';
import { useState } from 'react';

interface Props{
  videoProps?: VideoProps,
  pictureProps?: PictureProps,
  imgProps?: ImageProps,
  sizes: Size[]
}

export default ({pictureProps, videoProps, imgProps, sizes}:Props) => {
  const width = useWindowWidth({initialWidth:0, fps:2, leading:true});
  const loadedPosterUrl = useLoadedUrl(sizes);
  const [videoIsLoaded, setVideoIsLoaded] = useState(false);
  const posterIsLoaded = loadedPosterUrl!==undefined;
  const somethingIsLoaded = posterIsLoaded || videoIsLoaded;
  return (
    <>
      {!somethingIsLoaded && <Poster pictureProps={pictureProps} imgProps={imgProps} sizes={sizes}/>}
      {width>0 && <Video show={somethingIsLoaded} videoProps={videoProps} sizes={sizes} poster={loadedPosterUrl}/>}
    </>
  );
}