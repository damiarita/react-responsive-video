# React Responsive Video

Pass all your video files (different aspect ratios and formats) to this React component: it will choose the best one for each browser and will avoid downloading the rest.

## Summary

This library provides a React component that lets you have different video (and poster image) versions for different device sizes.

The HTML `<video>` tag does not allow you to have different sources for different media queries as `<picture>` does. This component solves this issue with a 2-step process (there is a more detailed description below):

1. During Server Side Rendering (SSR), it paints a `<picture>` element with all your poster image sources.
1. Once on the client, it is replaced with a `<video>` element with the right video sources and the right poster image source.

It is important that the `<picture>` and the `<video>` elements have similar styles (i.e: `width:100%;height:auto;`) so that replacing one by the other does not change the layout.

## More details

It is very nice to be able to optimize your site performance by providing your browser with multiple URLs for each `<picture>`. The browser selects the best one based on the device size (via media queries) and the supported format. Add this piece of code and the browser will magically select the best file for your user:

```html
<picture>
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
  <img
    width="200"
    height="300"
    src="https://example.com/small.jpg"
    alt="Description of the image"
  />
</picture>
```

With the `<video>` tag, you cannot add media queries to the `<source>`s, so it is not easy to send different resolutions (different aspect ratios or even different content altogether) to different devices. There are some [reasons](https://github.com/whatwg/html/issues/4544) why this is not natively supported in HTML.

The easy solution is to add one `<video>` element for each device size and hide the invalid ones with CSS. The drawback is that your browser will download one video file for each `<video>` (`display:none` does not prevent the assets from being downloaded!).

This component provides a better solution: it downloads only one poster image and one video. It does this by being opinionated:

- It assumes that if the user changes the window size, it is OK to change the video sources accordingly (the playback position is kept and, if the video was playing, it keeps playing).
- It assumes that the poster images of each size have the same resolution as the videos of that size.
- It assumes that the `<picture>` and the `<video>` tags that the component renders during the page load have similar styles (i.e: `width:100%;height:auto;`).

## How to use it?

### Installation

Install this package with your preferred JS package manager. As an example, with NPM:

```bash
npm i @damiarita/react-responsive-video
```

React is a peer dependency. The package is compiled with the automatic JSX runtime (`react/jsx-runtime`), so it needs React 16.14 or newer (React 17+ recommended).

The component works with and without SSR. It is marked with `'use client'`, so it can be imported directly from React Server Components (e.g. the Next.js App Router).

### Usage

The most important prop of the component is `sizes`. It is an array. Each item of the array has:

| Field           | Required | Description                                                                                                      |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `videoSources`  | yes      | Different formats of the same video (mp4, webm...): `{ url, format? }`, where `format` is a MIME type.           |
| `posterSources` | yes      | Different formats of the same image (ideally the first frame of the video): `{ url, format? }`.                  |
| `mediaQuery`    | no       | The devices where these sources are valid, e.g. `'(min-width: 1200px)'`. Omit it to match every device.          |
| `width`         | no       | Width, in pixels, of the videos and poster images of this item (both should have the same resolution).           |
| `height`        | no       | Height, in pixels, of the videos and poster images of this item. Together with `width`, it avoids layout shifts. |

**The order of `sizes` matters.** On the client, the first item whose `mediaQuery` matches (or that has no `mediaQuery`) is used. Put the most specific media queries first and make the last item a fallback **without** a `mediaQuery`. Otherwise, some devices may match no item and get no video at all.

The component will create a `<video>` tag and some temporary `<picture>` and `<img>` tags. You can pass any props (`id`, `className`, `alt`, `autoPlay`...) to them via `videoProps`, `pictureProps` and `imgProps`. `poster`, `width` and `height` cannot be passed via `videoProps` because they are derived from `sizes`. Any `children` passed via `videoProps` (for example a `<track>` element for captions/subtitles) are rendered inside the `<video>` alongside its sources. Your own event handlers (e.g. `onLoadStart`) are still called.

Keep in mind that the `<img>` (and its `alt`) is removed once the `<video>` is shown. If the video needs an accessible name, pass it to the video too (e.g. `aria-label` in `videoProps`).

This is an example of how to use the component:

```tsx
import ReactResponsiveVideo, {
  type Size,
} from '@damiarita/react-responsive-video';

// It can also be written inline in the JSX (see the note below)
const sizes: Size[] = [
  {
    width: 2000,
    height: 972,
    mediaQuery: '(min-width: 1200px)',
    videoSources: [
      { url: 'https://www.example.com/big.mp4', format: 'video/mp4' },
      { url: 'https://www.example.com/big.webm', format: 'video/webm' },
    ],
    posterSources: [
      { url: 'https://www.example.com/big.avif', format: 'image/avif' },
      { url: 'https://www.example.com/big.webp', format: 'image/webp' },
      { url: 'https://www.example.com/big.jpg', format: 'image/jpeg' },
    ],
  },
  {
    // Fallback: no mediaQuery, so it matches every other device
    width: 1024,
    height: 1024,
    videoSources: [
      { url: 'https://www.example.com/small.mp4', format: 'video/mp4' },
      { url: 'https://www.example.com/small.webm', format: 'video/webm' },
    ],
    posterSources: [
      { url: 'https://www.example.com/small.avif', format: 'image/avif' },
      { url: 'https://www.example.com/small.webp', format: 'image/webp' },
      { url: 'https://www.example.com/small.jpg', format: 'image/jpeg' },
    ],
  },
];

export default function Hero() {
  return (
    <ReactResponsiveVideo
      videoProps={{
        id: 'my-video',
        className: 'responsive video',
        autoPlay: true,
        controls: true,
        muted: true,
      }}
      pictureProps={{
        id: 'poster-image',
        className: 'responsive picture',
      }}
      imgProps={{
        alt: 'Poster image of the video you are about to see',
      }}
      sizes={sizes}
    />
  );
}
```

Make sure that your `pictureProps` and your `videoProps` give similar styles via class or style (i.e: `width:100%;height:auto;`) so that replacing the `<picture>` by the `<video>` does not change the layout.

> **Writing `sizes` inline is fine.** The component compares the _content_ of `sizes`, not the array reference. Re-rendering the parent with an equal (even if newly created) array does not reload the video. The video is only reloaded when the content of `sizes` actually changes.

All the props and types are documented in the [API docs](https://github.com/damiarita/react-responsive-video/blob/master/docs/functions/default.md). The types (`ReactResponsiveVideoProps`, `Size`, `Source`, `VideoProps`, `PictureProps` and `ImageProps`) are exported from the package.

## More details of what happens in the browser

There are three different moments during the load of a page that contains the ReactResponsiveVideo component:

1. Initial page load. If your website uses SSR, the component cannot evaluate the media queries and decide which video sources to give the browser. Therefore, it only renders one `<picture>` element with all the poster `<source>`s. The browser picks the right poster image natively.
1. Once on the browser, the component can select the correct `<video>` `<source>`s. Therefore, a `<video>` element is rendered. Initially, it is rendered with `display:none` alongside the `<picture>` element. This is because we still don't know which poster image has been chosen by the browser. Adding the video to the DOM makes sure the browser begins downloading the video file (unless you pass `preload: 'none'` in `videoProps`).
1. As soon as the browser has loaded a poster image, `display:none` is removed from the `<video>`, the `poster` attribute is added to it and the `<picture>` is removed from the DOM. While the video file loads, the user sees the poster image (just like in the previous step). If the video starts loading (its `loadstart` event fires) before the poster image is ready, the same swap happens, without the `poster` attribute until the image is loaded.

## Roadmap

These are the planned improvements, roughly in order of priority. Suggestions and PRs are welcome!

- **Smarter swap timing**: swap the `<picture>` for the `<video>` when the video has data to show (instead of when it starts loading), so the poster is not lost during the transition.
- **Poster follows breakpoints**: update the poster image when a resize changes the selected size.
- **Better error handling**: don't set a broken URL as `poster` when a poster image fails to load, warn in development when no item of `sizes` matches the device, and handle autoplay rejections from `video.play()`.
- **Ref forwarding**: access the underlying `<video>` element to control playback (`play()`, `pause()`...).
- **Media query listeners**: react to breakpoint changes with `matchMedia` listeners instead of `resize` events (also covers zoom and orientation changes).
- **Packaging**: ship an ES modules build for tree shaking, test against React 18 and 19, and fix the declared React peer dependency range.

## Contributing

Does this package almost solve your problem? Help me help you! Send a PR and let's discuss it!

To get started: `npm ci`, then `npm test` (lint, formatting and tests) and `npm run build`. [AGENTS.md](https://github.com/damiarita/react-responsive-video/blob/master/AGENTS.md) describes the architecture, conventions and known issues of the codebase.

## Contributors

[Christianjhm](https://github.com/christianjhm) and I developed the idea for this component together.

## License

This project is distributed under the MIT License. Check the LICENSE file for details!
