import Canvas from '../helpers/helpers.canvas';
import { buildFontStyle } from './annotation.layout';

const DASH_MAP = {
  solid: [],
  dash: [4, 4],
  dot: [1, 3],
};

/**
 * 박스의 둘레에서 주어진 점(데이터 포인트)에 가장 가까운 점을 구한다(connector 종착점).
 * @param {object} box { x, y, w, h }
 * @param {object} pt { x, y }
 * @returns {{x:number, y:number}}
 */
export function nearestBoxPoint(box, pt) {
  return {
    x: Math.min(Math.max(pt.x, box.x), box.x + box.w),
    y: Math.min(Math.max(pt.y, box.y), box.y + box.h),
  };
}

/**
 * connector(연결선)를 그린다. callout 은 정규화 단계에서 connector 가 꺼지므로 여기 오지 않는다.
 * @param {object} ctx canvas 2d context
 * @param {object} from 데이터 포인트 { x, y } (anchorX/anchorY)
 * @param {object} box  { x, y, w, h }
 * @param {object} connector 정규화된 connector
 */
export function drawConnector(ctx, from, box, connector) {
  if (!connector?.enabled) {
    return;
  }
  const end = nearestBoxPoint(box, from);
  const style = connector.style || {};
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = style.stroke || '#9E9E9E';
  ctx.lineWidth = style.strokeWidth || 1;
  ctx.setLineDash(DASH_MAP[style.dashStyle] || DASH_MAP.solid);
  ctx.moveTo(from.x, from.y);
  if (connector.type === 'elbow') {
    // 수평 먼저 → 수직(L자). 결정론적.
    ctx.lineTo(end.x, from.y);
    ctx.lineTo(end.x, end.y);
  } else {
    ctx.lineTo(end.x, end.y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 둥근 사각형 박스(badge/text 배경)를 채우고 테두리를 그린다.
 * @param {object} ctx
 * @param {object} box { x, y, w, h }
 * @param {object} style 정규화된 style
 */
export function drawBox(ctx, box, style) {
  const hasFill = style.backgroundColor && style.backgroundColor !== 'transparent';
  const hasBorder = style.borderWidth > 0 && style.borderColor && style.borderColor !== 'transparent';
  if (!hasFill && !hasBorder) {
    return;
  }
  ctx.save();
  ctx.beginPath();
  Canvas.roundedRect(ctx, box.x, box.y, box.w, box.h, style.borderRadius || 0);
  if (hasFill) {
    ctx.fillStyle = style.backgroundColor;
    ctx.fill();
  }
  if (hasBorder) {
    ctx.lineWidth = style.borderWidth;
    ctx.strokeStyle = style.borderColor;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * callout 박스 + 꼬리를 하나의 둥근-모서리 path 로 그린다(maxTip 말풍선과 동일한 외형).
 * 시계방향으로 각 변을 진행하며 모서리는 quadraticCurveTo 로 둥글리고, tail.side 변에서
 * base→tip→base 로 꺾어 꼬리를 삽입한다. 단일 path 라 테두리가 꼬리까지 매끄럽게 이어진다.
 * @param {object} ctx
 * @param {object} box  { x, y, w, h }
 * @param {object} tail computeTail 결과
 * @param {object} style 정규화된 style
 */
export function drawCallout(ctx, box, tail, style) {
  const { x, y, w, h } = box;
  const left = x;
  const right = x + w;
  const top = y;
  const bottom = y + h;
  const r = Math.min(style.borderRadius || 0, w / 2, h / 2);
  const side = tail?.side;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left + r, top);

  // TOP edge (L→R)
  if (side === 'top') {
    ctx.lineTo(Math.min(tail.baseAX, tail.baseBX), top);
    ctx.lineTo(tail.tipX, tail.tipY);
    ctx.lineTo(Math.max(tail.baseAX, tail.baseBX), top);
  }
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);

  // RIGHT edge (T→B)
  if (side === 'right') {
    ctx.lineTo(right, Math.min(tail.baseAY, tail.baseBY));
    ctx.lineTo(tail.tipX, tail.tipY);
    ctx.lineTo(right, Math.max(tail.baseAY, tail.baseBY));
  }
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);

  // BOTTOM edge (R→L)
  if (side === 'bottom') {
    ctx.lineTo(Math.max(tail.baseAX, tail.baseBX), bottom);
    ctx.lineTo(tail.tipX, tail.tipY);
    ctx.lineTo(Math.min(tail.baseAX, tail.baseBX), bottom);
  }
  ctx.lineTo(left + r, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - r);

  // LEFT edge (B→T)
  if (side === 'left') {
    ctx.lineTo(left, Math.max(tail.baseAY, tail.baseBY));
    ctx.lineTo(tail.tipX, tail.tipY);
    ctx.lineTo(left, Math.min(tail.baseAY, tail.baseBY));
  }
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();

  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor;
    ctx.fill();
  }
  if (style.borderWidth > 0 && style.borderColor && style.borderColor !== 'transparent') {
    ctx.lineWidth = style.borderWidth;
    ctx.strokeStyle = style.borderColor;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 강조용 순수 원형 도형을 그린다(circle 타입).
 * @param {object} ctx
 * @param {object} shape { cx, cy, r }
 * @param {object} style
 */
export function drawCircle(ctx, shape, style) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
  if (style.backgroundColor && style.backgroundColor !== 'transparent') {
    ctx.fillStyle = style.backgroundColor;
    ctx.fill();
  }
  if (style.borderWidth > 0 && style.borderColor && style.borderColor !== 'transparent') {
    ctx.lineWidth = style.borderWidth;
    ctx.strokeStyle = style.borderColor;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * 박스 안에 멀티라인 텍스트를 그린다(가로 중앙, 세로 중앙 정렬).
 * @param {object} ctx
 * @param {object} box  { x, y, w, h }
 * @param {object} content measureContent 결과 { lines, lineHeight }
 * @param {object} style
 */
export function drawText(ctx, box, content, style) {
  if (!content || !content.lines?.length) {
    return;
  }
  ctx.save();
  ctx.fillStyle = style.color || '#212121';
  ctx.font = buildFontStyle(style);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = box.x + box.w / 2;
  const { lineHeight } = content;
  const totalH = lineHeight * content.lines.length;
  const startY = box.y + box.h / 2 - totalH / 2 + lineHeight / 2;
  content.lines.forEach((line, i) => {
    ctx.fillText(line.text, cx, startY + i * lineHeight);
  });
  ctx.restore();
}

/**
 * 단일 어노테이션을 layout 기준으로 그린다. 그리기 순서: connector → 도형/박스 → 텍스트.
 * @param {object} ctx canvas 2d context
 * @param {object} annotation 정규화된 어노테이션
 * @param {object} layout computeLayout 결과
 * @param {object} anchor resolveAnchor 결과(데이터 포인트 anchorX/anchorY 보유)
 */
export function renderAnnotation(ctx, annotation, layout, anchor) {
  const { type, style } = annotation;

  if (type === 'circle') {
    drawCircle(ctx, layout.shape, style);
    return;
  }

  // connector 먼저(박스 아래). callout 은 normalize 에서 connector 가 꺼져 있다.
  if (annotation.connector?.enabled && type !== 'callout') {
    drawConnector(ctx, { x: anchor.anchorX, y: anchor.anchorY }, layout.box, annotation.connector);
  }

  if (type === 'callout') {
    drawCallout(ctx, layout.box, layout.tail, style);
  } else {
    // text/badge: text 는 보통 배경 없음(normalize 기본값), badge 는 배경/테두리 있음.
    drawBox(ctx, layout.box, style);
  }

  drawText(ctx, layout.box, layout.content, style);
}
