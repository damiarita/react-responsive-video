[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / default

# Function: default()

> **default**(`props`): `Element`

Defined in: [components/responsiveVideo.tsx:137](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L137)

React Component that will optimize video load. On SSR, it paints a <pucture> element with all the sources for the browser to choose. Once on CSR, the element becomes a <video>. Only the sources that are valid for the device sice are give to the <video>. This allows the usage of different video sources by device without having to download all of them.

## Parameters

### props

[`ReactResponsiveVideoProps`](../type-aliases/ReactResponsiveVideoProps.md)

## Returns

`Element`

A React Component that produces: 1-> On SSR, a <picture> element with all the poster sources for the browser to choose; 2->Once on the client, the same <picture> element with an additional <video> element which has the correct video sources for the device, no poster image and has display:none (its job is to tell the browser to start downloading the video) and 3-> when either the poster image or the video are loaded, only the <video> element which has the correct video sources for the device and the loaded poster image

## Example

```tsx
<ReactResponsiveVideo
  videoProps={{
      id:"my-video",
      className:"responsive video",
      autoPlay:true,
      controls:true,
      muted:true
  }}
  pictureProps={{
      id:"poster-image",
      className:"responsive picture"
  }}
  imgProps={{
      alt:"Poster image of the video you are about to see"
  }}
  sizes={[
      {
        width: 2000,
        height: 972,
        mediaQuery: '(min-width: 1200px)',
        videoSources: [
          {
            url: 'https://www.example.com/desktop.mp4',
            format: 'video/mp4',
          },
          {
            url: 'https://www.example.com/desktop.webm',
            format: 'video/webm',
          },
        ],
        posterSources: [
          {
            url: 'https://www.example.com/desktop.avif',
            format: 'image/avif',
          },
          {
            url: 'https://www.example.com/desktop.webp',
            format: 'image/webp',
          },
          {
            url: 'https://www.example.com/desktop.jpg',
            format: 'image/jpeg',
          },
        ],
      },
      {
        width: 1024,
        height: 1024,
        mediaQuery: '(min-width: 768px)',
        videoSources: [
          {
            url: 'https://www.example.com/tablet.mp4',
            format: 'video/mp4',
          },
          {
            url: 'https://www.example.com/tablet.webm',
            format: 'video/webm',
          },
        ],
        posterSources: [
          {
            url: 'https://www.example.com/tablet.avif',
            format: 'image/avif',
          },
          {
            url: 'https://www.example.com/tablet.webp',
            format: 'image/webp',
          },
          {
            url: 'https://www.example.com/tablet.jpg',
            format: 'image/jpeg',
          },
        ],
      },
      {
        width: 600,
        height: 900,
        videoSources: [
          {
            url: 'https://www.example.com/mobile.mp4',
            format: 'video/mp4',
          },
          {
            url: 'https://www.example.com/mobile.webm',
            format: 'video/webm',
          },
        ],
        posterSources: [
          {
            url: 'https://www.example.com/mobile.avif',
            format: 'image/avif',
          },
          {
            url: 'https://www.example.com/mobile.webp',
            format: 'image/webp',
          },
          {
            url: 'https://www.example.com/mobile.jpg',
            format: 'image/jpeg',
          },
        ],
      },
    ]}
/>
```
