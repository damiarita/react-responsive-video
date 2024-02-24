import React, {VideoHTMLAttributes, ImgHTMLAttributes} from 'react';
import {useWindowWidth} from '@react-hook/window-size/throttled';
import Size from './types/size'
import Poster from './poster'
import Video from './video'

interface Props{
  videoProps?: VideoHTMLAttributes<HTMLVideoElement>,
  pictureProps?: React.HTMLAttributes<HTMLElement>,
  imgProps?: ImgHTMLAttributes<HTMLImageElement>,
  sizes: Size[]
}

export default ({pictureProps, videoProps, imgProps, sizes}:Props) => {
  const width = useWindowWidth({initialWidth:0, fps:2, leading:true});
  return (
    <>
      <Poster pictureProps={pictureProps} imgProps={imgProps} sizes={sizes}/>
      {width>0 && <Video show={false} videoProps={videoProps} sizes={sizes} />}
      </>
  );
}