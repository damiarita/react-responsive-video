import {VideoHTMLAttributes, SyntheticEvent} from 'react';
import Size from './types/size'

export interface VideoProps extends Exclude<VideoHTMLAttributes<HTMLVideoElement>, 'poster'>{}

interface Props{
    videoProps?: VideoProps,
    sizes: Size[],
    show:boolean,
    poster?:string,
    onLoad: ()=>void,
  }

export default({videoProps, sizes, show, poster, onLoad}:Props)=>{
    const selectedSize = sizes.find(({mediaQuery})=>mediaQuery===undefined || window.matchMedia(mediaQuery).matches);
    const overRidenVideoProps = Object.assign(
        {},
        videoProps,
        show?{}:{style:{display:"none"}},
        {onLoad:(e:SyntheticEvent<HTMLVideoElement>)=>{onLoad(); if(videoProps?.onLoad) {videoProps.onLoad(e);}} }
    );
    return(
        <video {...overRidenVideoProps} height={selectedSize?.height} width={selectedSize?.width} poster={poster} onLoad={onLoad}>
            {selectedSize?.videoSources.map(({url, format})=>(<source key={`${selectedSize.mediaQuery}-${url}`} src={url} type={format} />))}
        </video>
    )
}