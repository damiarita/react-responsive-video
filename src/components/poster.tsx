import {ImgHTMLAttributes} from 'react';
import Size from '../types/size'

export interface PictureProps extends React.HTMLAttributes<HTMLElement>{};
export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement>{};

interface Props{
    pictureProps?: PictureProps,
    imgProps?: ImageProps,
    sizes: Size[]
  }

export default({pictureProps, imgProps, sizes}:Props)=>
<picture {...pictureProps}>
{sizes.flatMap(
  ({height, width, mediaQuery, posterSources})=>(posterSources.map(
    ({url, format})=>(<source key={`${mediaQuery}-${url}`} height={height} width={width} media={mediaQuery} srcSet={url} type={format} />))
  )
)}
<img {...imgProps} />
</picture>