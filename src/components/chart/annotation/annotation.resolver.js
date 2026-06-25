import { isFunction } from 'lodash-es';
import { axisValueToPixel } from './annotation.axis';

/**
 * position.type === 'series' 일 때 location 을 데이터 인덱스로 환산한다.
 *  - 'start' -> 0
 *  - 'end'   -> data.length - 1
 *  - number  -> [0, length-1] 로 clamp
 * @param {('start'|'end'|number)} location
 * @param {number} length 데이터 길이
 * @returns {number} 인덱스 (length 0 이면 -1)
 */
export function resolveLocationIndex(location, length) {
  if (length <= 0) {
    return -1;
  }
  if (location === 'start') {
    return 0;
  }
  if (location === 'end') {
    return length - 1;
  }
  if (typeof location === 'number' && Number.isInteger(location)) {
    return Math.min(Math.max(location, 0), length - 1);
  }
  return length - 1;
}

/**
 * 어노테이션의 기준점(anchor) 픽셀 좌표를 해석한다. 순수 함수.
 *
 * 반환 좌표는 offsetX/offsetY 가 더해진 최종 위치다. 기준점이 현재 viewport(축 범위) 밖이면
 * isVisible:false 를 반환한다(정책: hide). pixel 은 canvas 좌상단(0,0) 절대 좌표이므로 항상 보인다.
 *
 * @param {object} annotation 정규화된 어노테이션
 * @param {object} ctx 뷰포트 컨텍스트
 * @param {object} ctx.chartRect  { x1, x2, y1, y2, chartWidth, chartHeight }
 * @param {object} ctx.labelOffset { left, right, top, bottom }
 * @param {object} ctx.axesSteps  { x: [{graphMin, graphMax}...], y: [...] }
 * @param {object} ctx.seriesList { [seriesId]: { data: [{xp, yp, x, y}...] } }
 * @returns {{ x: number, y: number, isVisible: boolean, anchorX: number, anchorY: number }}
 *          anchorX/anchorY 는 offset 적용 전의 "원래 기준점"(connector 시작점 계산용).
 */
export function resolveAnchor(annotation, ctx) {
  const hidden = { x: 0, y: 0, anchorX: 0, anchorY: 0, isVisible: false };
  const { position } = annotation;
  if (!position) {
    return hidden;
  }
  const offsetX = position.offsetX || 0;
  const offsetY = position.offsetY || 0;

  if (position.type === 'pixel') {
    const ax = position.x || 0;
    const ay = position.y || 0;
    return { x: ax + offsetX, y: ay + offsetY, anchorX: ax, anchorY: ay, isVisible: true };
  }

  if (position.type === 'axis') {
    const { chartRect, labelOffset } = ctx || {};
    // ctx.axes(타입 포함 디스크립터) 우선, 없으면 axesSteps(linear/time numeric)로 폴백.
    const axisX = ctx?.axes?.x?.[position.xAxisIndex] ?? ctx?.axesSteps?.x?.[position.xAxisIndex];
    const axisY = ctx?.axes?.y?.[position.yAxisIndex] ?? ctx?.axesSteps?.y?.[position.yAxisIndex];
    if (!axisX || !axisY || !chartRect || !labelOffset) {
      return hidden;
    }

    const xArea = chartRect.chartWidth - (labelOffset.left + labelOffset.right);
    const yArea = chartRect.chartHeight - (labelOffset.top + labelOffset.bottom);
    const xAxisPosition = chartRect.x1 + labelOffset.left;
    const yAxisPosition = chartRect.y2 - labelOffset.bottom;

    // 축 타입 인지 변환. 범위 밖이면 null → hide.
    const px = axisValueToPixel(position.xValue, axisX, xArea, xAxisPosition, true);
    const py = axisValueToPixel(position.yValue, axisY, yArea, yAxisPosition, false);
    if (px === null || py === null) {
      return hidden;
    }
    return { x: px + offsetX, y: py + offsetY, anchorX: px, anchorY: py, isVisible: true };
  }

  if (position.type === 'series') {
    const series = ctx?.seriesList?.[position.seriesId];
    if (!series) {
      return hidden;
    }

    // 시리즈가 숨김 상태(범례 토글 또는 옵션 show:false)면 그 시리즈를 추적하는 어노테이션도 그리지 않는다.
    // EVUI 의 가시성 플래그는 series.show 다(범례 클릭이 이 값을 토글). show 가 명시적으로 false 일 때만 숨긴다.
    if (series.show === false) {
      return hidden;
    }

    // 파이/도넛: 조각마다 seriesId 가 다르고 기하는 series 인스턴스에 각도로 저장된다(data 는 배열이 아님).
    // 조각의 바깥 원둘레(outer arc) 위 각도 중간 지점을 기준점으로 한다 — 라벨/콜아웃을 바깥으로 빼기 좋다.
    // (offset 으로 더 바깥으로 밀 수 있다.) hole 과 무관하게 바깥 반지름 기준. location 무시.
    if (series.type === 'pie') {
      const {
        centerX, centerY, radius, startAngle, endAngle,
      } = series;
      if (centerX == null || centerY == null || radius == null
        || startAngle == null || endAngle == null) {
        return hidden;
      }
      let midAngle = (startAngle + endAngle) / 2;
      // 단일 조각(전체 원, sweep≈2π)일 때 mid-angle 이 위/아래(세로)로 떨어져 라벨 공간이 부족하다.
      // 가로 여유가 더 크므로 오른쪽(3시, 0 rad)에 배치한다(offset 으로 좌측 등으로 옮길 수 있음).
      const sweep = Math.abs(endAngle - startAngle);
      if (sweep >= Math.PI * 2 - 1e-6) {
        midAngle = 0;
      }
      const baseX = centerX + Math.cos(midAngle) * radius;
      const baseY = centerY + Math.sin(midAngle) * radius;
      return {
        x: baseX + offsetX, y: baseY + offsetY, anchorX: baseX, anchorY: baseY, isVisible: true,
      };
    }

    const data = series.data;
    if (!Array.isArray(data)) {
      return hidden;
    }
    const idx = resolveLocationIndex(position.location, data.length);
    const pt = idx >= 0 ? data[idx] : null;
    // xp/yp 는 시리즈 기하 계산(computeGeometry) 결과. 줌으로 화면 밖이면 null → hide.
    if (!pt || pt.xp == null || pt.yp == null) {
      return hidden;
    }
    // 기준점은 시리즈 타입에 따라 다르게 잡는다(xp/yp 는 박스형의 좌상단 코너, w/h 는 부호 포함 크기).
    //  - bar : 막대의 '값 끝 가장자리 중심' — 카테고리축은 중앙, 값축은 막대 끝(tip). 막대 위 라벨/콜아웃의
    //          자연스러운 위치다. isHorizontal 로 값축을 판별하며, 양수/음수·스택 막대 모두 부호로 처리된다.
    //  - 그 외 박스형(heatMap 등) : 셀 중심(xp+w/2, yp+h/2)
    //  - line/scatter : w/h 가 null 이므로 점 좌표(xp/yp) 그대로
    let baseX = pt.xp;
    let baseY = pt.yp;
    const hasBox = typeof pt.w === 'number' && typeof pt.h === 'number';
    if (series.type === 'bar' && hasBox) {
      if (series.isHorizontal) {
        baseX = pt.xp + pt.w; // 값축(X): 막대 끝
        baseY = pt.yp + pt.h / 2; // 카테고리축(Y): 중앙
      } else {
        baseX = pt.xp + pt.w / 2; // 카테고리축(X): 중앙
        baseY = pt.yp + pt.h; // 값축(Y): 막대 끝
      }
    } else if (hasBox) {
      baseX = pt.xp + pt.w / 2;
      baseY = pt.yp + pt.h / 2;
    }
    return { x: baseX + offsetX, y: baseY + offsetY, anchorX: baseX, anchorY: baseY, isVisible: true };
  }

  return hidden;
}

