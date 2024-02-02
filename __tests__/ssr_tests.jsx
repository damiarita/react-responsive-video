import { renderToString } from 'react-dom/server';
import ResponsiveVideo from '../ResponsiveVideo'

describe('Response of the module on SRR', () => {
  test('test empty picture', () => {
    const ssrContent = renderToString(<ResponsiveVideo/>);
    expect(ssrContent).toContain('picture');
  });
});