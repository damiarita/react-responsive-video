[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / VideoProps

# Type Alias: VideoProps

> **VideoProps** = `Omit`\<`DetailedHTMLProps`\<`VideoHTMLAttributes`\<`HTMLVideoElement`\>, `HTMLVideoElement`\>, `"poster"` \| `"heigth"` \| `"width"`\>

Defined in: [components/video.tsx:14](https://github.com/damiarita/react-responsive-video/blob/master/src/components/video.tsx#L14)

The prop type to the Video element that is created on the client. All the props you could send to a <video> React Component are accepted except for 'poster', 'height' and 'width'. These are calculated from the sizes property. id, className, autoPlay... are examples of valid
