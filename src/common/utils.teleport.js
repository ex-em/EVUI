/**
 * teleport selector 문자열로 실제 target element를 해석한다.
 *
 * - selector가 빈 문자열/null/undefined면 'body' 문자열을 그대로 반환한다.
 *   (호출부에서 Teleport를 `:disabled`로 비활성화하는 케이스를 위한 placeholder)
 * - selector가 매칭되는 element를 찾으면 그 element를 반환한다.
 * - selector가 매칭되지 않거나 syntax error로 throw되면 document.body로 fallback하고
 *   console.warn을 남긴다.
 *
 * @param {string} selector - "body", ".foo", "#bar" 같은 CSS selector
 * @param {string} [componentName='Component'] - warn 메시지 prefix용 컴포넌트 식별자
 * @returns {string | HTMLElement} 'body' 문자열 또는 실제 element
 */
const resolveTeleportTarget = (selector, componentName = 'Component') => {
  if (!selector) {
    return 'body';
  }
  try {
    const found = document.querySelector(selector);
    if (!found) {
      // eslint-disable-next-line no-console
      console.warn(
        `[${componentName}] teleport selector "${selector}" did not match any element. ` +
          'Falling back to document.body.',
      );
      return document.body;
    }
    return found;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      `[${componentName}] teleport selector "${selector}" is invalid. ` +
        'Falling back to document.body.',
      e,
    );
    return document.body;
  }
};

export { resolveTeleportTarget };
export default resolveTeleportTarget;
