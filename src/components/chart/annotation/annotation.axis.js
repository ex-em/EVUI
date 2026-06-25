import dayjs from 'dayjs';
import Canvas from '../helpers/helpers.canvas';

/**
 * 축 디스크립터.
 * @typedef {Object} AxisDescriptor
 * @property {('linear'|'time'|'step'|'log')} [type] 축 타입(기본 linear)
 * @property {number} graphMin 연속축의 표시 최소값(time: timestamp)
 * @property {number} graphMax 연속축의 표시 최대값(time: timestamp)
 * @property {number} [minIndex] step축의 가시 시작 인덱스
 * @property {number} [maxIndex] step축의 가시 끝 인덱스
 * @property {Array<string|number>} [labels] step축의 라벨 배열
 */

/**
 * 어노테이션의 축 값(xValue/yValue)을 좌표 계산용 numeric 값으로 정규화한다.
 *  - time : 문자열/Date 는 dayjs 로 timestamp(ms) 변환, number 는 그대로
 *  - linear/log : Number() 강제, 비유한값은 null
 *  - step : 여기서는 다루지 않음(slot-index 기반이라 stepValueToPixel 참조)
 * @param {*} value
 * @param {AxisDescriptor} axis
 * @returns {number|null}
 */
export function normalizeAxisValue(value, axis) {
  if (value == null) {
    return null;
  }
  const type = axis?.type || 'linear';
  if (type === 'time') {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const t = dayjs(value).valueOf();
    return Number.isFinite(t) ? t : null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * step(카테고리) 축에서 라벨/인덱스 값을 가시 인덱스로 환산한다.
 *  - 라벨 문자열/숫자가 labels 에 있으면 그 인덱스
 *  - labels 에 없고 정수면 raw 인덱스로 간주
 * @param {*} value
 * @param {Array<string|number>} labels
 * @returns {number} 인덱스 (해석 불가 시 -1)
 */
export function resolveStepIndex(value, labels = []) {
  const arr = Array.isArray(labels) ? labels : [];
  const idx = arr.indexOf(value);
  if (idx !== -1) {
    return idx;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  return -1;
}

/**
 * step 축 값 → 픽셀. 카테고리 슬롯의 "중심"에 배치한다(막대 차트 위 어노테이션 직관에 부합).
 * 가시 윈도우([minIndex, maxIndex]) 밖이면 null(hide).
 * @param {*} value
 * @param {AxisDescriptor} axis
 * @param {number} area 축 방향 길이(px)
 * @param {number} startPoint 축 시작 픽셀(x: 좌측 경계, y: 하단 경계)
 * @param {boolean} isX x축이면 true
 * @returns {number|null}
 */
export function stepValueToPixel(value, axis, area, startPoint, isX) {
  const labels = Array.isArray(axis.labels) ? axis.labels : [];
  const minIndex = axis.minIndex ?? 0;
  const maxIndex = axis.maxIndex ?? (labels.length - 1);
  const steps = maxIndex - minIndex + 1;
  if (steps <= 0) {
    return null;
  }
  const idx = resolveStepIndex(value, labels);
  if (idx < minIndex || idx > maxIndex) {
    return null;
  }
  const slot = area / steps;
  const along = slot * (idx - minIndex) + slot / 2;
  // x 는 좌→우(+), y 는 하단 기준 상향(-)으로 진행한다.
  return isX ? Math.round(startPoint + along) : Math.round(startPoint - along);
}

/**
 * 축 타입을 인지하여 축 값을 픽셀 좌표로 변환한다. 범위 밖이면 null(hide 정책).
 *  - step : 슬롯 중심 인덱스 매핑
 *  - time/linear/log : 값 정규화 후 Canvas.calculateX/Y 재사용(시리즈 기하와 동일한 반올림/null 의미)
 * @param {*} value
 * @param {AxisDescriptor} axis
 * @param {number} area
 * @param {number} startPoint
 * @param {boolean} isX
 * @returns {number|null}
 */
export function axisValueToPixel(value, axis, area, startPoint, isX) {
  if (!axis) {
    return null;
  }
  if ((axis.type || 'linear') === 'step') {
    return stepValueToPixel(value, axis, area, startPoint, isX);
  }
  const v = normalizeAxisValue(value, axis);
  if (v === null) {
    return null;
  }
  return isX
    ? Canvas.calculateX(v, axis.graphMin, axis.graphMax, area, startPoint)
    : Canvas.calculateY(v, axis.graphMin, axis.graphMax, area, startPoint);
}
