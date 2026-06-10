import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RENDER_WORKER_STATE,
  WorkerRenderGate,
  detectWorkerRenderSupport,
  canSerializeSnapshot,
  isWorkerRenderEnabled,
  setWorkerRenderEnabled,
} from './render.worker.gate';

/**
 * Step 7: layer-arch-and-killswitch — worker 게이트(kill switch · feature-detect · ready 상태기계 · fallback).
 *
 * 이 step 은 실제 worker 렌더를 연결하지 않으므로, 여기선 **경로 결정(worker vs main)** 과
 * **async ready 상태기계(initializing→ready→failed)** 만 검증한다. 기존 렌더 golden 회귀는 test:visual 담당.
 */

/** start() 가 만드는 핸드셰이크를 main 없이 구동하기 위한 fake worker. */
const makeFakeWorker = () => ({
  onmessage: null,
  onerror: null,
  postMessage: vi.fn(),
  terminate: vi.fn(),
});

describe('detectWorkerRenderSupport (feature-detect)', () => {
  it('jsdom(OffscreenCanvas 부재)에서는 false', () => {
    // jsdom 은 OffscreenCanvas 를 제공하지 않으므로 미지원으로 판정된다(SSR 도 Worker 부재로 동일).
    expect(detectWorkerRenderSupport()).toBe(false);
  });
});

describe('kill switch (내부 플래그)', () => {
  afterEach(() => setWorkerRenderEnabled(false));

  it('기본은 on (플래그 없이 항상 활성)', () => {
    expect(isWorkerRenderEnabled()).toBe(true);
  });

  it('deterministic 내부 enable 경로로 켜고 끌 수 있다', () => {
    setWorkerRenderEnabled(true);
    expect(isWorkerRenderEnabled()).toBe(true);
    setWorkerRenderEnabled(false);
    expect(isWorkerRenderEnabled()).toBe(false);
  });
});

describe('canSerializeSnapshot', () => {
  it('plain object 는 직렬화 가능', () => {
    expect(canSerializeSnapshot({ a: 1, b: [1, 2], c: { d: 'x' } })).toBe(true);
  });

  it('function 을 포함하면 직렬화 불가', () => {
    expect(canSerializeSnapshot({ fn: () => {} })).toBe(false);
  });
});

describe('WorkerRenderGate — fallback 결정 (worker vs main)', () => {
  it('kill switch off → worker 미생성, main 경로(IDLE) + onFallback', () => {
    const onFallback = vi.fn();
    const createWorker = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => false,
      isSupported: () => true,
      createWorker,
      hooks: { onFallback },
    });

    expect(gate.start()).toBe(RENDER_WORKER_STATE.IDLE);
    expect(createWorker).not.toHaveBeenCalled();
    expect(onFallback).toHaveBeenCalledWith('kill-switch-off');
    expect(gate.shouldRenderOnWorker({})).toBe(false);
  });

  it('feature-detect off → worker 미생성, main 경로(IDLE) + onFallback', () => {
    const onFallback = vi.fn();
    const createWorker = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => false,
      createWorker,
      hooks: { onFallback },
    });

    expect(gate.start()).toBe(RENDER_WORKER_STATE.IDLE);
    expect(createWorker).not.toHaveBeenCalled();
    expect(onFallback).toHaveBeenCalledWith('unsupported');
  });

  it('worker 생성 실패(worker-URL smoke 깨짐) → FAILED + onInitFailure + onFallback', () => {
    const onInitFailure = vi.fn();
    const onFallback = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: () => null,
      hooks: { onInitFailure, onFallback },
    });

    expect(gate.start()).toBe(RENDER_WORKER_STATE.FAILED);
    expect(onInitFailure).toHaveBeenCalledWith('worker-create-failed');
    expect(onFallback).toHaveBeenCalledWith('worker-create-failed');
    expect(gate.shouldRenderOnWorker({})).toBe(false);
  });

  it('직렬화 불가 스냅샷이면 ready 여도 main(worker 미선택)', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready' } });

    expect(gate.isReady()).toBe(true);
    expect(gate.shouldRenderOnWorker({ a: 1 })).toBe(true);
    expect(gate.shouldRenderOnWorker({ fn: () => {} })).toBe(false);
  });
});

