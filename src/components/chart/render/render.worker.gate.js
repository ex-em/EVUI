/**
 * RenderCore worker 게이트 (Step 7: layer-arch-and-killswitch).
 *
 * 레이어 소유권·opt-in 게이트·worker 생명주기를 담당한다. worker 진입은 차트별 `options.workerRender`
 * (기본 off)로만 켜지며, opt-in 하지 않으면 worker 미진입 = 기존 main 경로 100% 유지.
 *
 * 레이어 경계·invalidation·B2 캔버스 소유권 전체 표는 `phases/chart-worker-offload/worker-arch.md` 참조.
 *
 * 핵심 계약(리뷰 반영):
 *  - **B2**: worker 는 *자체* OffscreenCanvas 를 만들어 `transferToImageBitmap()` → main `drawImage`.
 *    디스플레이 캔버스를 `transferControlToOffscreen` 으로 넘기지 *않는다*(일방향 transfer = fallback 불가).
 *    따라서 worker 진입은 transfer 게이트가 아니라 **async ready 핸드셰이크**(initializing→ready→failed)다.
 *  - **opt-in**: worker 진입은 차트별 옵션(`options.workerRender`, 기본 off)으로만 켠다. chart.core 가
 *    `isEnabled: () => !!options.workerRender` 를 게이트에 주입한다(전역 플래그 없음 → OSS 무회귀).
 *  - **관측성**: init 실패 / render 예외 / timeout / main fallback 전환 hook 자리(기본 no-op).
 */

/** worker 가 모르는 스냅샷 버전이면 main fallback. render.snapshot.js 와 동일 값. */
import { RENDER_SNAPSHOT_VERSION } from './render.snapshot';
/**
 * worker 를 inline(blob)으로 번들한다. lib 빌드가 worker 를 별도 에셋(`/assets/render.worker-*.js`)으로
 * emit 하면 소비자 앱 루트에 그 경로가 없어 404 → worker 미로드. inline 은 소비자 번들러/에셋 서빙과
 * 무관하게 항상 로드된다(대가: 번들 크기 +worker, CSP blob 허용 필요). Step 10 소비자 패키징.
 */
import RenderWorkerInline from './render.worker.js?worker&inline';

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

/** 연속 render-error 임계치. 초과 시 worker 를 포기(_fail)하고 영구 main 경로로 — 무한 재시도 방지(이슈5). */
const DEFAULT_MAX_RENDER_ERRORS = 3;

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
 * inline(blob) worker 를 생성한다. 생성 자체가 throw 할 수 있으므로(예: CSP 가 blob/data worker 차단)
 * try/catch 는 호출처(start)가 소유한다 — 에러 객체를 onInitFailure 로 보내 원인 진단이 가능하게 한다.
 * (이전 구현은 여기서 catch 해 null 만 돌려 에러를 폐기했음 — 이슈4.)
 */
export function createRenderWorker() {
  return new RenderWorkerInline();
}

/**
 * async worker-ready 상태기계. ready 전·failed 면 main RenderCore 가 그린다.
 *
 * 차트가 `options.workerRender` 로 opt-in 하지 않으면 `_isEnabled()` 가 false 라 `start()` 가
 * worker 를 만들지 않고 main 경로로 남는다(기존 동작 100% 유지).
 */
export class WorkerRenderGate {
  constructor(options = {}) {
    this.state = RENDER_WORKER_STATE.IDLE;
    this.worker = null;
    this.version = options.version ?? RENDER_SNAPSHOT_VERSION;
    this.initTimeoutMs = options.initTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS;
    this.maxInFlight = options.maxInFlight ?? DEFAULT_MAX_IN_FLIGHT;
    this.maxRenderErrors = options.maxRenderErrors ?? DEFAULT_MAX_RENDER_ERRORS;
    this.hooks = { ...DEFAULT_HOOKS, ...(options.hooks || {}) };
    this._timer = null;

    // worker 렌더 응답 라우팅(chart.core 가 주입). 기본 no-op.
    this._frameHandler = NOOP;
    this._errorHandler = NOOP;
    // 미응답(in-flight) 렌더 수. 상한 초과 시 main 이 그 프레임을 그린다(stale frame pile-up 방지).
    this._inFlight = 0;
    // 연속 render-error 수(rendered 성공 시 0 으로 리셋). 임계치 초과 시 worker 포기(이슈5).
    this._renderErrorStreak = 0;

    // worker 진입 여부(차트별 opt-in). chart.core 가 `() => !!options.workerRender` 를 주입한다.
    // 주입이 없으면 보수적으로 off(기존 main 경로 유지).
    this._isEnabled = options.isEnabled || (() => false);
    this._isSupported = options.isSupported || detectWorkerRenderSupport;
    this._createWorker = options.createWorker || createRenderWorker;
  }

