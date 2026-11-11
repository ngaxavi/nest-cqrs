import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const skaffoldConfig = readFileSync(resolve(__dirname, '..', 'skaffold.yaml'), 'utf8');

describe('Skaffold configuration', () => {
  it('keeps build and profiles at the Config root rather than under metadata', () => {
    expect(skaffoldConfig).toMatch(/metadata:\n  name: order-service\nbuild:/);
    expect(skaffoldConfig).toMatch(/^profiles:/m);
  });
});
