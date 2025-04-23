import { render, act } from '@testing-library/react';
import ResponsiveVideo from '../src';
import { pictureProps, imgProps, videoProps, sizes } from './data/fullProps';
import { sizes as minimalSizes } from './data/minProps';
import { sizes as invalidSizes } from './data/invalidProps';
import React from 'react';

let mockWindowWidth = 0;

let mockOnLoad, mockOnError;
jest.mock(
  '../src/utils/createPictureElement',
  () =>
    function (sizes, handleLoad, handleError) {
      mockOnLoad = handleLoad;
      mockOnError = handleError;
    },
);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(function (query) {
    const regex = /\(min-width: (\d*)px\)/;
    const match = regex.exec(query);
    if (match && match?.length >= 2) {
      const minWidth = parseInt(match[1]);
      return {
        matches: minWidth <= mockWindowWidth,
      };
    }
    throw Error(
      'Mocked browser only accepts media queries like /(min-width: (d*)px)/. ' +
        query +
        ' was passed. Either upgrade the mock or change the media query',
    );
  }),
});

// Setup a proper mock for HTMLVideoElement
const mockLoadFn = jest.fn();
const mockPlayFn = jest.fn().mockImplementation(() => Promise.resolve());
const mockPauseFn = jest.fn();

// Better approach - mock the implementation before React creates the element
beforeAll(() => {
  // Store original properties
  const originalCreateElement = document.createElement;

  // Mock createElement to provide our own video implementation
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName.toLowerCase() === 'video') {
      const mockVideo = originalCreateElement.call(document, tagName);
      // Add our mocked functions
      mockVideo.load = mockLoadFn;
      mockVideo.play = mockPlayFn;
      mockVideo.pause = mockPauseFn;
      return mockVideo;
    }
    // For other elements, use the original implementation
    return originalCreateElement.call(document, tagName);
  });
});

afterAll(() => {
  // Clean up the mock
  jest.restoreAllMocks();
});

beforeEach(() => {
  // Reset mock function counts between tests
  mockLoadFn.mockClear();
  mockPlayFn.mockClear();
  mockPauseFn.mockClear();
});

describe('Component on the browser', () => {
  test('renders with initial window width with full props', () => {
    // Mock initial window width
    mockWindowWidth = 1300;

    const { asFragment } = render(
      <ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders with initial window width with minimal props', () => {
    // Mock initial window width
    mockWindowWidth = 1300;

    const { asFragment } = render(<ResponsiveVideo sizes={minimalSizes} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders with initial window width with invalid props', () => {
    // Mock initial window width
    mockWindowWidth = 1300;

    const { asFragment } = render(<ResponsiveVideo sizes={invalidSizes} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('updates on window resize with full props and calls load', () => {
    // Mock initial window width
    mockWindowWidth = 1300;
    const { asFragment, rerender } = render(
      <ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />,
    );
    expect(asFragment()).toMatchSnapshot();

    //Simulate Image Onload Event
    act(() => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });
    rerender(
      <ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />,
    );
    expect(asFragment()).toMatchSnapshot();

    // Simulate a window resize event with error in image
    act(() => {
      mockWindowWidth = 768;
      window.dispatchEvent(new Event('resize'));
      mockOnError('https://www.example.com/tablet.webp');
    });
    rerender(
      <ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />,
    );
    expect(asFragment()).toMatchSnapshot();

    // Verify that load was called
    expect(mockLoadFn).toHaveBeenCalled();
  });
});
