import React, {VideoHTMLAttributes, ImgHTMLAttributes} from 'react';

interface Source{
  url: string, 
  format: string
}

interface Size{
  height?: number,
  width?: number,
  mediaQuery?: string,
  videoSources:Source[],
  posterSources:Source[]
}

interface Props{
  videoProps?: VideoHTMLAttributes<HTMLVideoElement>,
  pictureProps?: React.HTMLAttributes<HTMLElement>,
  imgPorps?: ImgHTMLAttributes<HTMLImageElement>,
  sizes: Size[]
}

export default ({pictureProps, sizes}:Props) => {
  return (
    <picture {...pictureProps}>
      {sizes.flatMap(
        ({height, width, mediaQuery, posterSources}, sizeIndex)=>(posterSources.map(
          ({url, format}, sourceIndex)=>(<source key={sizeIndex.toString()+"-"+sourceIndex.toString()} height={height} width={width} media={mediaQuery} srcSet={url} type={format} />))
        )
      )}
    </picture>
  );
}