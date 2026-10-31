[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / default

# Variable: default

> `const` **default**: `ForwardRefExoticComponent`\<[`ReactResponsiveVideoProps`](../type-aliases/ReactResponsiveVideoProps.md) & `RefAttributes`\<`HTMLVideoElement`\>\>

Defined in: [components/responsiveVideo.tsx:147](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L147)

React Component that will optimize video load. On SSR, it paints a <pucture> element with all the sources for the browser to choose. Once on CSR, the element becomes a <video>. Only the sources that are valid for the device sice are give to the <video>. This allows the usage of different video sources by device without having to download all of them.

Pass a `ref` to get the underlying <video> element (e.g. to call play() or pause()). It is null on the server and until the component has mounted on the client.

## Param

**props**

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

## Returns

A React Component that produces: 1-> On SSR, a <picture> element with all the poster sources for the browser to choose; 2->Once on the client, the same <picture> element with an additional <video> element which has the correct video sources for the device, no poster image and has display:none (its job is to tell the browser to start downloading the video) and 3-> when either the poster image is ready (or failed) or the video has data to show its first frame, only the <video> element which has the correct video sources for the device and the loaded poster image
