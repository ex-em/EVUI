import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  RENDER_WORKER_STATE,
  WorkerRenderGate,
  detectWorkerRenderSupport,
  canSerializeSnapshot,
} from './render.worker.gate';

/**
 * worker 게이트(opt-in 게이트 · feature-detect · ready 상태기계 · fallback).
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

describe('canSerializeSnapshot', () => {
  it('plain object 는 직렬화 가능', () => {
    expect(canSerializeSnapshot({ a: 1, b: [1, 2], c: { d: 'x' } })).toBe(true);
  });

  it('function 을 포함하면 직렬화 불가', () => {
    expect(canSerializeSnapshot({ fn: () => {} })).toBe(false);
  });
});

describe('WorkerRenderGate — fallback 결정 (worker vs main)', () => {
  it('opt-in off → worker 미생성, main 경로(IDLE) + onFallback', () => {
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
    expect(onFallback).toHaveBeenCalledWith('opt-in-off');
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

  it('worker 생성 실패(null 반환) → FAILED + onInitFailure + onFallback', () => {
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

  it('worker 생성 throw(예: CSP blob 차단) → FAILED + onInitFailure 에 에러 객체 전달', () => {
    const onInitFailure = vi.fn();
    const onFallback = vi.fn();
    const err = new Error('blocked by CSP');
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: () => {
        throw err;
      },
      hooks: { onInitFailure, onFallback },
    });

    expect(gate.start()).toBe(RENDER_WORKER_STATE.FAILED);
    // 에러 객체가 폐기되지 않고 그대로 전달된다(원인 진단 가능).
    expect(onInitFailure).toHaveBeenCalledWith(err);
    expect(onFallback).toHaveBeenCalledWith('worker-create-failed');
  });

  it('직렬화 불가 스냅샷이면 ready 여도 main(worker 미선택)', () => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready', version: gate.version } });

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
    gate.worker.onmessage({ data: { type: 'ready', version: gate.version } });

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

  it('ready 인데 스냅샷 버전 불일치 → version-mismatch 로 FAILED, main fallback', () => {
    const onInitFailure = vi.fn();
    const onFallback = vi.fn();
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      hooks: { onInitFailure, onFallback },
    });
    gate.start();
    // stale/다른 버전 worker 번들이 잘못된 version 을 echo.
    gate.worker.onmessage({ data: { type: 'ready', version: gate.version + 99 } });

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    expect(gate.isReady()).toBe(false);
    expect(onInitFailure).toHaveBeenCalledWith('version-mismatch');
    expect(onFallback).toHaveBeenCalledWith('version-mismatch');
  });
});

describe('WorkerRenderGate — worker 렌더 라우팅', () => {
  const makeReadyGate = (opts = {}) => {
    const gate = new WorkerRenderGate({
      isEnabled: () => true,
      isSupported: () => true,
      createWorker: makeFakeWorker,
      ...opts,
    });
    gate.start();
    gate.worker.onmessage({ data: { type: 'ready', version: gate.version } });
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

  it('render-error 메시지 → onRenderException 훅(payload 전체) + errorHandler(main fallback)', () => {
    const onRenderException = vi.fn();
    const gate = makeReadyGate({ hooks: { onRenderException } });
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    gate.render({ epoch: 9 }, {}, []);

    const errMsg = { type: 'render-error', epoch: 9, message: 'boom', name: 'TypeError', stack: 's' };
    gate.worker.onmessage({ data: errMsg });

    // name/stack 진단 위해 payload 전체를 넘긴다.
    expect(onRenderException).toHaveBeenCalledWith(errMsg);
    expect(onError).toHaveBeenCalledWith(errMsg);
    expect(gate.canAcceptRender()).toBe(true);
  });

  it('rendered 응답은 render-error streak 을 0 으로 리셋한다', () => {
    const gate = makeReadyGate({ maxRenderErrors: 3 });
    gate.render({ epoch: 1 }, {}, []);
    gate.worker.onmessage({ data: { type: 'render-error', epoch: 1, message: 'x' } });
    gate.render({ epoch: 2 }, {}, []);
    gate.worker.onmessage({ data: { type: 'rendered', epoch: 2, bitmap: { close() {} } } });
    expect(gate._renderErrorStreak).toBe(0);
  });

  it('연속 render-error 가 임계치(maxRenderErrors) 도달 → FAILED(무한 재시도 차단)', () => {
    const onInitFailure = vi.fn();
    const gate = makeReadyGate({ maxRenderErrors: 3, hooks: { onInitFailure } });
    for (let i = 1; i <= 3; i++) {
      gate.render({ epoch: i }, {}, []);
      gate.worker.onmessage({ data: { type: 'render-error', epoch: i, message: 'boom' } });
    }
    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    expect(onInitFailure).toHaveBeenCalledWith('render-error-threshold');
  });

  it('임계치 도달 시 in-flight 가 남아도 같은 프레임을 이중으로 그리지 않는다', () => {
    const gate = makeReadyGate({ maxRenderErrors: 2, maxInFlight: 3 });
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    // 3개 전송 후 연속 에러로 임계치(2) 도달 — 마지막 에러 시점에도 in-flight 가 남아 있다.
    gate.render({ epoch: 1 }, {}, []);
    gate.render({ epoch: 2 }, {}, []);
    gate.render({ epoch: 3 }, {}, []);
    gate.worker.onmessage({ data: { type: 'render-error', epoch: 1, message: 'x' } });
    gate.worker.onmessage({ data: { type: 'render-error', epoch: 2, message: 'x' } }); // 임계치 → _fail

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    // 에러 1건당 errorHandler 1회씩 = 2회. _fail 의 in-flight 복구가 추가로 그리지 않는다.
    expect(onError).toHaveBeenCalledTimes(2);
  });

  it('_fail 시 in-flight 프레임이 있으면 errorHandler 로 main fallback 을 그린다(화면 동결 방지)', () => {
    const gate = makeReadyGate();
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    gate.render({ epoch: 1 }, {}, []); // in-flight 1
    expect(gate._inFlight).toBe(1);

    // worker 사망(onerror) — in-flight 응답은 영영 안 온다.
    gate.worker.onerror(new Error('died'));

    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    expect(onError).toHaveBeenCalled(); // main 이 현재 프레임을 그림
  });

  it('_fail 시 in-flight 가 없으면 errorHandler 를 호출하지 않는다', () => {
    const gate = makeReadyGate();
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    // 렌더를 보낸 적 없음 → in-flight 0.
    gate.worker.onerror(new Error('died'));
    expect(onError).not.toHaveBeenCalled();
  });

  it('render() postMessage throw → in-flight 0 + onRenderException + _fail, errorHandler 미호출(호출부가 그림)', () => {
    const onRenderException = vi.fn();
    const gate = makeReadyGate({ hooks: { onRenderException } });
    const onError = vi.fn();
    gate.setErrorHandler(onError);
    gate.render({ epoch: 1 }, {}, []); // 정상 전송 → in-flight 1
    const err = new Error('DataCloneError');
    gate.worker.postMessage = () => {
      throw err;
    };

    const sent = gate.render({ epoch: 2 }, {}, []);

    expect(sent).toBe(false);
    expect(gate._inFlight).toBe(0); // 누수 없음
    expect(onRenderException).toHaveBeenCalledWith(err);
    expect(gate.state).toBe(RENDER_WORKER_STATE.FAILED);
    // 미전송이라 호출부(main)가 이 프레임을 그리므로 _fail 이 errorHandler 로 같은 프레임을 또 그리지 않는다.
    expect(onError).not.toHaveBeenCalled();
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
    gate.worker.onmessage({ data: { type: 'ready', version: gate.version } });

    vi.advanceTimersByTime(5000);

    expect(gate.state).toBe(RENDER_WORKER_STATE.READY);
  });
});
