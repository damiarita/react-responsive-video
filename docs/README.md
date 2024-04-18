@damiarita/react-responsive-video / [Exports](modules.md)

# React Responsive Video

## Summary

This library provides a React component that will allow you to have different video (and poster images) versions for different device sizes.

The HTML `<video>` tag does not allow you to have different sources for different media queries as `<picture>` does. This component solves this issue with a 2-step process (there is a more detailed description below):

1. In Server Side Rendering (SSR), it paints a `<picture>` element with all your poster image sources.
1. Once on the client, it is replaced with a `<video>` element with the right video sources and the right poster image source

It is important the the `<picture>` and the `<video>` elements have similar styles (i.e: width:100%;height:auto; ) so that replacing one by the other does not change the layout.

## More details

It is very nice to be able to optimize your site performance by providing your browser with multiple URLs for each `<picture>`. The browser selects the best one based on the device size (via media queries) and the supported format. Add this piece of code and the browser will magicaly select the best file for your user

```html
`<picture
  >`
  <source
    width="666"
    height="666"
    srcset="https://example.com/big.avif"
    type="image/avif"
    media="(min-width: 1200px)"
  />
  <source
    width="666"
    height="666"
    srcset="https://example.com/big.webp"
    type="image/webp"
    media="(min-width: 1200px)"
  />
  <source
    width="666"
    height="666"
    srcset="https://example.com/big.jpg"
    media="(min-width: 1200px)"
  />
  <source
    width="200"
    height="300"
    srcset="https://example.com/small.avif"
    type="image/avif"
  />
  <source
    width="200"
    height="300"
    srcset="https://example.com/small.webp"
    type="image/webp"
  />
  <source width="200" height="300" srcset="https://example.com/small.jpg" />
</picture>
```

With the video tag, you cannot add media queries in the `<source>`s. It is not so easy to send different resolutions (different aspect ratios and differnt content alltogehter) to different devices. There are some [reasons](https://github.com/whatwg/html/issues/4544) why this is not natively supported in HTML.

The easy solution is to add one `<video>` element for each device size and hide the invalid ones with CSS. The drawback is that your browser will download one video file for each `<video>` (display:none does not avoid downloading the assets!)

This component provides the best solution. It downloads only one poster image and one video. It does this by being opinionated. It assumes that if the user changes the window width, it is OK to change the video sources accordingly. It assumed that the poster images of each size have the same resolution as the videos of that size. It is also assumed that the `<picture>` and the `<video>` tags that the component renders during the page load have similar styles (i.e: width:100%;height:auto; ).

## How to use it?

### Installation

You need to install this package via your preferred JS package manager. As an example, with NPM:

```bash
npm i @damiarita/react-responsive-video
```

### Usage

You have all the details in the [docs](/damiarita/react-responsive-video/blob/master/docs/modules.md#default).

The most important prop of the component is sizes. It is an array. Each item of the array should have a media query, an array of video sources, an array of poster image sources, a height and a width. The media query must define the devices where the sources are valid. The video sources should be different formats of the same video (mp4, webm...). The poster image sources should be different formats of the same image (ideally the first frame of the video). The height of the width define the resolution of the poster images and videos (which should have the same resolution).

The component will create a `<video>` tag and some temporary `<img>` and `<picture>` tags. You can pass any props (id, className, alt, autoPlay...) to them via videoProps, pictureProps and imgProps.

This is an example of a call to the component

```typescript
import ReactResponsiveVideo from '@damiarita/react-responsive-video';

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
            url: 'https://www.example.com/big.mp4',
            format: 'video/mp4',
          },
          {
            url: 'https://www.example.com/big.webm',
            format: 'video/webm',
          },
        ],
        posterSources: [
          {
            url: 'https://www.example.com/big.avif',
            format: 'image/avif',
          },
          {
            url: 'https://www.example.com/big.webp',
            format: 'image/webp',
          },
          {
            url: 'https://www.example.com/big.jpg',
            format: 'image/jpeg',
          },
        ],
      },
      {
        width: 1024,
        height: 1024,
        videoSources: [
          {
            url: 'https://www.example.com/small.mp4',
            format: 'video/mp4',
          },
          {
            url: 'https://www.example.com/small.webm',
            format: 'video/webm',
          },
        ],
        posterSources: [
          {
            url: 'https://www.example.com/small.avif',
            format: 'image/avif',
          },
          {
            url: 'https://www.example.com/small.webp',
            format: 'image/webp',
          },
          {
            url: 'https://www.example.com/small.jpg',
            format: 'image/jpeg',
          },
        ],
      },
    ]}
/>
```

Make sure that your pictureProps and your videoProps give similar styles via class or style (i.e: width:100%;height:auto; ) so that replacing the `<picture>` by the `<video>` does not change the layout.

## More details of what happens in the browser

There are three different moments during the page load of a page that contains the ReactResponsiveVideo component:

1. Initial page load. If your website uses SSR, the component cannot evaluate the media queries and decide which video source to show to the browser. Therefore it only renders one `<picture>` element with all the `<source>`s
1. Once on the browser, we can select the correct `<video>` <soucrce>s. Therefore, a `<video>` element it is rendered. Initially, it is rendered with display:none alongside the `<picture>` element. This is becasue we still don't know which poster image has been chosen by the browser. Adding the video to the DOM makes sure the browser begins downloading the video file.
1. After the browser has loaded a poster image, the display:none is removed from the `<video>`, the poster property is added to it and the `<picture>` is removed from the DOM. While the video file loads, the user sees the poster image (just like in the previous step). If the video loads first, the same thing happens (we remove display:none and the picture element)

## Contributing

Does this package almost solve your problem? Help me help you! Send a PR and let's discuss it!

## License

This project is distributed under the MIT License. Check the LICENSE file for details!
