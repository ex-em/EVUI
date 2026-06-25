import Util from '../helpers/helpers.util';

/**
 * style 로부터 canvas/DOM 공용 CSS font shorthand 문자열을 만든다.
 * 예: { fontWeight:'bold', fontSize:'11px', fontFamily:'Roboto' } -> "bold 11px Roboto"
 * @param {object} style 정규화된 style
 * @returns {string} CSS font shorthand
 */
export function buildFontStyle(style = {}) {
  const weight = style.fontWeight || 'normal';
  const size = typeof style.fontSize === 'number' ? `${style.fontSize}px` : style.fontSize || '11px';
  const family = style.fontFamily || 'sans-serif';
  return `${weight} ${size} ${family}`;
}

/**
 * 멀티라인 텍스트를 측정한다. measureFn 을 주입받아 캔버스 없이 테스트 가능.
 * @param {string} text       해석된 content 문자열 (\n 으로 줄 구분)
 * @param {string} fontStyle  CSS font shorthand
 * @param {(t:string, f:string)=>{width:number,height:number}} measureFn
 * @returns {{ lines: {text:string,width:number}[], width:number, height:number, lineHeight:number }}
 */
export function measureContent(text, fontStyle, measureFn = Util.calcTextSizeCanvas) {
  const raw = text == null ? '' : String(text);
  const lineStrs = raw.split('\n');
  let width = 0;
  let lineHeight = 0;
  const lines = lineStrs.map((t) => {
    const m = measureFn(t, fontStyle);
    width = Math.max(width, m.width);
    lineHeight = Math.max(lineHeight, m.height);
    return { text: t, width: m.width };
  });
  return { lines, width, height: lineHeight * lines.length, lineHeight };
}

/**
 * type 별 박스 크기(content + padding)를 계산한다. circle 은 박스 대신 shape 로 처리.
 * border 두께는 footprint 에 포함하지 않는다(draw 시 경계에 걸쳐 그림).
 * @param {object} annotation 정규화된 어노테이션
 * @param {string} contentStr 해석된 content
 * @param {Function} measureFn 측정 함수
 * @returns {{ w:number, h:number, content:object|null }}
 */
export function computeBoxSize(annotation, contentStr, measureFn = Util.calcTextSizeCanvas) {
  const { type, style } = annotation;
  if (type === 'circle') {
    const r = style.radius || 0;
    return { w: r * 2, h: r * 2, content: null };
  }
  const fontStyle = buildFontStyle(style);
  // 측정 캐시: 텍스트 크기는 (content, fontStyle)에만 의존하므로 동일하면 재측정하지 않는다.
  // 좌표(anchor/offset)는 매 프레임 다시 계산되므로 live/realtime 추적은 그대로 동작한다.
  // 캐시는 정규화된 annotation 객체에 붙으며, 옵션 배열이 교체되면 새 객체와 함께 폐기된다.
  const cacheKey = `${fontStyle}|${contentStr}`;
  let content;
  if (annotation._measure && annotation._measure.key === cacheKey) {
    content = annotation._measure.value;
  } else {
    content = measureContent(contentStr, fontStyle, measureFn);
    annotation._measure = { key: cacheKey, value: content };
  }
  const [pt, pr, pb, pl] = style.padding || [0, 0, 0, 0];
  return {
    w: content.width + pl + pr,
    h: content.height + pt + pb,
    content,
  };
}

/**
 * callout 꼬리의 방향(side)을 결정한다.
 *  - anchor !== 'auto' : 그대로 사용
 *  - anchor === 'auto' : 박스 중심에서 데이터 포인트(tip)로 향하는 방향(=offset 방향).
 *    offset 은 줌과 무관한 고정값이므로 줌 시 꼬리가 깜빡이지 않는다(결정론적).
 *    offset 이 0,0 이면 'bottom' 기본.
 * @returns {('top'|'bottom'|'left'|'right')}
 */
export function resolveCalloutSide(requestedAnchor, boxCenter, tip) {
  if (requestedAnchor && requestedAnchor !== 'auto') {
    return requestedAnchor;
  }
  const dx = tip.x - boxCenter.x;
  const dy = tip.y - boxCenter.y;
  if (dx === 0 && dy === 0) {
    return 'bottom';
  }
  if (Math.abs(dy) >= Math.abs(dx)) {
    return dy >= 0 ? 'bottom' : 'top';
  }
  return dx >= 0 ? 'right' : 'left';
}

