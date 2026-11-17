const { spawnSync } = require('node:child_process');

// npm ships these dependencies inside its tarball. npm overrides cannot replace
// them. Keep the exception tied to the two advisory IDs, exact bundled paths,
// and moderate severity; unrelated packages and future advisories must fail.
const knownBundledAdvisories = new Map([
  [
    'https://github.com/advisories/GHSA-3g3m-2fjr-6pw4',
    {
      name: 'glob',
      node: 'node_modules/npm/node_modules/glob',
    },
  ],
  [
    'https://github.com/advisories/GHSA-g3hv-75wg-m249',
    {
      name: 'minimatch',
      node: 'node_modules/npm/node_modules/minimatch',
    },
  ],
]);

function evaluateAudit(report) {
  if (report.error || !report.metadata || !report.vulnerabilities) {
    throw new Error('npm audit did not return a complete vulnerability report');
  }
  const known = [];
  const unexpected = [];
  for (const [name, entry] of Object.entries(report.vulnerabilities)) {
    for (const advisory of entry.via.filter((via) => typeof via !== 'string')) {
      const exception = knownBundledAdvisories.get(advisory.url);
      const allowed =
        exception &&
        exception.name === name &&
        advisory.severity === 'moderate' &&
        entry.nodes.length > 0 &&
        entry.nodes.every((node) => node === exception.node);
      (allowed ? known : unexpected).push({
        name,
        severity: advisory.severity,
        url: advisory.url,
        nodes: entry.nodes,
      });
    }
  }
  // A malformed or changed npm report must not silently bypass the gate.
  if (Object.keys(report.vulnerabilities).length && !known.length && !unexpected.length) {
    throw new Error('npm audit returned vulnerable packages without advisory details');
  }
  return { known, unexpected };
}

if (require.main === module) {
  const result = spawnSync(
    process.execPath,
    [process.env.npm_execpath || require.resolve('npm/bin/npm-cli.js'), 'audit', '--json'],
    {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  try {
    if (result.error || ![0, 1].includes(result.status)) {
      throw result.error || new Error(result.stderr || `npm audit exited with ${result.status}`);
    }
    const report = JSON.parse(result.stdout);
    const { known, unexpected } = evaluateAudit(report);
    console.log('Full npm audit totals:', report.metadata.vulnerabilities);
    for (const entry of known) console.warn('Unresolved upstream npm bundled advisory:', entry);
    for (const entry of unexpected) console.error('Unexpected dependency advisory:', entry);
    process.exitCode = unexpected.length ? 1 : 0;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { evaluateAudit };
