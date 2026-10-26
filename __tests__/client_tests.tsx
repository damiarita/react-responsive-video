import { render, act, fireEvent } from '@testing-library/react';
import ResponsiveVideo from '../src';
import { pictureProps, imgProps, videoProps, sizes } from './data/fullProps';
import { sizes as minimalSizes } from './data/minProps';
import { sizes as invalidSizes } from './data/invalidProps';
import React from 'react';

let mockWindowWidth = 0;

// jsdom has no img.decode(). Each call stores how to settle it, which tests
// do to simulate the browser finishing (or failing) to load the poster image.
let mockOnLoad, mockOnError;
const mockDecodeFn = jest.fn(function () {
  const img = this;
  return new Promise((resolve, reject) => {
    mockOnLoad = (url) => {
      Object.defineProperty(img, 'currentSrc', {
        configurable: true,
        value: url,
      });
      resolve();
    };
    mockOnError = () => reject(new Error('EncodingError'));
  });
});
Object.defineProperty(HTMLImageElement.prototype, 'decode', {
  configurable: true,
  value: mockDecodeFn,
});

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

  test('updates on window resize with full props and calls load', async () => {
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
    await act(async () => {
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

    // Simulate a window resize event
    act(() => {
      mockWindowWidth = 768;
      window.dispatchEvent(new Event('resize'));
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

  test('shows the video when it has data, forwarding the user onLoadedData handler', () => {
    mockWindowWidth = 1300;
    const handleLoadedData = jest.fn();

    const { container } = render(
      <ResponsiveVideo
        sizes={minimalSizes}
        videoProps={{ onLoadedData: handleLoadedData }}
      />,
    );

    const video = container.querySelector('video');
    // loadstart alone (the download just began) must not swap the poster out
    act(() => {
      fireEvent(video, new Event('loadstart'));
    });
    expect(container.querySelector('picture')).not.toBeNull();

    act(() => {
      fireEvent(video, new Event('loadeddata'));
    });

    expect(handleLoadedData).toHaveBeenCalledTimes(1);
    expect(container.querySelector('picture')).toBeNull();
    expect(video?.style.display).toBe('');
  });

  test('shows the video without a poster if the poster image fails', async () => {
    mockWindowWidth = 1300;
    const { container } = render(<ResponsiveVideo sizes={minimalSizes} />);

    await act(async () => {
      mockOnError();
    });

    expect(container.querySelector('picture')).toBeNull();
    const video = container.querySelector('video');
    expect(video?.style.display).toBe('');
    expect(video?.hasAttribute('poster')).toBe(false);
  });

  test('drops the poster if sizes change after the swap', async () => {
    mockWindowWidth = 1300;
    const { container, rerender } = render(<ResponsiveVideo sizes={sizes} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });
    expect(container.querySelector('video')?.getAttribute('poster')).toBe(
      'https://www.example.com/desktop.webp',
    );

    rerender(<ResponsiveVideo sizes={minimalSizes} />);

    expect(container.querySelector('video')?.hasAttribute('poster')).toBe(
      false,
    );
  });

  test('renders children passed via videoProps, e.g. a captions track', () => {
    mockWindowWidth = 1300;

    const { container } = render(
      <ResponsiveVideo
        sizes={minimalSizes}
        videoProps={{
          children: (
            <track
              kind="captions"
              src="https://www.example.com/captions.vtt"
              srcLang="en"
              label="English"
            />
          ),
        }}
      />,
    );

    const track = container.querySelector('track');
    expect(track).not.toBeNull();
    expect(track?.getAttribute('src')).toBe(
      'https://www.example.com/captions.vtt',
    );
  });

  test('does not reload when re-rendered with an equal but new sizes array', () => {
    mockWindowWidth = 1300;
    // Simulates `sizes` written inline in JSX: new objects, same content.
    const inlineSizes = () => JSON.parse(JSON.stringify(sizes));
    const { rerender } = render(<ResponsiveVideo sizes={inlineSizes()} />);
    const loadCallsAfterMount = mockLoadFn.mock.calls.length;
    const decodeCallsAfterMount = mockDecodeFn.mock.calls.length;

    rerender(<ResponsiveVideo sizes={inlineSizes()} />);
    rerender(<ResponsiveVideo sizes={inlineSizes()} />);

    expect(mockLoadFn).toHaveBeenCalledTimes(loadCallsAfterMount);
    // The poster is not re-checked either.
    expect(mockDecodeFn).toHaveBeenCalledTimes(decodeCallsAfterMount);
  });

  test('ignores a stale poster result if sizes change before it resolves', async () => {
    mockWindowWidth = 1300;
    const { container, rerender } = render(<ResponsiveVideo sizes={sizes} />);
    const staleOnLoad = mockOnLoad;

    // `sizes` changes reference before the first (stale) load resolves.
    rerender(<ResponsiveVideo sizes={[...minimalSizes]} />);

    await act(async () => {
      staleOnLoad('https://www.example.com/stale.jpg');
    });
    expect(container.querySelector('picture')).not.toBeNull();

    await act(async () => {
      mockOnLoad('https://www.example.com/mobile.jpg');
    });
    expect(container.querySelector('video')?.getAttribute('poster')).toBe(
      'https://www.example.com/mobile.jpg',
    );
  });
});