  /**
   * worker 초기화 + ready 핸드셰이크 시작. opt-in off / 미지원 / 생성 실패면 main 경로로 남는다.
   * @returns {string} 진입 후 상태
   */
  start() {
    if (this.state !== RENDER_WORKER_STATE.IDLE) {
      return this.state;
    }
    if (!this._isEnabled()) {
      this.hooks.onFallback('opt-in-off');
      return this.state;
    }
    if (!this._isSupported()) {
      this.hooks.onFallback('unsupported');
      return this.state;
    }

    let worker;
    try {
      worker = this._createWorker();
    } catch (e) {
      // worker 생성 throw(예: CSP blob 차단) — 에러 객체를 그대로 넘겨 원인 진단 가능하게 한다(이슈4).
      this.state = RENDER_WORKER_STATE.FAILED;
      this.hooks.onInitFailure(e);
      this.hooks.onFallback('worker-create-failed');
      return this.state;
    }
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
    try {
      this.worker.postMessage(
        { type: 'render', epoch: snapshot.epoch, snapshot, columns },
        transferList || [],
      );
    } catch (e) {
      // postMessage 실패(clone/detach 불가, worker 사망) → in-flight 누수 방지 + worker 포기(main 경로).
      // 미전송이므로 false 를 돌려 호출부(main)가 이 프레임을 그린다.
      this._inFlight = Math.max(0, this._inFlight - 1);
      this.hooks.onRenderException(e);
      this._fail('post-message-failed');
      return false;
    }
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
      // 스냅샷 계약 버전 불일치(stale/캐시된 다른 버전 worker 번들)면 fallback — 잘못된 worker 가
      // READY 가 되어 깨진 프레임을 그리는 것을 막는다(리뷰 반영).
      if (msg.version !== this.version) {
        this._fail('version-mismatch');
        return;
      }
      this._clearTimer();
      this.state = RENDER_WORKER_STATE.READY;
    } else if (msg.type === 'unsupported') {
      this._fail('worker-unsupported');
    } else if (msg.type === 'rendered') {
      this._inFlight = Math.max(0, this._inFlight - 1);
      this._renderErrorStreak = 0;
      this._frameHandler(msg);
    } else if (msg.type === 'render-error') {
      this._inFlight = Math.max(0, this._inFlight - 1);
      // payload 전체(name/stack 포함) 전달 — 원인 진단 가능(이슈5). streak 은 모든 에러에 누적한다.
      this.hooks.onRenderException(msg);
      // fallback draw 는 _errorHandler 가 epoch 비교로 current 프레임에만 적용한다(stale 에러는 화면 안 덮음).
      this._errorHandler(msg);
      this._renderErrorStreak += 1;
      if (this._renderErrorStreak >= this.maxRenderErrors) {
        // 결정적 실패(예: 2d context 미지원)로 매 프레임 비용만 지불하는 무한 재시도 차단.
        this._fail('render-error-threshold');
      }
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
    // worker 사망 시 응답이 안 온 in-flight 프레임은 영영 안 온다. main 이 series 를 그려야 안 그러면
    // 다음 외부 이벤트(정적 차트면 영원히)까지 이전 프레임이 남아 화면이 동결된다(이슈6).
    const hadInFlight = this._inFlight > 0;
    this._inFlight = 0;
    this.hooks.onInitFailure(reason);
    this.hooks.onFallback(reason);
    if (hadInFlight) {
      // msg 없이 호출 → drawSeriesLayerFallback() 가 현재 프레임을 그린다(epoch 비교 없음).
      this._errorHandler();
    }
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
