/* eslint-disable import/prefer-default-export */

/**
 * arr[i] >= target 이 처음 나오는 인덱스를 찾는다.
 * 없으면 arr.length를 반환한다.
 */
const _lowerBound = (arr, target) => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    // eslint-disable-next-line no-bitwise
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/**
 * arr[i] > target 이 처음 나오는 인덱스를 찾는다.
 * 없으면 arr.length를 반환한다.
 */
const _upperBound = (arr, target) => {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    // eslint-disable-next-line no-bitwise
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/**
 * 숫자가 아닌 값이 섞였을 때 사용하는 안전한 선형 탐색.
 */
const _linearScanRange = (labels, rangeMin, rangeMax) => {
  const startIdx = labels.findIndex(v => Number.isFinite(v) && v >= rangeMin);
  let endIdx = -1;
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const v = labels[i];
    if (Number.isFinite(v) && v <= rangeMax) {
      endIdx = i;
      break;
    }
  }
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return { minIndex: 0, maxIndex: -1 };
  }
  return { minIndex: startIdx, maxIndex: endIdx };
};

/**
 * 정렬된 숫자 labels에서 [rangeMin, rangeMax] 구간 인덱스를 찾는다.
 * bar 렌더링에 쓰는 공통 유틸.
 *
 * 빠른 경로: head/mid/tail 이 모두 숫자면 이진 탐색(O(log n)).
 * 폴백: 하나라도 숫자가 아니면 선형 탐색(O(n)).
 *
 * @param {number[]} labels      오름차순 정렬 가정
 * @param {number}   rangeMin
 * @param {number}   rangeMax
 * @returns {{minIndex: number, maxIndex: number}}
 *   - labels가 비었거나 가시 데이터가 없으면 { minIndex: 0, maxIndex: -1 }.
 *   - rangeMin/rangeMax가 유한이 아니면 전 구간 { 0, length-1 }.
 *
 * 주의:
 * - labels는 정렬되어 있어야 한다.
 * - labels에 숫자가 아닌 값이 섞이면 결과가 틀릴 수 있다.
 */
export const findVisibleLabelRange = (labels, rangeMin, rangeMax) => {
  if (!labels?.length) {
    return { minIndex: 0, maxIndex: -1 };
  }
  if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax)) {
    return { minIndex: 0, maxIndex: labels.length - 1 };
  }

  const len = labels.length;
  // head/mid/tail 이 모두 숫자면 빠른 경로를 사용한다.
  // eslint-disable-next-line no-bitwise
  if (
    !Number.isFinite(labels[0])
    || !Number.isFinite(labels[len - 1])
    // eslint-disable-next-line no-bitwise
    || !Number.isFinite(labels[len >> 1])
  ) {
    return _linearScanRange(labels, rangeMin, rangeMax);
  }

  const start = _lowerBound(labels, rangeMin);
  const end = _upperBound(labels, rangeMax) - 1;
  if (start >= len || start > end) {
    return { minIndex: 0, maxIndex: -1 };
  }
  return { minIndex: start, maxIndex: end };
};

/**
 * 라벨 배열의 식별자(ref/len/head/tail)를 비교한다.
 * shift+push 같이 길이는 보존되지만 내용이 바뀌는 in-place 변형은 head/tail 비교로 검출한다.
 * (참고: 길이를 유지하면서 양 끝이 아닌 중간 원소만 in-place 갱신하는 패턴은 검출 불가.
 *   EVUI 사용 패턴은 배열 교체 / append / shift+push 위주라 실용상 안전.)
 */
const _labelsIdentitySame = (cache, labels, len, head, tail) =>
  cache
  && cache.ref === labels
  && cache.len === len
  && cache.head === head
  && cache.tail === tail;

/**
 * labels 정규화 결과를 식별자(ref/len/head/tail) 기준으로 캐시하는 리졸버를 만든다.
 * drawChart가 매 redraw마다 호출하지만, 라벨이 동일하면 O(n) map을 피한다.
 *
 * @param {(value: any) => number|null} normalizeFn 원소 단위 정규화 함수
 * @returns {(labels: any[]) => any[]} 정규화된 라벨 배열을 반환하는 함수
 */
export const createNormalizedLabelsResolver = (normalizeFn) => {
  let cache = null;
  return (labels) => {
    const len = labels?.length ?? 0;
    const head = len ? labels[0] : undefined;
    const tail = len ? labels[len - 1] : undefined;
    if (_labelsIdentitySame(cache, labels, len, head, tail)) {
      return cache.result;
    }
    const result = (labels ?? []).map(normalizeFn);
    cache = { ref: labels, len, head, tail, result };
    return result;
  };
};

/**
 * findVisibleLabelRange 결과를 (labels identity + rangeMin + rangeMax) 기준으로 캐시한다.
 * drawChart는 매 redraw마다 calculateScaleRange를 호출하므로 (resize / hover / brush 등),
 * 입력이 동일한 동안에는 O(n) 스캔을 1회로 줄여준다.
 */
export const createVisibleIndexResolver = () => {
  let cache = null;
  return (labels, rangeMin, rangeMax) => {
    const len = labels?.length ?? 0;
    const head = len ? labels[0] : undefined;
    const tail = len ? labels[len - 1] : undefined;
    if (
      _labelsIdentitySame(cache, labels, len, head, tail)
      && cache.rangeMin === rangeMin
      && cache.rangeMax === rangeMax
    ) {
      return cache.result;
    }
    const result = findVisibleLabelRange(labels, rangeMin, rangeMax);
    cache = { ref: labels, len, head, tail, rangeMin, rangeMax, result };
    return result;
  };
};
