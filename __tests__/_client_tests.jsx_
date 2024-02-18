import React from 'react';
import { render, act } from '@testing-library/react';
import useWindowWidth from '@react-hook/window-size/throttled';
import ResponsiveVideo from '../src'

let mockWindowWidth=0;
// Mock the useWindowWidth hook
jest.mock('@react-hook/window-size/throttled', () => ({
  useWindowWidth: jest.fn(()=>mockWindowWidth),
}));


describe('YourComponent', () => {

  test('renders with initial window width', () => {
    // Mock initial window width
    mockWindowWidth=1024;

    const { getByTestId } = render(<ResponsiveVideo data-testid="my-component"/>);
    expect(getByTestId("my-component")).toMatchSnapshot();
  });

  test('updates on window resize', () => {
    // Mock initial window width
    mockWindowWidth=1024;
    const { getByTestId, rerender } = render(<ResponsiveVideo data-testid="my-component"/>);
    expect(getByTestId("my-component")).toMatchSnapshot();

    // Simulate a window resize event
    act(() => {
      mockWindowWidth=768;
      window.dispatchEvent(new Event('resize'));
    });
    rerender(<ResponsiveVideo data-testid="my-component"/>)
    expect(getByTestId("my-component")).toMatchSnapshot();
  });
});
