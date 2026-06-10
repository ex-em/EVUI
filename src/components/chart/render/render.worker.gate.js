/**
 * RenderCore worker 게이트 (Step 7: layer-arch-and-killswitch).
 *
 * worker 렌더(Step 8)를 붙이기 *전* 레이어 소유권·kill switch·worker 생명주기를 확정하는 스캐폴딩이다.
 * 이 step 은 **실제 worker 렌더를 연결하지 않는다** — 게이트는 항상 main 경로로 결정되며(kill switch 기본 off),
 * worker 미진입 상태에서 기존 동작이 100% 유지된다. 실제 series 래스터 연결은 Step 8.
 *
 * 레이어 경계·invalidation·B2 캔버스 소유권 전체 표는 `phases/chart-worker-offload/worker-arch.md` 참조.
 *
 * 핵심 계약(리뷰 반영):
 *  - **B2**: worker 는 *자체* OffscreenCanvas 를 만들어 `transferToImageBitmap()` → main `drawImage`.
 *    디스플레이 캔버스를 `transferControlToOffscreen` 으로 넘기지 *않는다*(일방향 transfer = fallback 불가).
 *    따라서 worker 진입은 transfer 게이트가 아니라 **async ready 핸드셰이크**(initializing→ready→failed)다.
 *  - **kill switch**: 공개 API 에 노출하지 않는 내부 플래그. 기본 보수적(off). Step 8/9 측정을 위한
 *    deterministic 내부 enable 경로(`setWorkerRenderEnabled`)를 둔다("off or feature-detect" 모호성 제거).
 *  - **관측성**: init 실패 / render 예외 / timeout / main fallback 전환 hook 자리(기본 no-op).
 */

/** worker 가 모르는 스냅샷 버전이면 main fallback. render.snapshot.js 와 동일 값. */
import { RENDER_SNAPSHOT_VERSION } from './render.snapshot';

/** worker 생명주기 상태기계. ready 전·failed 면 main RenderCore. */
export const RENDER_WORKER_STATE = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  READY: 'ready',
  FAILED: 'failed',
};

/** ready 핸드셰이크 timeout(ms). 초과 시 failed → main fallback. */
const DEFAULT_INIT_TIMEOUT_MS = 3000;

/** in-flight(미응답) worker 렌더 상한. 초과분은 보내지 않고 main 이 그 프레임을 그린다(coalescing 보수값). */
const DEFAULT_MAX_IN_FLIGHT = 2;

const NOOP = () => {};

/**
 * 관측성 훅 자리(기본 no-op). Step 8/9 에서 실제 로깅/메트릭을 주입한다.
 *  - onInitFailure(reason)    : worker 생성 실패 / onerror / unsupported
 *  - onTimeout(reason)        : ready 핸드셰이크 timeout
 *  - onRenderException(reason): worker 렌더 예외(Step 8)
 *  - onFallback(reason)       : main 경로로 전환
 */
const DEFAULT_HOOKS = {
  onInitFailure: NOOP,
  onTimeout: NOOP,
  onRenderException: NOOP,
  onFallback: NOOP,
};

function readEnvFlag() {
  try {
    return !!(import.meta && import.meta.env && import.meta.env.VITE_EVUI_WORKER_RENDER);
  } catch (e) {
    return false;
  }
}

/**
 * 내부 kill switch. 공개 API 가 아니며 기본 off(보수적).
 * 빌드/dev 플래그(`VITE_EVUI_WORKER_RENDER`)가 있으면 그 값으로 초기화한다.
 */
let workerRenderEnabled = readEnvFlag();

/** kill switch 조회. */
export function isWorkerRenderEnabled() {
  return workerRenderEnabled;
}

/**
 * kill switch 의 deterministic 내부 enable 경로(Step 8/9 측정용). 공개 API 아님.
 * "off or feature-detect" 모호성을 제거해 측정 시 확실히 켜지도록 한다.
 */
export function setWorkerRenderEnabled(enabled) {
  workerRenderEnabled = !!enabled;
}

/**
 * worker 렌더 환경 feature-detect.
 *  - Worker / OffscreenCanvas 존재(SSR·jsdom 은 둘 중 하나 부재로 false)
 *  - B2 경로에 필요한 OffscreenCanvas.transferToImageBitmap 존재
 */
export function detectWorkerRenderSupport() {
  return (
    typeof Worker !== 'undefined'
    && typeof OffscreenCanvas !== 'undefined'
    && typeof OffscreenCanvas.prototype.transferToImageBitmap === 'function'
  );
}

