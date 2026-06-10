import { describe, it, expect, afterEach, vi } from 'vitest';

// worker(OffscreenCanvas) 환경 근사: document가 없고 OffscreenCanvas만 있는 상태.
// 모듈이 이미 import된 뒤 global.document를 지우면 top-level 실행이 끝난 뒤라 무효이므로,
// vi.resetModules()로 모듈 캐시를 버린 뒤 document 부재 상태에서 dynamic import한다.
class MockOffscreenCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getContext() {
    return {
      font: '',
      save() {},
      restore() {},
      measureText(text) {
        return { width: text.length * 7 };
      },
    };
  }
}

const importInNonDomContext = async (relativePath) => {
  vi.resetModules();
  vi.stubGlobal('document', undefined);
  // jsdom은 OffscreenCanvas를 제공하지 않으므로 측정 가능한 mock을 주입한다.
  vi.stubGlobal('OffscreenCanvas', MockOffscreenCanvas);
  return import(relativePath);
};

describe('helpers.util — 비-DOM(worker) import/측정 smoke', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('document가 없어도 helpers.util import가 throw하지 않는다', async () => {
    const mod = await importInNonDomContext('./helpers.util');
    expect(mod.default).toBeTruthy();
  });

  it('document가 없을 때 OffscreenCanvas로 calcTextSizeCanvas가 동작한다', async () => {
    const mod = await importInNonDomContext('./helpers.util');
    const size = mod.default.calcTextSizeCanvas('hello', 'normal normal normal 12px Roboto');
    expect(size.width).toBeGreaterThan(2);
    expect(size.height).toBeGreaterThan(2);
  });

  it('document가 없어도 scale.logarithmic import가 throw하지 않는다', async () => {
    const mod = await importInNonDomContext('../scale/scale.logarithmic');
    expect(mod.default).toBeTruthy();
  });
});
