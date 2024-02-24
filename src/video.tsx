import {VideoHTMLAttributes} from 'react';
import Size from './types/size'

interface Props{
    videoProps?: VideoHTMLAttributes<HTMLVideoElement>,
    sizes: Size[],
    show:boolean,
  }

export default({videoProps, sizes, show}:Props)=>{
    const selectedSize = sizes.find(({mediaQuery})=>mediaQuery===undefined || window.matchMedia(mediaQuery).matches);
    const styles = show?{}:{style:{display:"none"}};
    return(
        <video {...(Object.assign({},videoProps, styles))} height={selectedSize?.height} width={selectedSize?.width}>
            {(selectedSize===undefined || selectedSize.videoSources.length===0)?undefined:selectedSize.videoSources.map(({url, format}, sourceIndex)=>(<source key={`${selectedSize.mediaQuery}-${sourceIndex}`} src={url} type={format} />))}
        </video>
    )
}