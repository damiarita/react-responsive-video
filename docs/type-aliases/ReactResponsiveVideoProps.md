[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / ReactResponsiveVideoProps

# Type Alias: ReactResponsiveVideoProps

> **ReactResponsiveVideoProps** = `object`

Defined in: [components/responsiveVideo.tsx:18](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L18)

The prop type to the Responsive Video React Component

## Properties

### imgProps?

> `optional` **imgProps**: [`ImageProps`](ImageProps.md)

Defined in: [components/responsiveVideo.tsx:21](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L21)

The props that will be passed to the the React <img> that is inside the <picture> component before it becomes a <video>

***

### pictureProps?

> `optional` **pictureProps**: [`PictureProps`](PictureProps.md)

Defined in: [components/responsiveVideo.tsx:20](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L20)

The props that will be passed to the the React <picture> component before it becomes a <video>

***

### sizes

> **sizes**: [`Size`](Size.md)[]

Defined in: [components/responsiveVideo.tsx:22](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L22)

An array of Size objects that indicate what posters sources and video sources are available for each media query. The first element with a media query that is valid on the devide (or with an undefined media query) is the used one.

***

### videoProps?

> `optional` **videoProps**: [`VideoProps`](VideoProps.md)

Defined in: [components/responsiveVideo.tsx:19](https://github.com/damiarita/react-responsive-video/blob/master/src/components/responsiveVideo.tsx#L19)

The props that will be passed to the the React <video> component on the client (only 'poster', 'height' and 'width' are not accepted, as that will be derived from the value of 'sizes')
