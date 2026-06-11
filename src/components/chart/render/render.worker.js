/* eslint-env worker */
/**
 * worker 렌더 엔트리 (Step 8: worker-micro-poc).
 *
 * B2 원칙(plan.md 불변 원칙 7): worker 는 *자체* OffscreenCanvas 를 생성해 series 를 래스터하고
 * `transferToImageBitmap()` 으로 ImageBitmap 을 main 에 보낸다. 디스플레이 캔버스를
 * `transferControlToOffscreen` 으로 받지 않으므로 main 은 캔버스 소유권을 유지하고 worker 실패 시
 * main fallback 이 항상 가능하다.
 *
 * 메시지:
 *  - {type:'init', version}            → OffscreenCanvas 지원 확인 후 {type:'ready'|'unsupported'} 응답
 *  - {type:'render', epoch, snapshot, columns}
 *      → 자체 OffscreenCanvas 에 series 래스터(Step 3 element draw 재사용) → transferToImageBitmap
 *      → {type:'rendered', epoch, bitmap, drawMs} (bitmap transfer) 응답. 예외 시 {type:'render-error'}.
 *
 * 래스터 알고리즘은 새로 구현하지 않는다 — `render.unpack.js` 가 스냅샷에서 element 인스턴스를
 * 재구성하고 element `draw()` 를 호출한다(이중 구현 금지).
 */

import { reconstructSeries, rasterSeries } from './render.unpack';

/** worker 가 재사용하는 OffscreenCanvas(크기 변경 시에만 재할당). */
let canvas = null;
let ctx = null;

function ensureCanvas(width, height) {
  if (!canvas || canvas.width !== width || canvas.height !== height) {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d');
  }
}

function renderSnapshot(msg) {
  const { epoch, snapshot, columns } = msg;
  const pixelRatio = snapshot.pixelRatio || 1;
  const rect = snapshot.chartRect ?? {};
  const cssWidth = rect.width ?? 0;
  const cssHeight = rect.height ?? 0;
  // main bufferCanvas/displayCanvas 는 `width * pixelRatio` 를 canvas.width 에 대입(정수 truncation).
  // 동일 device 크기로 맞춰야 bitmap 이 1:1 합성되고 ensureCanvas 가 매 프레임 재할당하지 않는다.
  const deviceWidth = Math.max(1, Math.floor(cssWidth * pixelRatio));
  const deviceHeight = Math.max(1, Math.floor(cssHeight * pixelRatio));

  ensureCanvas(deviceWidth, deviceHeight);

  // main buffer 와 동일한 절대 변환(setTransform)으로 CSS px 좌표를 device px 로 스케일.
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const instances = reconstructSeries(snapshot, columns);

  const t0 = performance.now();
  rasterSeries(snapshot, instances, ctx);
  const drawMs = performance.now() - t0;

  const t1 = performance.now();
  const bitmap = canvas.transferToImageBitmap();
  const bitmapMs = performance.now() - t1;

  self.postMessage({ type: 'rendered', epoch, bitmap, drawMs, bitmapMs }, [bitmap]);
}

self.onmessage = (event) => {
  const msg = event.data;
  if (!msg) {
    return;
  }

  if (msg.type === 'init') {
    const supported = typeof OffscreenCanvas !== 'undefined';
    self.postMessage({
      type: supported ? 'ready' : 'unsupported',
      version: msg.version,
    });
    return;
  }

  if (msg.type === 'render') {
    try {
      renderSnapshot(msg);
    } catch (err) {
      self.postMessage({
        type: 'render-error',
        epoch: msg.epoch,
        message: String((err && err.message) || err),
      });
    }
  }
};
