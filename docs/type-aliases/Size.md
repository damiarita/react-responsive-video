[**@damiarita/react-responsive-video**](../README.md)

***

[@damiarita/react-responsive-video](../globals.md) / Size

# Type Alias: Size

> **Size** = `object`

Defined in: [types/size.ts:12](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L12)

The elements of the array of sizes that are passed to the Responsive Video React Component. Based on the media queries, only one of the element is selected on the client. Sources (both for images and videos) are defined here

## Properties

### height?

> `optional` **height**: `number`

Defined in: [types/size.ts:13](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L13)

The height, in pixels, of the sources included in this element. All the video and images sources included in the Size element should have the same size.

***

### mediaQuery?

> `optional` **mediaQuery**: `string`

Defined in: [types/size.ts:15](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L15)

A string representing a valid media query.

***

### posterSources

> **posterSources**: [`Source`](Source.md)[]

Defined in: [types/size.ts:17](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L17)

An array of valid Source elements with image URLs to be used as posters if this Size object is selected.

***

### videoSources

> **videoSources**: [`Source`](Source.md)[]

Defined in: [types/size.ts:16](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L16)

An array of valid Source elements with video URLs to be used if this Size object is selected.

***

### width?

> `optional` **width**: `number`

Defined in: [types/size.ts:14](https://github.com/damiarita/react-responsive-video/blob/master/src/types/size.ts#L14)

The width, in pixels, of the sources included in this element. All the video and images sources included in the Size element should have the same size.
