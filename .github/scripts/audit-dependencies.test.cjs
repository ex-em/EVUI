const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluateAudit } = require('./audit-dependencies.cjs');
const url = 'https://github.com/advisories/GHSA-g3hv-75wg-m249';
const report = (nodes, advisory = { url, severity: 'moderate' }) => ({
  metadata: {},
  vulnerabilities: {
    minimatch: { nodes, via: [advisory] },
  },
});

test('accepts a clean report', () => {
  assert.deepEqual(evaluateAudit({ metadata: {}, vulnerabilities: {} }), {
    known: [],
    unexpected: [],
  });
});
test('reports the exact upstream npm bundle exception', () => {
  const result = evaluateAudit(report(['node_modules/npm/node_modules/minimatch']));
  assert.equal(result.known.length, 1);
  assert.equal(result.unexpected.length, 0);
});
test('fails the same advisory outside the npm bundle', () => {
  const result = evaluateAudit(report(['node_modules/minimatch']));
  assert.equal(result.unexpected.length, 1);
});
test('fails a new advisory on the same bundled package', () => {
  const result = evaluateAudit(
    report(['node_modules/npm/node_modules/minimatch'], {
      url: 'https://github.com/advisories/GHSA-new',
      severity: 'moderate',
    }),
  );
  assert.equal(result.unexpected.length, 1);
});
test('fails if severity increases', () => {
  const result = evaluateAudit(
    report(['node_modules/npm/node_modules/minimatch'], { url, severity: 'high' }),
  );
  assert.equal(result.unexpected.length, 1);
});
test('fails incomplete reports and unexplained vulnerable package chains', () => {
  assert.throws(() => evaluateAudit({ error: { code: 'ENOTFOUND' } }));
  assert.throws(() =>
    evaluateAudit({ metadata: {}, vulnerabilities: { x: { nodes: [], via: ['x'] } } }),
  );
});
