import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const workflowsDirectory = resolve(__dirname, '..', '.github', 'workflows');

function workflow(name: string): string {
  return readFileSync(resolve(workflowsDirectory, name), 'utf8');
}

describe('GitHub Actions workflow hardening', () => {
  it('pins every GitHub Action to a full commit SHA', () => {
    const workflows = readdirSync(workflowsDirectory).filter((name) => /\.ya?ml$/.test(name));

    for (const file of workflows) {
      for (const line of workflow(file).split(/\r?\n/)) {
        const uses = line.match(/^\s*uses:\s*[^@]+@(.+)\s*$/);
        if (uses) {
          expect(uses[1]).toMatch(/^[a-f0-9]{40}$/);
        }
      }
    }
  });

  it('runs build, test, e2e, and production audit checks for pull requests', () => {
    const ci = workflow('ci.yaml');

    expect(ci).toContain('pull_request:');
    expect(ci).toContain('npm ci');
    expect(ci).toContain('npm run build');
    expect(ci).toContain('npm test -- --runInBand');
    expect(ci).toContain('npm run test:e2e -- --runInBand');
    expect(ci).toContain('npm audit --omit=dev --audit-level=low');
  });

  it('uses a valid production Skaffold profile and least-privilege permissions', () => {
    const image = workflow('build-image.yaml');
    const release = workflow('release.yaml');

    expect(image).toContain('profile: prod');
    expect(image).toContain('packages: write');
    expect(image).toContain('docker/login-action@');
    expect(image).toContain('registry: ghcr.io');
    expect(release).toContain('permissions:');
    expect(release).toContain('contents: write');
    expect(release).toContain('secrets.GH_TOKEN');
  });
});
