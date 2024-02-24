import {ImgHTMLAttributes} from 'react';
import Size from './types/size'

interface Props{
    pictureProps?: React.HTMLAttributes<HTMLElement>,
    imgProps?: ImgHTMLAttributes<HTMLImageElement>,
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