/**
 * series 추적 포인트(있으면)에서 토큰 치환/콜백 평가에 쓸 컨텍스트를 만든다.
 * @param {object} annotation 정규화된 어노테이션
 * @param {object} ctx 뷰포트 컨텍스트(resolveAnchor 와 동일)
 * @returns {object} { xValue, yValue, seriesId, seriesName, dataIndex, percentage }
 */
export function buildContentContext(annotation, ctx) {
  const { position } = annotation;
  const base = {
    xValue: null,
    yValue: null,
    seriesId: null,
    seriesName: null,
    dataIndex: -1,
    percentage: null,
  };
  if (!position) {
    return base;
  }
  if (position.type === 'axis') {
    base.xValue = position.xValue;
    base.yValue = position.yValue;
  } else if (position.type === 'series') {
    const series = ctx?.seriesList?.[position.seriesId];
    const data = series?.data;
    base.seriesId = position.seriesId;
    base.seriesName = series?.name ?? null;
    if (series?.type === 'pie') {
      // 파이 조각: 값/비율은 series.data({ o, percentage })에 있다.
      base.yValue = series.data?.o ?? null;
      base.percentage = series.data?.percentage ?? null;
      base.dataIndex = 0;
    } else if (Array.isArray(data)) {
      const idx = resolveLocationIndex(position.location, data.length);
      base.dataIndex = idx;
      if (idx >= 0 && data[idx]) {
        base.xValue = data[idx].x;
        base.yValue = data[idx].y;
      }
    }
  }
  return base;
}

/**
 * content 를 최종 문자열로 해석한다.
 *  - function (ctx) => string : evalCtx 를 인자로 호출
 *  - string : {token} 치환 ({xValue}, {yValue}, {seriesId}, {seriesName}, {dataIndex})
 * 순수 함수.
 * @param {string|Function} content 정규화된 content
 * @param {object} evalCtx buildContentContext 결과
 * @returns {string}
 */
export function resolveContent(content, evalCtx = {}) {
  if (isFunction(content)) {
    try {
      const out = content(evalCtx);
      return out == null ? '' : String(out);
    } catch (e) {
      return '';
    }
  }
  if (typeof content !== 'string') {
    return content == null ? '' : String(content);
  }
  return content.replace(/\{(\w+)\}/g, (match, token) => {
    if (token in evalCtx && evalCtx[token] != null) {
      return String(evalCtx[token]);
    }
    return match; // 알 수 없는 토큰은 원문 유지
  });
}
