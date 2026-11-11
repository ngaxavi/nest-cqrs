import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = resolve(__dirname, '..');

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), 'utf8');
}

function compareVersions(left: [number, number, number], right: [number, number, number]): number {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index];
    }
  }

  return 0;
}

type DockerStage = {
  image: string;
  alias?: string;
  instructions: string[];
};

function parseDockerStages(dockerfile: string): DockerStage[] {
  const stages: DockerStage[] = [];

  for (const rawLine of dockerfile.split(/\r?\n/)) {
    const line = rawLine.trim();
    const from = line.match(/^FROM\s+(?:--platform=\S+\s+)?(\S+)(?:\s+AS\s+(\S+))?$/i);

    if (from) {
      stages.push({
        image: from[1],
        alias: from[2]?.toLowerCase(),
        instructions: [],
      });
      continue;
    }

    if (line && !line.startsWith('#') && stages.length > 0) {
      stages[stages.length - 1].instructions.push(line);
    }
  }

  return stages;
}

function nodeVersion(image: string): [number, number, number] | undefined {
  const match = image.match(/^node:(\d+)\.(\d+)\.(\d+)(?:[.-]|$)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined;
}

function parseComposeServicePorts(compose: string): Record<string, string[]> {
  const portsByService: Record<string, string[]> = {};
  let service: string | undefined;
  let inPorts = false;

  for (const rawLine of compose.split(/\r?\n/)) {
    const serviceMatch = rawLine.match(/^  ([\w-]+):\s*$/);
    if (serviceMatch) {
      service = serviceMatch[1];
      inPorts = false;
      portsByService[service] = [];
      continue;
    }

    if (!service) {
      continue;
    }

    if (/^    ports:\s*$/.test(rawLine)) {
      inPorts = true;
      continue;
    }

    if (/^    \S/.test(rawLine)) {
      inPorts = false;
    }

    if (inPorts) {
      const portMatch = rawLine.match(/^      -\s*["']?([^"']+)["']?\s*$/);
      if (portMatch) {
        portsByService[service].push(portMatch[1]);
      }
    }
  }

  return portsByService;
}

describe('runtime configuration', () => {
  it('requires Node 20.19 or newer', () => {
    const packageJson = JSON.parse(readRepositoryFile('package.json')) as {
      engines?: { node?: string };
    };
    const nodeRange = packageJson.engines?.node;

    expect(nodeRange).toBeDefined();
    expect(nodeRange).toBe('>=20.19.0');
  });

  it('uses matching supported Node images for builder and runtime', () => {
    const stages = parseDockerStages(readRepositoryFile('Dockerfile'));
    const builder = stages.find((stage) => stage.alias === 'builder');
    const runtime = stages.find((stage) => stage.alias === 'runtime');

    expect(stages).toHaveLength(2);
    expect(stages.every((stage) => stage.image.startsWith('node:'))).toBe(true);
    expect(builder).toBeDefined();
    expect(runtime).toBeDefined();

    const versions = stages.map((stage) => nodeVersion(stage.image));
    expect(versions.every((version) => version !== undefined)).toBe(true);
    expect(versions.every((version) => version !== undefined && compareVersions(version, [20, 19, 0]) >= 0)).toBe(true);
    expect(nodeVersion(builder!.image)).toEqual(nodeVersion(runtime!.image));
  });

  it('prunes development dependencies and runs as the node user', () => {
    const stages = parseDockerStages(readRepositoryFile('Dockerfile'));
    const builder = stages.find((stage) => stage.alias === 'builder');
    const runtime = stages.find((stage) => stage.alias === 'runtime');

    expect(builder?.instructions.join('\n')).toMatch(/npm\s+(?:prune\s+--omit=dev|ci\s+--omit=dev)/);
    expect(runtime?.instructions).toContain('USER node');
  });

  it('copies only production artifacts into the runtime stage', () => {
    const stages = parseDockerStages(readRepositoryFile('Dockerfile'));
    const runtime = stages.find((stage) => stage.alias === 'runtime');
    const runtimeCopies = runtime?.instructions.filter((instruction) => instruction.startsWith('COPY ')) ?? [];

    expect(runtimeCopies.length).toBeGreaterThan(0);
    expect(runtimeCopies.every((copy) => copy.includes('--from=builder'))).toBe(true);
    expect(runtimeCopies.map((copy) => copy.match(/\s(\/app\/\S+)\s+\S+$/)?.[1])).toEqual([
      '/app/package*.json',
      '/app/node_modules',
      '/app/dist',
    ]);
  });

  it('binds EventStore and Mongo host ports to loopback only', () => {
    const ports = parseComposeServicePorts(readRepositoryFile('docker-compose.yaml'));

    expect(ports.eventstore).toEqual(['127.0.0.1:1113:1113', '127.0.0.1:2113:2113']);
    expect(ports.db).toEqual(['127.0.0.1:27017:27017']);
  });
});
