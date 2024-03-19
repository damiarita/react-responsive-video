import {create} from 'react-test-renderer';
import ResponsiveVideo from '../src'
import {pictureProps, imgProps, videoProps, sizes} from './data/fullProps'
import {sizes as minimalSizes} from './data/minProps'
import {sizes as invalidSizes} from './data/invalidProps'

// Mock the useWindowWidth hook
jest.mock('@react-hook/window-size/throttled', () => ({
  useWindowWidth: jest.fn(()=>0),
}));

describe("The behaviour of the component on SSR", ()=>{
  it('SSR renders correctly when all props are sent', () => {
    const component = create(<ResponsiveVideo
      pictureProps={pictureProps}
      imgProps={imgProps}
      videoProps={videoProps}
      sizes={sizes}/>);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('SSR renders correctly when minimum props are sent', () => {
    const component = create(<ResponsiveVideo
    sizes={minimalSizes}
    />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('SSR renders correctly when invalid props are sent', () => {
    const component = create(<ResponsiveVideo
    sizes={invalidSizes}
    />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});