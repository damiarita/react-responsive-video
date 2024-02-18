import React from 'react';
import {create} from 'react-test-renderer';
import ResponsiveVideo from '../src'


it('SSR renders correctly', () => {
  const component = create(<ResponsiveVideo sizes={[
    {
      width:2000,
      height:972,
      mediaQuery:"(min-width: 1200px)",
      videoSources:[],
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
        videoSources:[],
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
          videoSources:[],
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
  ]}/>);
  expect(component.toJSON()).toMatchSnapshot();
});
