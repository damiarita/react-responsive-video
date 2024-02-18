import React, {useState, useEffect} from 'react';
import {useWindowWidth} from '@react-hook/window-size/throttled'

export default (props) => {
  const [env, setEnv]=useState("ssr");
  const width = useWindowWidth({fps:2, leading:true})
  useEffect(()=>setEnv("client"))
  return (
    <picture {...{"data-env":env, "data-width":width, "data-inner":window.innerWidth, ...props}}/>
  );
}