/**
 * callout 꼬리 삼각형 기하를 계산한다.
 * tip(꼭짓점)은 데이터 포인트, base 두 점은 박스의 side 변 위에 있다.
 * @param {object} box  { x, y, w, h } 박스 top-left + 크기
 * @param {object} tip  { x, y } 데이터 포인트(=anchorX/anchorY)
 * @param {string} side 'top'|'bottom'|'left'|'right'
 * @param {number} arrowSize 꼬리 반폭
 * @returns {{ side, tipX, tipY, baseAX, baseAY, baseBX, baseBY }}
 */
export function computeTail(box, tip, side, arrowSize) {
  const a = Math.max(arrowSize, 1);
  let edgeFixed;
  let baseCenter;
  if (side === 'bottom' || side === 'top') {
    edgeFixed = side === 'bottom' ? box.y + box.h : box.y;
    // 꼬리 밑변이 박스 가로 변을 벗어나지 않도록 clamp
    baseCenter = Math.min(Math.max(tip.x, box.x + a), box.x + box.w - a);
    return {
      side,
      tipX: tip.x,
      tipY: tip.y,
      baseAX: baseCenter - a,
      baseAY: edgeFixed,
      baseBX: baseCenter + a,
      baseBY: edgeFixed,
    };
  }
  edgeFixed = side === 'right' ? box.x + box.w : box.x;
  baseCenter = Math.min(Math.max(tip.y, box.y + a), box.y + box.h - a);
  return {
    side,
    tipX: tip.x,
    tipY: tip.y,
    baseAX: edgeFixed,
    baseAY: baseCenter - a,
    baseBX: edgeFixed,
    baseBY: baseCenter + a,
  };
}

/**
 * 박스가 plot 경계를 벗어나는지 방향별 플래그를 계산한다.
 * @param {object} box { x, y, w, h }
 * @param {object} [plotBounds] { x1, y1, x2, y2 }
 * @returns {{ left:boolean, right:boolean, top:boolean, bottom:boolean, any:boolean }}
 */
export function computeOverflow(box, plotBounds) {
  const none = { left: false, right: false, top: false, bottom: false, any: false };
  if (!plotBounds) {
    return none;
  }
  const left = box.x < plotBounds.x1;
  const right = box.x + box.w > plotBounds.x2;
  const top = box.y < plotBounds.y1;
  const bottom = box.y + box.h > plotBounds.y2;
  return { left, right, top, bottom, any: left || right || top || bottom };
}

/**
 * 해석된 anchor + 박스 크기로 최종 렌더 레이아웃을 만든다. 순수 함수.
 * 박스는 anchor(offset 적용 좌표)에 중심 정렬한다.
 *  - text/badge : box 만
 *  - callout    : box + tail(데이터 포인트 anchorX/anchorY 를 가리킴)
 *  - circle     : shape(cx,cy,r)
 * plotBounds 가 주어지면 박스가 plot 영역을 벗어나는지 overflow 플래그를 계산한다(자르기/넛지는 렌더 단계 책임).
 *
 * @param {object} annotation 정규화된 어노테이션
 * @param {object} anchor resolveAnchor 결과 { x, y, anchorX, anchorY, isVisible }
 * @param {string} contentStr 해석된 content
 * @param {object} [plotBounds] { x1, y1, x2, y2 }
 * @param {Function} [measureFn]
 * @returns {object} 레이아웃 { type, box, content, shape, tail, overflow }
 */
export function computeLayout(annotation, anchor, contentStr, plotBounds, measureFn = Util.calcTextSizeCanvas) {
  const { type, style } = annotation;
  const size = computeBoxSize(annotation, contentStr, measureFn);

  if (type === 'circle') {
    const r = style.radius || 0;
    const shape = { cx: anchor.x, cy: anchor.y, r };
    const box = { x: anchor.x - r, y: anchor.y - r, w: r * 2, h: r * 2 };
    return { type, box, shape, content: null, tail: null, overflow: computeOverflow(box, plotBounds) };
  }

  const box = {
    x: Math.round(anchor.x - size.w / 2),
    y: Math.round(anchor.y - size.h / 2),
    w: size.w,
    h: size.h,
  };

  let tail = null;
  if (type === 'callout') {
    const boxCenter = { x: box.x + box.w / 2, y: box.y + box.h / 2 };
    const tip = { x: anchor.anchorX, y: anchor.anchorY };
    const side = resolveCalloutSide(style.anchor, boxCenter, tip);
    tail = computeTail(box, tip, side, style.arrowSize || 8);
  }

  return { type, box, content: size.content, shape: null, tail, overflow: computeOverflow(box, plotBounds) };
}
