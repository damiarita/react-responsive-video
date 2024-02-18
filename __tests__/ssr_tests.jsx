import {create, act} from 'react-test-renderer';
import ResponsiveVideo from '../src'


it('SSR renders correctly', () => {
  const component = create(<ResponsiveVideo/>);
  expect(component.toJSON()).toMatchSnapshot();
});
