import { render, act } from '@testing-library/react';
import ResponsiveVideo from '../src'
import {pictureProps, imgProps, videoProps, sizes} from './data/fullProps'
import {sizes as minimalSizes} from './data/minProps'
import {sizes as invalidSizes} from './data/invalidProps'

let mockWindowWidth=0;
// Mock the useWindowWidth hook
jest.mock('@react-hook/window-size/throttled', () => ({
  useWindowWidth: jest.fn(()=>mockWindowWidth),
}));


let mockOnLoad, mockOnError;
jest.mock('../src/utils/createPictureElement', ()=>(
 function(sizes, handleLoad, handleError){
  mockOnLoad=handleLoad;
  mockOnError=handleError;
 }
));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(function(query){
    const regex = /\(min-width: (\d*)px\)/;
    const match = regex.exec(query);
    const minWidth = parseInt(match[1]);
    return {
      matches: minWidth<=mockWindowWidth
  };}),
});

describe('Component on the browser', () => {

  test('renders with initial window width with full props', () => {
    // Mock initial window width
    mockWindowWidth=1024;

    const { asFragment } = render(<ResponsiveVideo
      pictureProps={pictureProps}
      imgProps={imgProps}
      videoProps={videoProps}
      sizes={sizes}
    />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders with initial window width with minimal props', () => {
    // Mock initial window width
    mockWindowWidth=1024;

    const { asFragment } = render(<ResponsiveVideo
      sizes={minimalSizes}
    />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders with initial window width with invalid props', () => {
    // Mock initial window width
    mockWindowWidth=1024;

    const { asFragment } = render(<ResponsiveVideo
      sizes={invalidSizes}
    />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('updates on window resize with full props', () => {
    // Mock initial window width
    mockWindowWidth=1024;
      const { asFragment, rerender } = render(<ResponsiveVideo
        pictureProps={pictureProps}
        imgProps={imgProps}
        videoProps={videoProps}
        sizes={sizes}
      />);
    expect(asFragment()).toMatchSnapshot();

    //Simulate Image Onload Event
    act(()=>{
      mockOnLoad("https://www.example.com/desktop.webp")
    });
    rerender(<ResponsiveVideo
      pictureProps={pictureProps}
      imgProps={imgProps}
      videoProps={videoProps}
      sizes={sizes}
    />);
    expect(asFragment()).toMatchSnapshot();

    // Simulate a window resize event with error in image
    act(() => {
      mockWindowWidth=768;
      window.dispatchEvent(new Event('resize'));
      mockOnError("https://www.example.com/tablet.webp")
    });
    rerender(<ResponsiveVideo
      pictureProps={pictureProps}
      imgProps={imgProps}
      videoProps={videoProps}
      sizes={sizes}
    />);
    expect(asFragment()).toMatchSnapshot();
  });
});
