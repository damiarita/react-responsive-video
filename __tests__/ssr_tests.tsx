/**
 * @jest-environment node
 */
import ResponsiveVideo from '../src';
import { pictureProps, imgProps, videoProps, sizes } from './data/fullProps';
import { sizes as minimalSizes } from './data/minProps';
import { sizes as invalidSizes } from './data/invalidProps';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('The behaviour of the component on SSR', () => {
  it('SSR renders correctly when all props are sent', () => {
    const component = renderToStaticMarkup(
      <ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />,
    );
    expect(component).toMatchSnapshot();
  });

  it('SSR renders correctly when minimum props are sent', () => {
    const component = renderToStaticMarkup(
      <ResponsiveVideo sizes={minimalSizes} />,
    );
    expect(component).toMatchSnapshot();
  });

  it('SSR accepts a ref, which stays null (there is no <video> yet)', () => {
    const ref = React.createRef<HTMLVideoElement>();
    renderToStaticMarkup(<ResponsiveVideo ref={ref} sizes={minimalSizes} />);
    expect(ref.current).toBeNull();
  });

  it('SSR renders correctly when invalid props are sent', () => {
    const component = renderToStaticMarkup(
      <ResponsiveVideo sizes={invalidSizes} />,
    );
    expect(component).toMatchSnapshot();
  });
});
