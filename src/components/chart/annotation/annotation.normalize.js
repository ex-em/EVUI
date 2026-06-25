import { cloneDeep, defaultsDeep, isFunction } from 'lodash-es';
import {
  ANNOTATION_TYPES,
  POSITION_TYPES,
  CONNECTOR_TYPES,
  CALLOUT_ANCHORS,
  SERIES_LOCATIONS,
  ANNOTATION_DEFAULT,
  POSITION_DEFAULT,
  CONNECTOR_DEFAULT,
} from './annotation.constant';

/**
 * padding 입력을 내부 표준인 [top, right, bottom, left] 4-튜플로 정규화한다.
 *  - number n        -> [n, n, n, n]
 *  - [v, h]          -> [v, h, v, h]
 *  - [t, r, b, l]    -> 그대로
 *  - 그 외/누락       -> [0, 0, 0, 0]
 * @param {number|number[]} padding
 * @returns {number[]} [top, right, bottom, left]
 */
export function normalizePadding(padding) {
  if (typeof padding === 'number' && Number.isFinite(padding)) {
    return [padding, padding, padding, padding];
  }
  if (Array.isArray(padding)) {
    const nums = padding.map(p => (Number.isFinite(p) ? p : 0));
    if (nums.length === 2) {
      return [nums[0], nums[1], nums[0], nums[1]];
    }
    if (nums.length >= 4) {
      return [nums[0], nums[1], nums[2], nums[3]];
    }
    if (nums.length === 1) {
      return [nums[0], nums[0], nums[0], nums[0]];
    }
  }
  return [0, 0, 0, 0];
}

/**
 * position.type 별 필수 필드 검증. 누락 시 경고 메시지를 push 한다(throw 하지 않음).
 * @param {object} position 정규화된 position
 * @param {string} id       어노테이션 id (경고 메시지용)
 * @param {string[]} warnings 경고 누적 배열
 */
function validatePosition(position, id, warnings) {
  if (!POSITION_TYPES.includes(position.type)) {
    warnings.push(`[annotation:${id}] unknown position.type "${position.type}" — fallback to "pixel".`);
    position.type = 'pixel';
  }

  if (position.type === 'axis') {
    if (position.xValue == null && position.yValue == null) {
      warnings.push(`[annotation:${id}] position.type "axis" requires xValue and/or yValue.`);
    }
  } else if (position.type === 'series') {
    if (position.seriesId == null) {
      warnings.push(`[annotation:${id}] position.type "series" requires seriesId.`);
    }
    const loc = position.location;
    const validLoc = SERIES_LOCATIONS.includes(loc) || (typeof loc === 'number' && Number.isInteger(loc));
    if (!validLoc) {
      warnings.push(`[annotation:${id}] invalid location "${loc}" — fallback to "end".`);
      position.location = 'end';
    }
  }
}

/**
 * 단일 어노테이션을 정규화한다.
 * @param {object} raw   사용자가 넘긴 raw 어노테이션
 * @param {number} index 배열 내 인덱스 (id 자동 생성용)
 * @param {string[]} warnings 경고 누적 배열
 * @returns {object} 내부 표준 어노테이션 모델
 */
function normalizeOne(raw, index, warnings) {
  const id = raw.id != null ? String(raw.id) : `annotation-${index}`;

  let type = raw.type;
  if (!ANNOTATION_TYPES.includes(type)) {
    warnings.push(`[annotation:${id}] unknown type "${type}" — fallback to "text".`);
    type = 'text';
  }

  // 1) style: type 별 Default Config 와 deepMerge
  const style = defaultsDeep({}, cloneDeep(raw.style) || {}, ANNOTATION_DEFAULT[type].style);
  if ('padding' in style) {
    style.padding = normalizePadding(style.padding);
  }
  if (type === 'callout' && !CALLOUT_ANCHORS.includes(style.anchor)) {
    warnings.push(`[annotation:${id}] invalid style.anchor "${style.anchor}" — fallback to "auto".`);
    style.anchor = 'auto';
  }

  // 2) position: 기본값 병합 + 검증
  const position = defaultsDeep({}, cloneDeep(raw.position) || {}, POSITION_DEFAULT);
  validatePosition(position, id, warnings);

  // 3) connector: 기본값 병합
  const connector = defaultsDeep({}, cloneDeep(raw.connector) || {}, CONNECTOR_DEFAULT);
  if (!CONNECTOR_TYPES.includes(connector.type)) {
    warnings.push(`[annotation:${id}] invalid connector.type "${connector.type}" — fallback to "straight".`);
    connector.type = 'straight';
  }
  // 규칙: callout 의 꼬리가 곧 connector 역할이므로, callout 이면 connector 를 강제 비활성화한다.
  if (type === 'callout' && connector.enabled) {
    warnings.push(`[annotation:${id}] connector is ignored for type "callout" (the arrow acts as the connector).`);
    connector.enabled = false;
  }

  // 4) content: circle 은 무시. string/function 만 허용(그 외는 빈 문자열로).
  let content = raw.content;
  if (type === 'circle') {
    content = '';
  } else if (!isFunction(content) && typeof content !== 'string') {
    content = content == null ? '' : String(content);
  }

  return { id, type, content, position, connector, style };
}

/**
 * 어노테이션 배열을 내부 표준 모델 배열로 정규화한다(선언형 v1: 통째 갱신 → 전체 정규화).
 * 순수 함수 — 캔버스/차트 인스턴스 의존 없음.
 * @param {object[]} rawList options.annotations 원본 배열
 * @returns {{ annotations: object[], warnings: string[] }}
 */
export function normalizeAnnotations(rawList) {
  const warnings = [];
  if (!Array.isArray(rawList)) {
    return { annotations: [], warnings };
  }

  const seenIds = new Set();
  const annotations = rawList
    .filter(raw => raw && typeof raw === 'object')
    .map((raw, index) => normalizeOne(raw, index, warnings));

  // id 중복 경고(선언형 key 용도이므로 유니크해야 한다)
  annotations.forEach((ann) => {
    if (seenIds.has(ann.id)) {
      warnings.push(`[annotation:${ann.id}] duplicate id — annotations should have unique ids.`);
    }
    seenIds.add(ann.id);
  });

  return { annotations, warnings };
}
