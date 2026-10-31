[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / VideoProps

# Type Alias: VideoProps

> **VideoProps** = `Omit`\<`DetailedHTMLProps`\<`VideoHTMLAttributes`\<`HTMLVideoElement`\>, `HTMLVideoElement`\>, `"poster"` \| `"height"` \| `"width"` \| `"ref"`\>

Defined in: [components/video.tsx:15](https://github.com/damiarita/react-responsive-video/blob/master/src/components/video.tsx#L15)

The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width', which are calculated from the sizes property, and 'ref', which you pass to the ReactResponsiveVideo component itself. id, className, autoPlay... are examples of valid
