import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const releaseConfig = readFileSync(resolve(__dirname, '..', 'release.config.js'), 'utf8');

describe('semantic-release configuration', () => {
  it('does not attempt to commit release artifacts directly to protected main', () => {
    expect(releaseConfig).not.toMatch(/['"]@semantic-release\/changelog['"]/);
    expect(releaseConfig).not.toMatch(/['"]@semantic-release\/git['"]/);
    expect(releaseConfig).toMatch(/['"]@semantic-release\/github['"]/);
  });
});
