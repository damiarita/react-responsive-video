import Size from '../types/size'
export default function(sizes:Size[], handleLoad:(url:string)=>void, handleError:(url:string)=>void){
    const p = document.createElement("picture");
    sizes.flatMap(({mediaQuery, posterSources})=>posterSources.map(
      function({url, format}){
          const s = document.createElement("source");
          s.srcset = url;
          if(mediaQuery){
              s.media=mediaQuery;
          }
          if(format){
              s.type=format;
          }
          return s
      }
    )).forEach(source => p.appendChild(source));  
    const i = document.createElement("img");
    i.onload=()=>handleLoad(i.currentSrc);
    i.onerror=()=>handleError(i.currentSrc);
    p.appendChild(i);
    return p
}