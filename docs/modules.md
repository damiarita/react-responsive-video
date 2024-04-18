[@damiarita/react-responsive-video](README.md) / Exports

# @damiarita/react-responsive-video

## Table of contents

### Type Aliases

- [ImageProps](modules.md#imageprops)
- [PictureProps](modules.md#pictureprops)
- [ReactResponsiveVideoProps](modules.md#reactresponsivevideoprops)
- [Size](modules.md#size)
- [Source](modules.md#source)
- [VideoProps](modules.md#videoprops)

### Functions

- [default](modules.md#default)

## Type Aliases

### ImageProps

Ƭ **ImageProps**: `ImgHTMLAttributes`\<`HTMLImageElement`\>

#### Defined in

[components/poster.tsx:5](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/components/poster.tsx#L5)

___

### PictureProps

Ƭ **PictureProps**: `React.HTMLAttributes`\<`HTMLElement`\>

#### Defined in

[components/poster.tsx:4](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/components/poster.tsx#L4)

___

### ReactResponsiveVideoProps

Ƭ **ReactResponsiveVideoProps**: `Object`

The prop type to the Responsive Video React Component

#### Type declaration

| Name | Type |
| :------ | :------ |
| `imgProps?` | [`ImageProps`](modules.md#imageprops) |
| `pictureProps?` | [`PictureProps`](modules.md#pictureprops) |
| `sizes` | [`Size`](modules.md#size)[] |
| `videoProps?` | [`VideoProps`](modules.md#videoprops) |

#### Defined in

[components/responsiveVideo.tsx:16](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/components/responsiveVideo.tsx#L16)

___

### Size

Ƭ **Size**: `Object`

The elements of the array of sizes that are passed to the Responsive Video React Component. Based on the media queries, only one of the element is selected on the client. Sources (both for images and videos) are defined here

#### Type declaration

| Name | Type |
| :------ | :------ |
| `height?` | `number` |
| `mediaQuery?` | `string` |
| `posterSources` | [`Source`](modules.md#source)[] |
| `videoSources` | [`Source`](modules.md#source)[] |
| `width?` | `number` |

#### Defined in

[types/size.ts:12](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/types/size.ts#L12)

___

### Source

Ƭ **Source**: `Object`

The elements of the array of sizes that are passed to the Responsive Video React Component. Based on the media queries, only one of the element is selected on the client. Sources (both for images and videos) are defined here

#### Type declaration

| Name | Type |
| :------ | :------ |
| `format?` | `string` |
| `url` | `string` |

#### Defined in

[types/source.ts:7](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/types/source.ts#L7)

___

### VideoProps

Ƭ **VideoProps**: `Omit`\<`VideoHTMLAttributes`\<`HTMLVideoElement`\>, ``"poster"`` \| ``"heigth"`` \| ``"width"``\>

The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width'. These are calculated from the sizes property. id, className, autoPlay... are examples of valid

#### Defined in

[components/video.tsx:8](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/components/video.tsx#L8)

## Functions

### default

▸ **default**(`props`): `Element`

React Component that will optimize video load. On SSR, it paints a <pucture> element with all the sources for the browser to choose. Once on CSR, the element becomes a <video>. Only the sources that are valid for the device sice are give to the <video>. This allows the usage of different video sources by device without having to download all of them.

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ReactResponsiveVideoProps`](modules.md#reactresponsivevideoprops) |

#### Returns

`Element`

A React Component that produces: 1-> On SSR, a <picture> element with all the poster sources for the browser to choose; 2->Once on the client, the same <picture> element with an additional <video> element which has the correct video sources for the device, no poster image and has display:none (its job is to tell the browser to start downloading the video) and 3-> when either the poster image or the video are loaded, only the <video> element which has the correct video sources for the device and the loaded poster image

**`Example`**

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

#### Defined in

[components/responsiveVideo.tsx:135](https://github.com/damiarita/react-responsive-video/blob/bfcdadd/src/components/responsiveVideo.tsx#L135)
