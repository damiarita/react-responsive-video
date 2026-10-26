import { render, act, fireEvent } from '@testing-library/react';
import ResponsiveVideo from '../src';
import { pictureProps, imgProps, videoProps, sizes } from './data/fullProps';
import { sizes as minimalSizes } from './data/minProps';
import { sizes as invalidSizes } from './data/invalidProps';
import React from 'react';

let mockWindowWidth = 0;

// jsdom has no img.decode(). Each call stores how to settle it, which tests
// do to simulate the browser finishing (or failing) to load the poster image.
let mockOnLoad, mockOnError, mockOnSourceSwitch;
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
    // The browser picked another source mid-load: decode() rejects and
    // currentSrc already points to the new source
    mockOnSourceSwitch = (url) => {
      Object.defineProperty(img, 'currentSrc', {
        configurable: true,
        value: url,
      });
      reject(new Error('EncodingError'));
    };
  });
});
Object.defineProperty(HTMLImageElement.prototype, 'decode', {
  configurable: true,
  value: mockDecodeFn,
});

function mockMatches(query) {
  const regex = /\(min-width: (\d*)px\)/;
  const match = regex.exec(query);
  if (match && match?.length >= 2) {
    const minWidth = parseInt(match[1]);
    return minWidth <= mockWindowWidth;
  }
  throw Error(
    'Mocked browser only accepts media queries like /(min-width: (d*)px)/. ' +
      query +
      ' was passed. Either upgrade the mock or change the media query',
  );
}

// Every MediaQueryList handed out, so that setWindowWidth can notify them
let mockMediaQueryLists = [];
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(function (query) {
    mockMatches(query); // Throws early for unsupported queries
    const listeners = new Set();
    const mediaQueryList = {
      media: query,
      get matches() {
        return mockMatches(query);
      },
      addEventListener: (type, listener) => listeners.add(listener),
      removeEventListener: (type, listener) => listeners.delete(listener),
      listeners,
    };
    mockMediaQueryLists.push(mediaQueryList);
    return mediaQueryList;
  }),
});

// Like a browser: changing the viewport width fires `change` only on the
// media query lists whose result flips (no event if no breakpoint is crossed)
function setWindowWidth(width) {
  const matchedBefore = mockMediaQueryLists.map(({ matches }) => matches);
  mockWindowWidth = width;
  mockMediaQueryLists.forEach((mediaQueryList, i) => {
    if (mediaQueryList.matches !== matchedBefore[i]) {
      mediaQueryList.listeners.forEach((listener) =>
        listener(new Event('change')),
      );
    }
  });
}

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

// The "no matching size" development warning is silenced (and asserted on
// where relevant) so that it doesn't clutter the test output.
let warnSpy;
beforeEach(() => {
  warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warnSpy.mockRestore();
});

