/**
 * teleport selector 문자열로 실제 target element를 해석한다.
 *
 * - selector가 빈 문자열/null/undefined면 'body' 문자열을 그대로 반환한다.
 *   (호출부에서 Teleport를 `:disabled`로 비활성화하는 케이스를 위한 placeholder)
 * - selector가 매칭되는 element를 찾으면 그 element를 반환한다.
 * - selector가 매칭되지 않거나 syntax error로 throw되면 document.body로 fallback하고
 *   console.warn을 남긴다. 같은 (componentName, selector) 조합은 1회만 warn하여
 *   매 open마다 콘솔이 누적 오염되는 것을 막는다.
 *
 * @param {string} selector - "body", ".foo", "#bar" 같은 CSS selector
 * @param {string} [componentName='Component'] - warn 메시지 prefix용 컴포넌트 식별자
 * @returns {string | HTMLElement} 'body' 문자열 또는 실제 element
 */
const warnedSelectors = new Set();

const warnOnce = (key, ...args) => {
  if (warnedSelectors.has(key)) {
    return;
  }
  warnedSelectors.add(key);
  // eslint-disable-next-line no-console
  console.warn(...args);
};

const resolveTeleportTarget = (selector, componentName = 'Component') => {
  if (!selector) {
    return 'body';
  }
  const warnKey = `${componentName}::${selector}`;
  try {
    const found = document.querySelector(selector);
    if (!found) {
      warnOnce(
        warnKey,
        `[${componentName}] teleport selector "${selector}" did not match any element. ` +
          'Falling back to document.body.',
      );
      return document.body;
    }
    return found;
  } catch (e) {
    warnOnce(
      warnKey,
      `[${componentName}] teleport selector "${selector}" is invalid. ` +
        'Falling back to document.body.',
      e,
    );
    return document.body;
  }
};

// test-only: 동일 selector 반복 호출을 검증하는 spec에서 캐시를 비울 수 있게 한다.
const __resetTeleportWarnCache = () => {
  warnedSelectors.clear();
};

export { resolveTeleportTarget, __resetTeleportWarnCache };
export default resolveTeleportTarget;