describe('WorkerRenderGate — async ready 상태기계', () => {
  it('initializing 동안에는 main 렌더(worker 미선택)', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });

    expect(gate.start()).toBe(RENDER_WORKER_STATE.INITIALIZING);
    expect(gate.worker.postMessage).toHaveBeenCalledWith({ type: 'init', version: expect.any(Number) });
    expect(gate.isReady()).toBe(false);
    expect(gate.shouldRenderOnWorker({ a: 1 })).toBe(false);
  });

  it('ready 메시지 수신 → READY 로 전이, worker 선택 가능', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready' } });

    expect(gate.state).toBe(RENDER_WORKER_STATE.READY);
    expect(gate.isReady()).toBe(true);
  });

  it('worker onerror → FAILED, main fallback', () => {
    const onFallback = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      hooks: { onFallback },
    });
    gate.start();
    const { worker } = gate;
    worker.onerror(new Error('boom'));

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    expect(worker.terminate).toHaveBeenCalled();
    expect(onFallback).toHaveBeenCalledWith('worker-error');
    expect(gate.shouldRenderOnWorker({ a: 1 })).toBe(false);
  });

  it('unsupported 메시지 수신 → FAILED, main fallback', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'unsupported' } });

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
  });
});

describe('WorkerRenderGate — worker 렌더 라우팅 (Step 8)', () => {
  const makeReadyGate = (opts = {}) => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      ...opts,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready' } });
    return gate;
  };

  it('ready 이고 in-flight 여유가 있으면 render 가 series 를 worker 로 보낸다(transfer 포함)', () => {
    const gate = makeReadyGate();
    const buf = new ArrayBuffer(8);
    const sent = gate.render({ epoch: 3 }, { s0: {} }, [buf]);

    expect(sent).toBe(true);
    expect(gate.worker.postMessage).toHaveBeenLastCalledWith(
      { type: 'render', epoch: 3, snapshot: { epoch: 3 }, columns: { s0: {} } },
      [buf],
    );
  });

  it('not-ready 이면 render 는 false(main 이 그 프레임 처리)', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });
    gate.start(); // INITIALIZING (ready 미수신)
    expect(gate.canAcceptRender()).toBe(false);
    expect(gate.render({ epoch: 1 }, {}, [])).toBe(false);
  });

  it('in-flight 상한 초과분은 보내지 않는다(coalescing)', () => {
    const gate = makeReadyGate({ maxInFlight: 2 });
    expect(gate.render({ epoch: 1 }, {}, [])).toBe(true);
    expect(gate.render({ epoch: 2 }, {}, [])).toBe(true);
    // 2개 in-flight → 상한 → 미전송
    expect(gate.canAcceptRender()).toBe(false);
    expect(gate.render({ epoch: 3 }, {}, [])).toBe(false);

    // rendered 응답 1개 → in-flight 감소 → 다시 수용
    gate.worker.onmessage({ data: { type: 'rendered', epoch: 1, bitmap: { close() {} } } });
    expect(gate.canAcceptRender()).toBe(true);
  });

  it('rendered 메시지 → frameHandler 호출 + in-flight 감소', () => {
    const gate = makeReadyGate();
    const onFrame = vi.fn();
    gate.setFrameHandler(onFrame);
    gate.render({ epoch: 5 }, {}, []);

    const frame = { type: 'rendered', epoch: 5, bitmap: { close() {} }, drawMs: 1.2 };
    gate.worker.onmessage({ data: frame });

    expect(onFrame).toHaveBeenCalledWith(frame);
    expect(gate.canAcceptRender()).toBe(true);
  });

  it('render-error 메시지 → onRenderException 훅 + errorHandler(main fallback)', () => {
    const onRenderException = vi.fn();
    const gate = makeReadyGate({ hooks: { onRenderException } });
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    gate.render({ epoch: 9 }, {}, []);

    gate.worker.onmessage({ data: { type: 'render-error', epoch: 9, message: 'boom' } });

    expect(onRenderException).toHaveBeenCalledWith('boom');
    expect(onError).toHaveBeenCalled();
    expect(gate.canAcceptRender()).toBe(true);
  });
});

describe('WorkerRenderGate — ready 핸드셰이크 timeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('timeout 내 ready 미수신 → FAILED + onTimeout, main fallback', () => {
    const onTimeout = vi.fn();
    const onFallback = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      initTimeoutMs: 1000,
      hooks: { onTimeout, onFallback },
    });
    gate.start();
    expect(gate.state).toBe(RENDER_WORKER_STATE.INITIALIZING);

    vi.advanceTimersByTime(1000);

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    expect(onTimeout).toHaveBeenCalledWith('init-timeout');
    expect(onFallback).toHaveBeenCalledWith('init-timeout');
  });

  it('timeout 전에 ready 수신하면 timer 가 취소되어 FAILED 로 가지 않음', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      initTimeoutMs: 1000,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready' } });

    vi.advanceTimersByTime(5000);

    expect(gate.state).toBe(RENDER_WORKER_STATE.READY);
  });
});
