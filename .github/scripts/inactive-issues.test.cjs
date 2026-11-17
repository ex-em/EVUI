const { test } = require('node:test');
const assert = require('node:assert/strict');
const manageInactive = require('./inactive-issues.cjs');

const now = Date.parse('2026-11-17T00:00:00Z');
const issue = (overrides = {}) => ({
  number: 1,
  state: 'open',
  user: { login: 'author' },
  updated_at: '2026-11-01T00:00:00Z',
  labels: [],
  ...overrides,
});
function fixture(issues, current = issues[0]) {
  const calls = [];
  const methods = Object.fromEntries(
    ['addLabels', 'removeLabel', 'createComment', 'update'].map((name) => [
      name,
      async (args) => calls.push({ name, args }),
    ])
  );
  const github = {
    paginate: async () => issues,
    rest: {
      issues: {
        ...methods,
        listForRepo() {},
        get: async () => ({ data: current }),
      },
    },
  };
  const context = {
    repo: { owner: 'ex-em', repo: 'EVUI' },
    actor: 'author',
    payload: { issue: issues[0] },
  };
  return { github, context, calls, now };
}

test('labels only inactive issues, skipping PRs, recent activity, and existing labels', async () => {
  const f = fixture([
    issue(),
    issue({ number: 2, pull_request: {} }),
    issue({ number: 3, updated_at: '2026-11-16T00:00:00Z' }),
    issue({ number: 4, labels: [{ name: 'inactive' }] }),
  ]);
  await manageInactive({ ...f, mode: 'check' });
  assert.deepEqual(
    f.calls.map((c) => [c.name, c.args.issue_number]),
    [['addLabels', 1]]
  );
});

test('closes an inactive issue after commenting', async () => {
  const f = fixture([issue({ labels: [{ name: 'inactive' }] })]);
  await manageInactive({ ...f, mode: 'close' });
  assert.deepEqual(
    f.calls.map((c) => c.name),
    ['createComment', 'update']
  );
  assert.equal(f.calls[1].args.state, 'closed');
});

test('does not close an issue with activity since listing', async () => {
  const f = fixture(
    [issue({ labels: [{ name: 'inactive' }] })],
    issue({
      labels: [{ name: 'inactive' }],
      updated_at: '2026-11-16T00:00:00Z',
    })
  );
  await manageInactive({ ...f, mode: 'close' });
  assert.deepEqual(f.calls, []);
});

test('only the issue author can remove the inactive label', async () => {
  const f = fixture([issue({ labels: [{ name: 'inactive' }] })]);
  f.context.actor = 'someone-else';
  await manageInactive({ ...f, mode: 'remove' });
  assert.deepEqual(f.calls, []);
  f.context.actor = 'author';
  await manageInactive({ ...f, mode: 'remove' });
  assert.equal(f.calls[0].name, 'removeLabel');
});

test('PR comments and already unlabelled issues are ignored', async () => {
  for (const i of [
    issue(),
    issue({ pull_request: {}, labels: [{ name: 'inactive' }] }),
  ]) {
    const f = fixture([i]);
    await manageInactive({ ...f, mode: 'remove' });
    assert.deepEqual(f.calls, []);
  }
});
