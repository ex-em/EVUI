// Only trusted workflow code runs here; issue text is never evaluated as code.
module.exports = async function manageInactive({
  github,
  context,
  mode,
  now = Date.now(),
}) {
  const repo = context.repo;
  if (mode === 'remove') {
    const issue = context.payload.issue;
    if (
      !issue ||
      issue.pull_request ||
      issue.state !== 'open' ||
      context.actor !== issue.user.login ||
      !issue.labels.some((label) => label.name === 'inactive')
    )
      return;
    await github.rest.issues.removeLabel({
      ...repo,
      issue_number: issue.number,
      name: 'inactive',
    });
    return;
  }
  if (!['check', 'close'].includes(mode))
    throw new Error(`Unknown mode: ${mode}`);

  const issues = await github.paginate(github.rest.issues.listForRepo, {
    ...repo,
    state: 'open',
    per_page: 100,
    ...(mode === 'close' ? { labels: 'inactive' } : {}),
  });
  const cutoff = now - (mode === 'check' ? 10 : 3) * 24 * 60 * 60 * 1000;
  for (const issue of issues) {
    if (issue.pull_request || Date.parse(issue.updated_at) > cutoff) continue;
    const inactive = issue.labels.some((label) => label.name === 'inactive');
    if (mode === 'check' && !inactive) {
      await github.rest.issues.addLabels({
        ...repo,
        issue_number: issue.number,
        labels: ['inactive'],
      });
    } else if (mode === 'close' && inactive) {
      // Recheck activity before closing; list results may be stale.
      const { data: current } = await github.rest.issues.get({
        ...repo,
        issue_number: issue.number,
      });
      if (
        current.state !== 'open' ||
        current.pull_request ||
        Date.parse(current.updated_at) > cutoff ||
        !current.labels.some((label) => label.name === 'inactive')
      )
        continue;
      await github.rest.issues.createComment({
        ...repo,
        issue_number: issue.number,
        body: '오래된 이슈는 닫고 있어요. 필요하다면 다시 열어주세요. :smile:',
      });
      await github.rest.issues.update({
        ...repo,
        issue_number: issue.number,
        state: 'closed',
      });
    }
  }
};
