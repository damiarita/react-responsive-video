import React, {VideoHTMLAttributes, ImgHTMLAttributes} from 'react';
import Size from '../../src/types/size'


export const pictureProps:React.HTMLAttributes<HTMLElement>={
    style:{display:"block"}
  };
export const imgProps:ImgHTMLAttributes<HTMLImageElement>={id:"testID"};
export const videoProps:VideoHTMLAttributes<HTMLVideoElement>={style:{width:"auto"}};
export const sizes:Size[]=[
  {
    width:2000,
    height:972,
    mediaQuery:"(min-width: 1200px)",
    videoSources:[
      {
        url:"https://www.example.com/desktop.mp4",
        format: "video/mp4"
      },
      {
        url:"https://www.example.com/desktop.webm",
        format: "video/webm"
      },
    ],
    posterSources:[
      {
        url:"https://www.example.com/desktop.avif",
        format: "image/avif"
      },
      {
        url:"https://www.example.com/desktop.webp",
        format: "image/webp"
      },
      {
        url:"https://www.example.com/desktop.jpg",
        format: "image/jpeg"
      }
    ]},
    {
      width:1024,
      height:1024,
      mediaQuery:"(min-width: 768px)",
      videoSources:[
        {
          url:"https://www.example.com/tablet.mp4",
          format: "video/mp4"
        },
        {
          url:"https://www.example.com/tablet.webm",
          format: "video/webm"
        },
      ],
      posterSources:[
        {
          url:"https://www.example.com/tablet.avif",
          format: "image/avif"
        },
        {
          url:"https://www.example.com/tablet.webp",
          format: "image/webp"
        },
        {
          url:"https://www.example.com/tablet.jpg",
          format: "image/jpeg"
        }
      ]},
      {
        width:600,
        height:900,
        videoSources:[
          {
            url:"https://www.example.com/mobile.mp4",
            format: "video/mp4"
          },
          {
            url:"https://www.example.com/mobile.webm",
            format: "video/webm"
          },],
        posterSources:[
          {
            url:"https://www.example.com/mobile.avif",
            format: "image/avif"
          },
          {
            url:"https://www.example.com/mobile.webp",
            format: "image/webp"
          },
          {
            url:"https://www.example.com/mobile.jpg",
            format: "image/jpeg"
          }
        ]},
];