/** 스냅샷이 worker 로 structured-clone 가능한지(직렬화 불가 → main fallback). */
export function canSerializeSnapshot(snapshot) {
  if (typeof structuredClone !== 'function') {
    return false;
  }
  try {
    structuredClone(snapshot);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 조기 worker-URL smoke(리뷰: Step 10 → 7 로 앞당김).
 * `new Worker(new URL('...', import.meta.url), {type:'module'})` 가 ESM import / UMD(require) / SSR 에서
 * 번들/실행 가능한지 여기서 확인한다. 깨지면(throw) null 을 돌려 feature-detect 가 main fallback 하도록 한다.
 * (전체 매트릭스 경화는 Step 10.)
 */
export function createRenderWorker() {
  try {
    return new Worker(new URL('./render.worker.js', import.meta.url), { type: 'module' });
  } catch (e) {
    return null;
  }
}

/**
 * async worker-ready 상태기계. ready 전·failed 면 main RenderCore 가 그린다.
 *
 * 이 step 에선 production 경로에서 `start()` 를 호출하지 않으므로 worker 가 생성되지 않고(기존 동작 유지),
 * Step 8 이 측정 시 `setWorkerRenderEnabled(true)` 후 `start()` 로 진입한다.
 */
export class WorkerRenderGate {
  constructor(options = {}) {
    this.state = RENDER_WORKER_STATE.IDLE;
    this.worker = null;
    this.version = options.version ?? RENDER_SNAPSHOT_VERSION;
    this.initTimeoutMs = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS;
    this.maxInFlight = options.maxInFlight ?? DEFAULT_MAX_IN_FLIGHT;
    this.hooks = { ...DEFAULT_HOOKS, ...(options.hooks || {}) };
    this._timer = null;

    // worker 렌더 응답 라우팅(chart.core 가 주입). 기본 no-op.
    this._frameHandler = NOOP;
    this._errorHandler = NOOP;
    // 미응답(in-flight) 렌더 수. 상한 초과 시 main 이 그 프레임을 그린다(stale frame pile-up 방지).
    this._inFlight = 0;

    // 테스트/측정용 주입(기본 = 실제 구현). 공개 API 아님.
    this._isEnabled = options.isEnabled || isWorkerRenderEnabled;
    this._isSupported = options.isSupported || detectWorkerRenderSupport;
    this._createWorker = options.createWorker || createRenderWorker;
  }

  /**
   * worker 초기화 + ready 핸드셰이크 시작. kill switch off / 미지원 / 생성 실패면 main 경로로 남는다.
   * @returns {string} 진입 후 상태
   */
  start() {
    if (this.state !== RENDER_WORKER_STATE.IDLE) {
      return this.state;
    }
    if (!this._isEnabled()) {
      this.hooks.onFallback('kill-switch-off');
      return this.state;
    }
    if (!this._isSupported()) {
      this.hooks.onFallback('unsupported');
      return this.state;
    }

    const worker = this._createWorker();
    if (!worker) {
      this.state = RENDER_WORKER_STATE.FAILED;
      this.hooks.onInitFailure('worker-create-failed');
      this.hooks.onFallback('worker-create-failed');
      return this.state;
    }

    this.worker = worker;
    this.state = RENDER_WORKER_STATE.INITIALIZING;
    worker.onmessage = (event) => this._handleMessage(event);
    worker.onerror = () => this._fail('worker-error');
    this._timer = setTimeout(() => this._handleTimeout(), this.initTimeoutMs);
    worker.postMessage({ type: 'init', version: this.version });
    return this.state;
  }

  isReady() {
    return this.state === RENDER_WORKER_STATE.READY;
  }

  /**
   * 렌더 시점 결정. ready 이고 스냅샷이 직렬화 가능할 때만 worker, 아니면 main.
   * (initializing/failed/직렬화불가 → main 경로 → 기존 동작 유지)
   */
  shouldRenderOnWorker(snapshot) {
    return this.isReady() && canSerializeSnapshot(snapshot);
  }

  /** worker 프레임(ImageBitmap) 도착 핸들러 주입(chart.core 가 epoch 비교 후 commit). */
  setFrameHandler(fn) {
    this._frameHandler = fn || NOOP;
  }

  /** worker 렌더 예외 핸들러 주입(chart.core 가 main fallback). */
  setErrorHandler(fn) {
    this._errorHandler = fn || NOOP;
  }

  /** in-flight 상한에 여유가 있어 worker 로 렌더를 보낼 수 있는지(없으면 main 이 그 프레임 처리). */
  canAcceptRender() {
    return this.isReady() && this._inFlight < this.maxInFlight;
  }

  /**
   * series 래스터를 worker 로 보낸다(B2). packed 컬럼 버퍼는 transfer(packSeries 가 copy 한 사본).
   * @param {object} snapshot      RenderInput (epoch 포함)
   * @param {object} columns       packSeries(snapshot).columns
   * @param {ArrayBuffer[]} transferList   transfer 대상 버퍼(copy 본)
   * @returns {boolean} 전송 여부(미전송 시 main 이 그 프레임 처리)
   */
  render(snapshot, columns, transferList) {
    if (!this.canAcceptRender() || !this.worker) {
      return false;
    }
    this._inFlight += 1;
    this.worker.postMessage(
      { type: 'render', epoch: snapshot.epoch, snapshot, columns },
      transferList || [],
    );
    return true;
  }

  destroy() {
    this._clearTimer();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.state = RENDER_WORKER_STATE.IDLE;
  }

  _handleMessage(event) {
    const msg = event && event.data;
    if (!msg) {
      return;
    }
    if (msg.type === 'ready' && this.state === RENDER_WORKER_STATE.INITIALIZING) {
      this._clearTimer();
      this.state = RENDER_WORKER_STATE.READY;
    } else if (msg.type === 'unsupported') {
      this._fail('worker-unsupported');
    } else if (msg.type === 'rendered') {
      this._inFlight = Math.max(0, this._inFlight - 1);
      this._frameHandler(msg);
    } else if (msg.type === 'render-error') {
      this._inFlight = Math.max(0, this._inFlight - 1);
      this.hooks.onRenderException(msg.message);
      this._errorHandler(msg);
    }
  }

  _handleTimeout() {
    if (this.state === RENDER_WORKER_STATE.INITIALIZING) {
      this.hooks.onTimeout('init-timeout');
      this._fail('init-timeout');
    }
  }

  _fail(reason) {
    this._clearTimer();
    this.state = RENDER_WORKER_STATE.FAILED;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.hooks.onInitFailure(reason);
    this.hooks.onFallback(reason);
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
