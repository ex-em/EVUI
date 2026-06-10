/* eslint-env worker */
/**
 * Step 7 scaffolding: worker 렌더 엔트리 스텁.
 *
 * 이 step 은 worker-ready 핸드셰이크와 worker-URL 번들 가능성만 확정한다(실제 series 래스터는 Step 8).
 * 따라서 이 worker 는 렌더를 수행하지 않고 핸드셰이크에만 응답한다:
 *  - {type:'init', version} 수신 → OffscreenCanvas 지원 확인 후 {type:'ready'|'unsupported'} 응답
 *  - 그 외 메시지(render 등)는 무시(no-op, Step 8)
 *
 * B2 원칙(plan.md 불변 원칙 7): worker 는 *자체* OffscreenCanvas 를 생성한다.
 * 디스플레이 캔버스를 transferControlToOffscreen 으로 받지 않으므로 main 은 캔버스 소유권을 유지하고,
 * worker 가 실패해도 main fallback 이 항상 가능하다.
 */
self.onmessage = (event) => {
  const msg = event.data;
  if (msg && msg.type === 'init') {
    const supported = typeof OffscreenCanvas !== 'undefined';
    self.postMessage({
      type: supported ? 'ready' : 'unsupported',
      version: msg.version,
    });
  }
};
