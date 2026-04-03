/**
 * ResizeObserver 기반 v-resize 디렉티브
 * vue-resize-observer의 object DOM 방식을 ResizeObserver API로 대체
 *
 * @example
 * <div v-resize="onResize">...</div>
 *
 * onResize({ width, height }) { ... }
 */
import type { Directive, DirectiveBinding } from 'vue';

interface ResizeHTMLElement extends HTMLElement {
  __resizeObserver__: ResizeObserver | null;
}

type ResizeHandler = (size: { width: number; height: number }) => void;

const resize: Directive<ResizeHTMLElement, ResizeHandler> = {
  mounted(el: ResizeHTMLElement, binding: DirectiveBinding<ResizeHandler>) {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const handler = binding.value;
    if (typeof handler !== 'function') {
      return;
    }

    // vue-resize-observer 호환: position: static이면 relative로 설정
    if (getComputedStyle(el).position === 'static') {
      el.style.setProperty('position', 'relative', 'important');
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        handler({ width, height });
      }
    });

    resizeObserver.observe(el);
    el.__resizeObserver__ = resizeObserver;
  },
  unmounted(el: ResizeHTMLElement) {
    const resizeObserver = el.__resizeObserver__;
    if (resizeObserver) {
      resizeObserver.disconnect();
      el.__resizeObserver__ = null;
    }
  },
};

export { resize };
export default resize;
