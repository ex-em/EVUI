import { describe, it, expect } from 'vitest';
import { findVisibleLabelRange } from './scale.utils';

describe('findVisibleLabelRange', () => {
  describe('빈 입력 / 엣지 케이스', () => {
    it('labels가 null이면 sentinel을 반환한다', () => {
      expect(findVisibleLabelRange(null, 0, 100)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('labels가 undefined이면 sentinel을 반환한다', () => {
      expect(findVisibleLabelRange(undefined, 0, 100)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('labels가 빈 배열이면 sentinel을 반환한다', () => {
      expect(findVisibleLabelRange([], 0, 100)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('rangeMin이 유한이 아니면 전 구간을 반환한다', () => {
      expect(findVisibleLabelRange([1, 2, 3], NaN, 100)).toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('rangeMax가 유한이 아니면 전 구간을 반환한다', () => {
      expect(findVisibleLabelRange([1, 2, 3], 0, Infinity)).toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('rangeMin/rangeMax 둘 다 null이면 전 구간을 반환한다', () => {
      expect(findVisibleLabelRange([1, 2, 3], null, null)).toEqual({ minIndex: 0, maxIndex: 2 });
    });
  });

  describe('기본 동작', () => {
    it('range가 모든 labels를 포함하면 전 구간을 반환한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 0, 100)).toEqual({ minIndex: 0, maxIndex: 4 });
    });

    it('range가 labels 중간 구간만 포함하면 해당 인덱스 범위를 반환한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 20, 40)).toEqual({ minIndex: 1, maxIndex: 3 });
    });

    it('range가 labels 앞쪽만 포함하면 0부터의 인덱스 범위를 반환한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 0, 25)).toEqual({ minIndex: 0, maxIndex: 1 });
    });

    it('range가 labels 뒤쪽만 포함하면 마지막까지의 인덱스 범위를 반환한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 35, 100)).toEqual({ minIndex: 3, maxIndex: 4 });
    });
  });

  describe('경계 (inclusive)', () => {
    it('rangeMin이 labels[i]와 정확히 일치하면 그 인덱스를 시작으로 포함한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 20, 40)).toEqual({ minIndex: 1, maxIndex: 3 });
    });

    it('rangeMax가 labels[i]와 정확히 일치하면 그 인덱스를 끝으로 포함한다', () => {
      const labels = [10, 20, 30, 40, 50];
      expect(findVisibleLabelRange(labels, 15, 30)).toEqual({ minIndex: 1, maxIndex: 2 });
    });

    it('rangeMin === labels[0]이면 0부터 시작한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 10, 30)).toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('rangeMax === labels[last]이면 마지막까지 포함한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 0, 30)).toEqual({ minIndex: 0, maxIndex: 2 });
    });
  });

  describe('가시 구간 없음', () => {
    it('rangeMin이 모든 labels보다 크면 sentinel을 반환한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 100, 200)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('rangeMax가 모든 labels보다 작으면 sentinel을 반환한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 0, 5)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('rangeMin > rangeMax(역전)이면 sentinel을 반환한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 30, 10)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('range가 labels 사이 빈 구간을 가리키면 sentinel을 반환한다', () => {
      const labels = [10, 20, 30];
      expect(findVisibleLabelRange(labels, 21, 29)).toEqual({ minIndex: 0, maxIndex: -1 });
    });
  });

  describe('비숫자 / null 가드 (회귀)', () => {
    it('labels 중간에 null이 있어도 정상 인덱스를 반환한다 (null <= number 강제변환 함정 회귀)', () => {
      // null <= rangeMax는 0 <= rangeMax로 강제 변환되어 true가 됨.
      // 가드가 없으면 역방향 스캔이 null 위치를 잘못된 endIdx로 잡음.
      const labels = [10, 20, null, 40, 50];
      expect(findVisibleLabelRange(labels, 15, 45)).toEqual({ minIndex: 1, maxIndex: 3 });
    });

    it('labels 시작에 null이 있어도 첫 유효 인덱스를 시작으로 잡는다', () => {
      const labels = [null, 20, 30, 40];
      expect(findVisibleLabelRange(labels, 0, 35)).toEqual({ minIndex: 1, maxIndex: 2 });
    });

    it('labels 끝에 null이 있어도 마지막 유효 인덱스를 끝으로 잡는다', () => {
      const labels = [10, 20, 30, null];
      expect(findVisibleLabelRange(labels, 0, 100)).toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('labels 전체가 비숫자면 sentinel을 반환한다', () => {
      const labels = [null, undefined, NaN];
      expect(findVisibleLabelRange(labels, 0, 100)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('문자열 원소는 무시한다', () => {
      const labels = [10, '20', 30];
      expect(findVisibleLabelRange(labels, 0, 100)).toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('비유한 range + 비숫자 labels: 정책상 전 구간을 반환한다 (range 미지정 = 전체 그리기)', () => {
      // 비유한 range는 "no user range specified" 신호로 해석되어 labels 유효성과 무관하게
      // 전 구간 인덱스를 반환한다. 비숫자 데이터에 대한 실제 처리는 caller(값 축 좌표 계산)가 담당.
      expect(findVisibleLabelRange([null, undefined, NaN], NaN, Infinity))
        .toEqual({ minIndex: 0, maxIndex: 2 });
    });
  });

  describe('정렬 전제 (caller 책임)', () => {
    it('비정렬 labels는 caller 책임이며 결과는 구현 의존적이다 (이진탐색 가정 위반)', () => {
      // 이 함수는 오름차순 정렬을 전제로 한다.
      // 정렬되지 않은 입력의 결과는 신뢰할 수 없다.
      const labels = [30, 10, 20];
      const result = findVisibleLabelRange(labels, 15, 25);
      // 현재 구현 기준 결과를 고정한다.
      expect(result).toEqual({ minIndex: 2, maxIndex: 2 });
    });
  });

  describe('단일 원소', () => {
    it('단일 label이 range 안이면 0,0을 반환한다', () => {
      expect(findVisibleLabelRange([42], 0, 100)).toEqual({ minIndex: 0, maxIndex: 0 });
    });

    it('단일 label이 range 밖이면 sentinel을 반환한다', () => {
      expect(findVisibleLabelRange([42], 100, 200)).toEqual({ minIndex: 0, maxIndex: -1 });
    });

    it('rangeMin === rangeMax === label이면 0,0을 반환한다', () => {
      expect(findVisibleLabelRange([42], 42, 42)).toEqual({ minIndex: 0, maxIndex: 0 });
    });
  });

  describe('이진탐색 경로 (3-point sample 통과 시)', () => {
    it('대용량 정렬 배열에서 정확한 인덱스를 반환한다', () => {
      const labels = Array.from({ length: 10_000 }, (_, i) => i * 10);
      // window: [12340, 56780] → indices [1234, 5678]
      expect(findVisibleLabelRange(labels, 12340, 56780))
        .toEqual({ minIndex: 1234, maxIndex: 5678 });
    });

    it('range 경계가 정확히 라벨 값과 일치하면 inclusive로 잡는다', () => {
      const labels = Array.from({ length: 1000 }, (_, i) => i);
      expect(findVisibleLabelRange(labels, 100, 200))
        .toEqual({ minIndex: 100, maxIndex: 200 });
    });

    it('range가 인접 두 라벨 사이에 끼면 sentinel을 반환한다', () => {
      const labels = [0, 10, 20, 30];
      expect(findVisibleLabelRange(labels, 11, 19))
        .toEqual({ minIndex: 0, maxIndex: -1 });
    });
  });

  describe('timestamp 시나리오 (TimeScale 사용 패턴)', () => {
    it('timestamp 배열에서 윈도우 안의 인덱스를 반환한다', () => {
      const base = 1_700_000_000_000;
      const HOUR = 3_600_000;
      const labels = Array.from({ length: 10 }, (_, i) => base + i * HOUR);
      // window: index 3 ~ 7
      const rangeMin = base + 3 * HOUR;
      const rangeMax = base + 7 * HOUR;
      expect(findVisibleLabelRange(labels, rangeMin, rangeMax))
        .toEqual({ minIndex: 3, maxIndex: 7 });
    });

    it('range가 데이터 시작보다 이전이면 0부터 잡는다', () => {
      const base = 1_700_000_000_000;
      const HOUR = 3_600_000;
      const labels = Array.from({ length: 5 }, (_, i) => base + i * HOUR);
      expect(findVisibleLabelRange(labels, base - HOUR, base + 2 * HOUR))
        .toEqual({ minIndex: 0, maxIndex: 2 });
    });

    it('range가 데이터 끝보다 이후면 마지막까지 잡는다', () => {
      const base = 1_700_000_000_000;
      const HOUR = 3_600_000;
      const labels = Array.from({ length: 5 }, (_, i) => base + i * HOUR);
      expect(findVisibleLabelRange(labels, base + 2 * HOUR, base + 10 * HOUR))
        .toEqual({ minIndex: 2, maxIndex: 4 });
    });
  });
});
