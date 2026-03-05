import { describe, it, expect, vi } from 'vitest';
import { clickoutside } from './clickoutside';

describe('clickoutside directive', () => {
  it('mounted 시 document에 mousedown 이벤트가 등록된다', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    const addSpy = vi.spyOn(document, 'addEventListener');

    clickoutside.mounted(el, { value: handler, modifiers: {} });

    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(el.vueClickOutside).toBeDefined();

    addSpy.mockRestore();
    clickoutside.unmounted(el);
  });

  it('unmounted 시 이벤트 리스너가 제거된다', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    clickoutside.mounted(el, { value: handler, modifiers: {} });
    const boundHandler = el.vueClickOutside;
    clickoutside.unmounted(el);

    expect(removeSpy).toHaveBeenCalledWith('mousedown', boundHandler);
    expect(el.vueClickOutside).toBeNull();

    removeSpy.mockRestore();
  });

  it('외부 클릭 시 핸들러가 호출된다', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    document.body.appendChild(el);

    clickoutside.mounted(el, { value: handler, modifiers: {} });

    // 외부 요소에서 클릭 이벤트 발생
    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);
    const event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: outsideEl });
    el.vueClickOutside(event);

    expect(handler).toHaveBeenCalledWith(event);

    clickoutside.unmounted(el);
    document.body.removeChild(el);
    document.body.removeChild(outsideEl);
  });

  it('자신을 클릭하면 핸들러가 호출되지 않는다', () => {
    const el = document.createElement('div');
    const handler = vi.fn();

    clickoutside.mounted(el, { value: handler, modifiers: {} });

    // 자기 자신을 클릭
    const event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: el });
    el.vueClickOutside(event);

    expect(handler).not.toHaveBeenCalled();

    clickoutside.unmounted(el);
  });

  it('자식 요소를 클릭하면 핸들러가 호출되지 않는다', () => {
    const el = document.createElement('div');
    const child = document.createElement('span');
    el.appendChild(child);
    document.body.appendChild(el);
    const handler = vi.fn();

    clickoutside.mounted(el, { value: handler, modifiers: {} });

    const event = new MouseEvent('mousedown', { bubbles: true });
    Object.defineProperty(event, 'target', { value: child });
    el.vueClickOutside(event);

    expect(handler).not.toHaveBeenCalled();

    clickoutside.unmounted(el);
    document.body.removeChild(el);
  });
});