beforeEach(() => {
  mockMediaQueryLists = [];
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
      setWindowWidth(768);
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

  test('waits for the new poster if the browser switches source mid-load', async () => {
    mockWindowWidth = 1300;
    const { container } = render(<ResponsiveVideo sizes={sizes} />);
    const decodeCallsBefore = mockDecodeFn.mock.calls.length;

    await act(async () => {
      mockOnSourceSwitch('https://www.example.com/tablet.webp');
    });

    // Not treated as a failure: the poster is still shown and awaited again
    expect(container.querySelector('picture')).not.toBeNull();
    expect(mockDecodeFn).toHaveBeenCalledTimes(decodeCallsBefore + 1);

    await act(async () => {
      mockOnLoad('https://www.example.com/tablet.webp');
    });
    expect(container.querySelector('picture')).toBeNull();
    expect(container.querySelector('video')?.getAttribute('poster')).toBe(
      'https://www.example.com/tablet.webp',
    );
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

  test('updates the poster when a breakpoint is crossed after the swap', async () => {
    mockWindowWidth = 1300;
    const { container } = render(<ResponsiveVideo sizes={sizes} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });
    const video = container.querySelector('video');
    expect(video?.getAttribute('poster')).toBe(
      'https://www.example.com/desktop.webp',
    );

    act(() => {
      setWindowWidth(768);
    });

    // The tablet poster is loaded in a detached <picture> holding only the
    // tablet sources, so the browser still picks the format.
    const posterImg = mockDecodeFn.mock.contexts.at(-1);
    expect(posterImg.isConnected).toBe(false);
    expect(
      [...posterImg.parentElement.querySelectorAll('source')].map((source) => [
        source.srcset,
        source.type,
      ]),
    ).toEqual([
      ['https://www.example.com/tablet.avif', 'image/avif'],
      ['https://www.example.com/tablet.webp', 'image/webp'],
      ['https://www.example.com/tablet.jpg', 'image/jpeg'],
    ]);
    // The previous poster stays until the new one is ready
    expect(video?.getAttribute('poster')).toBe(
      'https://www.example.com/desktop.webp',
    );

    await act(async () => {
      mockOnLoad('https://www.example.com/tablet.webp');
    });
    expect(video?.getAttribute('poster')).toBe(
      'https://www.example.com/tablet.webp',
    );
  });

  test('removes the poster if the new size poster fails after a breakpoint change', async () => {
    mockWindowWidth = 1300;
    const { container } = render(<ResponsiveVideo sizes={sizes} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });

    act(() => {
      setWindowWidth(768);
    });
    await act(async () => {
      mockOnError();
    });

    expect(container.querySelector('video')?.hasAttribute('poster')).toBe(
      false,
    );
  });

  test('removes the poster if no size matches after a breakpoint change', async () => {
    mockWindowWidth = 1300;
    // Desktop and tablet only: no fallback size without a media query
    const { container } = render(<ResponsiveVideo sizes={sizes.slice(0, 2)} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });

    act(() => {
      setWindowWidth(500);
    });

    expect(container.querySelector('video')?.hasAttribute('poster')).toBe(
      false,
    );
  });

  test('updates the poster if sizes change after the swap', async () => {
    mockWindowWidth = 1300;
    const { container, rerender } = render(<ResponsiveVideo sizes={sizes} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/desktop.webp');
    });

    rerender(<ResponsiveVideo sizes={minimalSizes} />);
    await act(async () => {
      mockOnLoad('https://www.example.com/mobile.jpg');
    });

    expect(container.querySelector('video')?.getAttribute('poster')).toBe(
      'https://www.example.com/mobile.jpg',
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

  test('gives access to the <video> element through a ref', () => {
    mockWindowWidth = 1300;
    const ref = React.createRef<HTMLVideoElement>();
    const { container } = render(<ResponsiveVideo ref={ref} sizes={sizes} />);

    expect(ref.current).toBe(container.querySelector('video'));
    ref.current?.play();
    expect(mockPlayFn).toHaveBeenCalledTimes(1);

    // The component still controls the element too: it reloads on resize
    mockLoadFn.mockClear();
    act(() => {
      setWindowWidth(768);
    });
    expect(mockLoadFn).toHaveBeenCalledTimes(1);
  });

  test('supports callback refs', () => {
    mockWindowWidth = 1300;
    const callbackRef = jest.fn();
    const { container, unmount } = render(
      <ResponsiveVideo ref={callbackRef} sizes={sizes} />,
    );

    expect(callbackRef).toHaveBeenLastCalledWith(
      container.querySelector('video'),
    );
    unmount();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
  });

  test('warns once in development when no size matches', () => {
    mockWindowWidth = 500;
    // Desktop and tablet only: no fallback size without a media query
    render(<ResponsiveVideo sizes={sizes.slice(0, 2)} />);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain(
      '(min-width: 1200px), (min-width: 768px)',
    );

    // Matching again and then not matching does not warn a second time
    act(() => {
      setWindowWidth(1300);
    });
    act(() => {
      setWindowWidth(500);
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('re-selects only when a media query changes, not on every resize', () => {
    mockWindowWidth = 1300;
    const { container } = render(<ResponsiveVideo sizes={sizes} />);
    const video = container.querySelector('video');
    mockLoadFn.mockClear();

    // A resize that crosses no breakpoint: no change event, nothing to do
    act(() => {
      setWindowWidth(1250);
      window.dispatchEvent(new Event('resize'));
    });
    expect(mockLoadFn).not.toHaveBeenCalled();
    expect(video?.getAttribute('width')).toBe('2000');

    // Crossing (min-width: 1200px) switches to the tablet size
    act(() => {
      setWindowWidth(1000);
    });
    expect(mockLoadFn).toHaveBeenCalledTimes(1);
    expect(video?.getAttribute('width')).toBe('1024');
  });

  test('stops listening to media queries on unmount', () => {
    mockWindowWidth = 1300;
    const { unmount } = render(<ResponsiveVideo sizes={sizes} />);
    expect(
      mockMediaQueryLists.some(({ listeners }) => listeners.size > 0),
    ).toBe(true);

    unmount();

    expect(
      mockMediaQueryLists.every(({ listeners }) => listeners.size === 0),
    ).toBe(true);
  });

  test('does not warn when a size matches', () => {
    mockWindowWidth = 1300;
    render(<ResponsiveVideo sizes={sizes} />);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('does not warn about unmatched sizes in production', () => {
    const nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      mockWindowWidth = 1300;
      render(<ResponsiveVideo sizes={invalidSizes} />);
      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = nodeEnv;
    }
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
