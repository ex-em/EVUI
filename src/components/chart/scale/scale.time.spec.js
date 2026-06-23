import dayjs from 'dayjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Util from '../helpers/helpers.util';
import TimeScale from './scale.time';

const createScale = (overrides = {}) => {
  const scale = Object.create(TimeScale.prototype);
  scale.interval = null;
  scale.range = null;
  scale.fixedSteps = false;
  scale.labelStyle = {};
  scale.options = { type: 'line' };
  Object.assign(scale, overrides);
  return scale;
};

/** 날짜 문자열을 timestamp로 변환하는 헬퍼 */
const ts = (str) => dayjs(str).valueOf();

beforeEach(() => {
  vi.spyOn(Util, 'calcTextSizeCanvas').mockReturnValue({ width: 2, height: 2 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TimeScale', () => {
  describe('calculateScaleRange', () => {
    it('데이터 범위가 없고 사용자 range도 없으면 빈 축 범위를 반환한다', () => {
      const scale = createScale();

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBeNull();
      expect(result.max).toBeNull();
      expect(result.minLabel).toBe('');
      expect(result.maxLabel).toBe('');
    });

    it('사용자 range가 있으면 데이터가 없어도 지정 범위를 유지한다', () => {
      const scale = createScale({
        range: [0, 3600000],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(0);
      expect(result.max).toBe(3600000);
    });

    it('사용자 range가 dayjs 객체여도 timestamp로 정규화한다', () => {
      const start = dayjs().subtract(1, 'hour');
      const end = dayjs();
      const scale = createScale({
        range: [start, end],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(start.valueOf());
      expect(result.max).toBe(end.valueOf());
    });

    it('사용자 range가 문자열이어도 timestamp로 정규화한다', () => {
      const start = '2026-04-07 13:00:00';
      const end = '2026-04-07 14:00:00';
      const scale = createScale({
        range: [start, end],
        timeFormat: 'DD HH:mm',
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(dayjs(start).valueOf());
      expect(result.max).toBe(dayjs(end).valueOf());
    });
  });

  describe('normalizeTimeValue', () => {
    it('null은 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(null)).toBeNull();
    });

    it('undefined는 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(undefined)).toBeNull();
    });

    it('NaN은 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(NaN)).toBeNull();
    });

    it('Infinity는 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(Infinity)).toBeNull();
    });

    it('-Infinity는 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(-Infinity)).toBeNull();
    });

    it('유한한 숫자는 그대로 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue(1000)).toBe(1000);
    });

    it('유효하지 않은 날짜 문자열은 null을 반환한다', () => {
      const scale = createScale();
      expect(scale.normalizeTimeValue('not-a-date')).toBeNull();
    });

    it('dayjs 객체를 timestamp로 변환한다', () => {
      const scale = createScale();
      const d = dayjs('2026-04-23 10:00:00');
      expect(scale.normalizeTimeValue(d)).toBe(d.valueOf());
    });

    it('ISO 문자열을 timestamp로 변환한다', () => {
      const scale = createScale();
      const str = '2026-04-23T10:00:00';
      expect(scale.normalizeTimeValue(str)).toBe(dayjs(str).valueOf());
    });
  });

  describe('calculateSteps', () => {
    describe('빈 입력 / 엣지 케이스', () => {
      it('축 범위가 비어 있으면 tick을 생성하지 않는다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: null,
          maxValue: null,
          maxSteps: 5,
        });

        expect(result.steps).toBe(0);
        expect(result.graphMin).toBeNull();
        expect(result.graphMax).toBeNull();
        expect(result.ticks).toEqual([]);
      });

      it('graphMin >= graphMax이면 빈 ticks를 반환한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 10:00'),
          maxValue: ts('2026-04-23 10:00'),
          maxSteps: 5,
        });

        expect(result.steps).toBe(0);
        expect(result.ticks).toEqual([]);
      });
    });

    describe('graphMin/graphMax 불변', () => {
      it('string interval에서 graphMin/graphMax가 변경되지 않는다', () => {
        const min = ts('2026-04-23 03:03:03');
        const max = ts('2026-04-23 06:03:03');
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: min,
          maxValue: max,
          maxSteps: 10,
        });

        expect(result.graphMin).toBe(min);
        expect(result.graphMax).toBe(max);
      });

      it('number interval에서 graphMin/graphMax가 변경되지 않는다', () => {
        const min = ts('2026-04-23 03:03:03');
        const max = ts('2026-04-23 03:10:00');
        const scale = createScale({ interval: 60000 });

        const result = scale.calculateSteps({
          minValue: min,
          maxValue: max,
          maxSteps: 10,
        });

        expect(result.graphMin).toBe(min);
        expect(result.graphMax).toBe(max);
      });

      it('interval 확장 과정에서도 graphMax가 증가하지 않는다', () => {
        const min = ts('2026-04-23 00:00');
        const max = ts('2026-04-23 10:00');
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: min,
          maxValue: max,
          maxSteps: 3,
        });

        expect(result.graphMin).toBe(min);
        expect(result.graphMax).toBe(max);
      });
    });

    describe('string interval — boundary 정렬', () => {
      it('hour interval: 정각 boundary에 맞는 tick만 생성한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:03:03'),
          maxValue: ts('2026-04-23 06:03:03'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 04:00:00'),
          ts('2026-04-23 05:00:00'),
          ts('2026-04-23 06:00:00'),
        ]);
        expect(result.steps).toBe(2);
      });

      it('minute interval: 분 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'minute' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 10:00:30'),
          maxValue: ts('2026-04-23 10:03:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 10:01:00'),
          ts('2026-04-23 10:02:00'),
          ts('2026-04-23 10:03:00'),
        ]);
      });

      it('day interval: 자정 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'day' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 05:00:00'),
          maxValue: ts('2026-04-26 20:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-24 00:00:00'),
          ts('2026-04-25 00:00:00'),
          ts('2026-04-26 00:00:00'),
        ]);
      });

      it('month interval: 1일 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'month' });

        const result = scale.calculateSteps({
          minValue: ts('2026-01-15 00:00:00'),
          maxValue: ts('2026-04-15 00:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-02-01 00:00:00'),
          ts('2026-03-01 00:00:00'),
          ts('2026-04-01 00:00:00'),
        ]);
      });

      it('year interval: 1월 1일 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'year' });

        const result = scale.calculateSteps({
          minValue: ts('2024-06-01 00:00:00'),
          maxValue: ts('2027-06-01 00:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2025-01-01 00:00:00'),
          ts('2026-01-01 00:00:00'),
          ts('2027-01-01 00:00:00'),
        ]);
      });

      it('graphMin이 정확히 boundary와 같으면 포함한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:00:00'),
          maxValue: ts('2026-04-23 06:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks[0]).toBe(ts('2026-04-23 03:00:00'));
        expect(result.ticks).toHaveLength(4);
      });

      it('graphMax가 정확히 boundary와 같으면 포함한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:30:00'),
          maxValue: ts('2026-04-23 06:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks[result.ticks.length - 1]).toBe(ts('2026-04-23 06:00:00'));
      });
    });

    describe('object interval — boundary 정렬', () => {
      it('{ time: 2, unit: "hour" }: 2시간 간격으로 tick을 생성한다', () => {
        const scale = createScale({ interval: { time: 2, unit: 'hour' } });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 00:00:00'),
          ts('2026-04-23 02:00:00'),
          ts('2026-04-23 04:00:00'),
          ts('2026-04-23 06:00:00'),
          ts('2026-04-23 08:00:00'),
          ts('2026-04-23 10:00:00'),
        ]);
      });

      it('{ time: 10, unit: "minute" }: 10분 배수 boundary에 맞춘다 (graphMin + n*interval 아님)', () => {
        const scale = createScale({ interval: { time: 10, unit: 'minute' } });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 12:56:00'),
          maxValue: ts('2026-04-23 13:56:00'),
          maxSteps: 10,
        });

        // 12:56 → 첫 tick은 13:00 (10분 배수), 12:56이 아님
        expect(result.ticks).toEqual([
          ts('2026-04-23 13:00:00'),
          ts('2026-04-23 13:10:00'),
          ts('2026-04-23 13:20:00'),
          ts('2026-04-23 13:30:00'),
          ts('2026-04-23 13:40:00'),
          ts('2026-04-23 13:50:00'),
        ]);
      });

      it('{ time: 3, unit: "hour" }: 3시간 배수 boundary에 맞춘다', () => {
        const scale = createScale({ interval: { time: 3, unit: 'hour' } });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 14:23:00'),
          maxValue: ts('2026-04-24 02:00:00'),
          maxSteps: 10,
        });

        // 14:23 → 첫 tick은 15:00 (3시간 배수: 0,3,6,9,12,15,18,21)
        expect(result.ticks[0]).toBe(ts('2026-04-23 15:00:00'));
        expect(result.ticks[1]).toBe(ts('2026-04-23 18:00:00'));
        expect(result.ticks[2]).toBe(ts('2026-04-23 21:00:00'));
        expect(result.ticks[3]).toBe(ts('2026-04-24 00:00:00'));
      });

      it('{ time: 3, unit: "month" }: 3개월(quarter) 간격으로 tick을 생성한다', () => {
        const scale = createScale({ interval: { time: 3, unit: 'month' } });

        const result = scale.calculateSteps({
          minValue: ts('2026-01-01 00:00:00'),
          maxValue: ts('2026-12-31 23:59:59'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-01-01 00:00:00'),
          ts('2026-04-01 00:00:00'),
          ts('2026-07-01 00:00:00'),
          ts('2026-10-01 00:00:00'),
        ]);
      });
    });

    describe('maxSteps 확장 시 boundary 정렬', () => {
      it('interval: "minute" + maxSteps 초과 시 첫 tick은 확장된 interval boundary에 정렬된다', () => {
        // graphMin(12:52)은 1분 boundary에 정렬되어 있으나, maxSteps 초과로
        // interval이 확장된다. 확장 후보는 "하루를 나누어떨어지는 base의 배수"로
        // 제한되어(위상 독립 + 자정 경계 점프 없음) worst-case tick 수가 maxSteps를
        // 넘지 않는 최소 약수가 선택된다. W=60분, maxSteps=6에서는 12분(1440의 약수,
        // floor(60/12)+1=6)이 선택된다(11분은 하루를 못 나누므로 제외).
        const scale = createScale({ interval: 'minute' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 12:52:00'),
          maxValue: ts('2026-04-23 13:52:00'),
          maxSteps: 6,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 13:00:00'),
          ts('2026-04-23 13:12:00'),
          ts('2026-04-23 13:24:00'),
          ts('2026-04-23 13:36:00'),
          ts('2026-04-23 13:48:00'),
        ]);
        expect(result.interval).toBe(12 * 60 * 1000);
        expect(result.ticks.length).toBeLessThanOrEqual(6);
        // 확장 interval은 하루를 나누어떨어져야 한다(자정 점프 방지)
        expect((24 * 60 * 60 * 1000) % result.interval).toBe(0);

        // 모든 tick은 확장 interval 간격으로 균등 배치
        for (let i = 1; i < result.ticks.length; i++) {
          expect(result.ticks[i] - result.ticks[i - 1]).toBe(result.interval);
        }
      });

      it('graphMin은 변경되지 않고, 첫 tick만 확장 interval boundary로 정렬된다', () => {
        // 실시간 차트 시나리오: graphMin이 소폭 변해도 tick은 절대 시간
        // boundary에 고정되어야 시각적으로 안정적이다.
        const scale = createScale({ interval: 'minute' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 12:52:00'),
          maxValue: ts('2026-04-23 13:52:00'),
          maxSteps: 6,
        });

        // graphMin/graphMax는 원래 값 유지
        expect(result.graphMin).toBe(ts('2026-04-23 12:52:00'));
        expect(result.graphMax).toBe(ts('2026-04-23 13:52:00'));

        // 첫 tick은 graphMin과 달라야 함 (확장 boundary로 재정렬됨)
        expect(result.ticks[0]).not.toBe(result.graphMin);
        expect(result.ticks[0]).toBeGreaterThan(result.graphMin);

        // 확장 interval 기준 절대 boundary(= day 시작 기준 interval 배수)에 정렬
        const dayStart = dayjs(result.graphMin).startOf('day').valueOf();
        result.ticks.forEach((tick) => {
          expect((tick - dayStart) % result.interval).toBe(0);
        });
      });

      it('슬라이딩 윈도우: 폭/maxSteps가 같으면 위치가 달라도 interval/정렬이 유지된다', () => {
        // 실시간 차트(5초마다 데이터 유입)에서 동일한 폭(10분)의 윈도우가 흐를 때,
        // 윈도우 위치(phase)에 따라 interval이나 tick 정렬이 바뀌면 안 된다.
        // (예: 0/4/8 → 3/6/9 로 라벨이 통째로 바뀌는 현상 방지)
        const scale = createScale({ interval: 'minute' });
        const WINDOW = 10 * 60 * 1000; // 10분
        const STEP = 5 * 1000; // 5초

        const base = ts('2026-04-23 12:00:00');
        const results = [];
        for (let i = 0; i < 24; i++) {
          const min = base + i * STEP;
          results.push(scale.calculateSteps({
            minValue: min,
            maxValue: min + WINDOW,
            maxSteps: 3,
          }));
        }

        const dayStart = dayjs(base).startOf('day').valueOf();
        results.forEach((result) => {
          // interval은 위치와 무관하게 동일해야 한다.
          expect(result.interval).toBe(results[0].interval);
          // 모든 tick은 동일한 절대 boundary 격자(day 시작 기준 interval 배수)에 정렬.
          result.ticks.forEach((tick) => {
            expect((tick - dayStart) % result.interval).toBe(0);
          });
          // 계약: tick 수는 maxSteps 이하.
          expect(result.ticks.length).toBeLessThanOrEqual(3);
        });
      });

      it('확장 interval은 하루를 나누어떨어진다: 자정을 넘어도 라벨이 점프하지 않는다', () => {
        // 버그 재현 시나리오: interval=1h, 폭≈59h, maxSteps=3에서 기존 로직은
        // 20h(=24를 못 나눔)로 확장되어, 윈도우가 자정을 넘는 순간 anchor가 24h
        // 이동하며 모든 라벨이 4h씩 점프했다. 이제 하루의 약수(24h)로 확장되어
        // 자정 기준점이 바뀌어도 동일한 절대 격자에 머문다.
        const scale = createScale({ interval: { time: 1, unit: 'hour' } });
        const WINDOW = 59 * 60 * 60 * 1000;
        const STEP = 60 * 60 * 1000; // 1시간씩 이동(자정 횡단 포함)

        const base = ts('2026-04-23 23:37:00');
        const results = [];
        for (let i = 0; i < 6; i++) {
          const min = base + i * STEP;
          results.push(scale.calculateSteps({
            minValue: min,
            maxValue: min + WINDOW,
            maxSteps: 3,
          }));
        }

        const DAY = 24 * 60 * 60 * 1000;
        // 모든 윈도우 위치가 공유하는 단일 고정 기준점.
        const fixedAnchor = dayjs(base).startOf('day').valueOf();
        results.forEach((result) => {
          // 확장 interval은 위치와 무관하게 동일하고 하루를 나누어떨어진다.
          expect(result.interval).toBe(results[0].interval);
          expect(DAY % result.interval).toBe(0);
          expect(result.ticks.length).toBeLessThanOrEqual(3);
          // 모든 위치의 tick이 동일한 절대 격자에 정렬 → 자정 점프 없음.
          result.ticks.forEach((tick) => {
            expect((tick - fixedAnchor) % result.interval).toBe(0);
          });
        });
      });
    });

    describe('number interval — boundary 정렬 없음', () => {
      it('60000ms(1분): Math.ceil 기반으로 firstTick을 계산한다', () => {
        const scale = createScale({ interval: 60000 });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:03:03'),
          maxValue: ts('2026-04-23 03:10:00'),
          maxSteps: 10,
        });

        expect(result.ticks[0]).toBe(ts('2026-04-23 03:04:00'));
        expect(result.ticks[result.ticks.length - 1]).toBe(ts('2026-04-23 03:10:00'));
        expect(result.ticks).toHaveLength(7);
      });
    });

    describe('auto interval — 사용자 interval 없음', () => {
      it('interval 미지정 시 자동 계산하고 ticks를 생성한다', () => {
        const scale = createScale();

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
        expect(result.ticks.length).toBeLessThanOrEqual(5);
        expect(result.ticks.every((t) => t >= result.graphMin && t <= result.graphMax)).toBe(true);
      });
    });

    describe('maxSteps 처리 — interval strict 배수 확장', () => {
      it('tick 개수 초과 시 interval을 확장한다 (skip 아닌 재생성)', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 3,
        });

        // 11개 → 확장 → 3개 이하
        expect(result.ticks.length).toBeLessThanOrEqual(3);
        expect(result.ticks).toEqual([
          ts('2026-04-23 00:00:00'),
          ts('2026-04-23 04:00:00'),
          ts('2026-04-23 08:00:00'),
        ]);
        expect(result.interval).toBe(result.baseInterval * 4);
      });

      it('확장된 interval은 baseInterval의 정수 배수이다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-24 00:00:00'),
          maxSteps: 5,
        });

        expect(result.interval % result.baseInterval).toBe(0);
      });

      it('tick 제거 로직 없이 interval 확장만으로 해결한다', () => {
        const scale = createScale({ interval: 'minute' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 10:00:00'),
          maxValue: ts('2026-04-23 11:00:00'),
          maxSteps: 4,
        });

        // 모든 tick이 interval 간격으로 균등 배치되어야 함
        for (let i = 1; i < result.ticks.length; i++) {
          expect(result.ticks[i] - result.ticks[i - 1]).toBe(result.interval);
        }
      });
    });

    describe('fixedSteps', () => {
      it('fixedSteps가 true이면 maxSteps를 넘어도 interval을 확장하지 않는다', () => {
        const scale = createScale({ interval: 'hour', fixedSteps: true });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 3,
        });

        // maxSteps(3)를 넘지만 fixedSteps이므로 확장하지 않음
        expect(result.ticks.length).toBeGreaterThan(3);
        expect(result.baseInterval).toBe(result.interval);
      });
    });

    describe('ticks.length === 1 (steps === 0)', () => {
      it('범위 내 tick이 1개면 steps=0, ticks=[tick]을 반환한다', () => {
        const scale = createScale({ interval: 'day' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 01:00:00'),
          maxValue: ts('2026-04-23 23:00:00'),
          maxSteps: 10,
        });

        // 하루 범위 안에 day boundary(자정)가 없음 → tick 0개? 아니, 다음날 자정은 23:00 이후
        // 실제로는 범위 내에 day boundary가 없으므로 0개
        expect(result.ticks).toEqual([]);
        expect(result.steps).toBe(0);
      });

      it('범위 내 정확히 1개 tick만 있으면 steps=0이다', () => {
        const scale = createScale({ interval: 'day' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 01:00:00'),
          maxValue: ts('2026-04-24 01:00:00'),
          maxSteps: 10,
        });

        // 2026-04-24 00:00:00 하나만 범위 안에 있음
        expect(result.ticks).toEqual([ts('2026-04-24 00:00:00')]);
        expect(result.steps).toBe(0);
      });
    });

    describe('반환값 구조', () => {
      it('steps, interval, baseInterval, graphMin, graphMax, ticks를 모두 반환한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 05:00:00'),
          maxSteps: 10,
        });

        expect(result).toHaveProperty('steps');
        expect(result).toHaveProperty('interval');
        expect(result).toHaveProperty('baseInterval');
        expect(result).toHaveProperty('graphMin');
        expect(result).toHaveProperty('graphMax');
        expect(result).toHaveProperty('ticks');
        expect(result.steps).toBe(result.ticks.length - 1);
      });
    });

    describe('week boundary', () => {
      it('week interval: Monday 00:00 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'week' });

        const result = scale.calculateSteps({
          // 2026-04-22 = Wednesday
          minValue: ts('2026-04-22 00:00:00'),
          maxValue: ts('2026-05-13 00:00:00'),
          maxSteps: 10,
        });

        // Monday boundaries
        result.ticks.forEach((tick) => {
          expect(dayjs(tick).day()).toBe(1); // Monday
          expect(dayjs(tick).hour()).toBe(0);
          expect(dayjs(tick).minute()).toBe(0);
        });
      });
    });

    describe('quarter boundary', () => {
      it('quarter interval: 1/1, 4/1, 7/1, 10/1 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'quarter' });

        const result = scale.calculateSteps({
          minValue: ts('2025-01-01 00:00:00'),
          maxValue: ts('2026-12-31 00:00:00'),
          maxSteps: 20,
        });

        const quarterMonths = [0, 3, 6, 9]; // JS month: 0-indexed
        result.ticks.forEach((tick) => {
          const d = dayjs(tick);
          expect(quarterMonths).toContain(d.month());
          expect(d.date()).toBe(1);
          expect(d.hour()).toBe(0);
        });
      });
    });

    describe('잘못된 interval 입력', () => {
      it('존재하지 않는 string interval은 auto로 fallback한다', () => {
        const scale = createScale({ interval: 'invalid_unit' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
        expect(result.ticks.length).toBeLessThanOrEqual(5);
      });

      it('object interval에 unit이 없으면 auto로 fallback한다', () => {
        const scale = createScale({ interval: { time: 5 } });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
      });

      it('object interval에 잘못된 unit이면 auto로 fallback한다', () => {
        const scale = createScale({ interval: { time: 1, unit: 'invalid' } });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
      });

      it('number interval이 0이면 auto로 fallback한다', () => {
        const scale = createScale({ interval: 0 });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
      });

      it('number interval이 음수이면 auto로 fallback한다', () => {
        const scale = createScale({ interval: -1000 });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 10:00:00'),
          maxSteps: 5,
        });

        expect(result.ticks.length).toBeGreaterThan(0);
      });
    });

    describe('second interval boundary', () => {
      it('second interval: 초 boundary에 맞는 tick을 생성한다', () => {
        const scale = createScale({ interval: 'second' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 10:00:00') + 500,
          maxValue: ts('2026-04-23 10:00:03'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 10:00:01'),
          ts('2026-04-23 10:00:02'),
          ts('2026-04-23 10:00:03'),
        ]);
      });
    });

    describe('범위가 interval보다 작은 경우', () => {
      it('범위가 interval보다 작으면 tick이 없을 수 있다', () => {
        const scale = createScale({ interval: 'day' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 10:00:00'),
          maxValue: ts('2026-04-23 15:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([]);
        expect(result.steps).toBe(0);
      });
    });

    describe('경계 횡단', () => {
      it('hour interval이 자정을 넘어도 정상 동작한다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 22:30:00'),
          maxValue: ts('2026-04-24 02:30:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-04-23 23:00:00'),
          ts('2026-04-24 00:00:00'),
          ts('2026-04-24 01:00:00'),
          ts('2026-04-24 02:00:00'),
        ]);
      });

      it('month interval이 연도 경계를 넘어도 정상 동작한다', () => {
        const scale = createScale({ interval: 'month' });

        const result = scale.calculateSteps({
          minValue: ts('2025-11-15 00:00:00'),
          maxValue: ts('2026-03-15 00:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2025-12-01 00:00:00'),
          ts('2026-01-01 00:00:00'),
          ts('2026-02-01 00:00:00'),
          ts('2026-03-01 00:00:00'),
        ]);
      });

      it('day interval이 월 경계를 넘어도 정상 동작한다', () => {
        const scale = createScale({ interval: 'day' });

        const result = scale.calculateSteps({
          minValue: ts('2026-01-30 12:00:00'),
          maxValue: ts('2026-02-02 12:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2026-01-31 00:00:00'),
          ts('2026-02-01 00:00:00'),
          ts('2026-02-02 00:00:00'),
        ]);
      });

      it('week interval이 연말-연초를 넘어도 Monday boundary를 유지한다', () => {
        const scale = createScale({ interval: 'week' });

        const result = scale.calculateSteps({
          minValue: ts('2025-12-25 00:00:00'),
          maxValue: ts('2026-01-15 00:00:00'),
          maxSteps: 10,
        });

        result.ticks.forEach((tick) => {
          expect(dayjs(tick).day()).toBe(1); // Monday
        });
        expect(result.ticks.length).toBeGreaterThan(0);
      });
    });

    describe('maxSteps 경계값', () => {
      it('maxSteps가 0이면 1로 보정된다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 05:00:00'),
          maxSteps: 0,
        });

        expect(result.ticks.length).toBeLessThanOrEqual(1);
      });

      it('maxSteps가 음수이면 1로 보정된다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 05:00:00'),
          maxSteps: -5,
        });

        expect(result.ticks.length).toBeLessThanOrEqual(1);
      });

      it('maxSteps가 null이면 1로 보정된다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-23 05:00:00'),
          maxSteps: null,
        });

        expect(result.ticks.length).toBeLessThanOrEqual(1);
      });
    });

    describe('year boundary (epoch 2000 기반)', () => {
      it('{ time: 2, unit: "year" }: 짝수년도 boundary에 정렬된다', () => {
        const scale = createScale({ interval: { time: 2, unit: 'year' } });

        const result = scale.calculateSteps({
          minValue: ts('2023-06-01 00:00:00'),
          maxValue: ts('2029-06-01 00:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2024-01-01 00:00:00'),
          ts('2026-01-01 00:00:00'),
          ts('2028-01-01 00:00:00'),
        ]);
      });

      it('{ time: 5, unit: "year" }: 5년 배수 boundary에 정렬된다', () => {
        const scale = createScale({ interval: { time: 5, unit: 'year' } });

        const result = scale.calculateSteps({
          minValue: ts('2018-01-01 00:00:00'),
          maxValue: ts('2032-01-01 00:00:00'),
          maxSteps: 10,
        });

        expect(result.ticks).toEqual([
          ts('2020-01-01 00:00:00'),
          ts('2025-01-01 00:00:00'),
          ts('2030-01-01 00:00:00'),
        ]);
      });
    });

    describe('string/object interval 일관성', () => {
      it('interval: "hour"와 { time: 1, unit: "hour" }는 동일한 ticks를 생성한다', () => {
        const range = {
          minValue: ts('2026-04-23 03:30:00'),
          maxValue: ts('2026-04-23 08:30:00'),
          maxSteps: 10,
        };

        const stringResult = createScale({ interval: 'hour' }).calculateSteps(range);
        const objectResult = createScale({ interval: { time: 1, unit: 'hour' } })
          .calculateSteps(range);

        expect(stringResult.ticks).toEqual(objectResult.ticks);
      });
    });

    describe('tick 정렬 순서', () => {
      it('ticks는 오름차순으로 정렬되어 있다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 00:00:00'),
          maxValue: ts('2026-04-24 00:00:00'),
          maxSteps: 30,
        });

        for (let i = 1; i < result.ticks.length; i++) {
          expect(result.ticks[i]).toBeGreaterThan(result.ticks[i - 1]);
        }
      });
    });

    describe('visible tick 범위 검증', () => {
      it('모든 tick은 graphMin 이상 graphMax 이하이다', () => {
        const scale = createScale({ interval: 'hour' });

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:03:03'),
          maxValue: ts('2026-04-23 18:45:00'),
          maxSteps: 20,
        });

        result.ticks.forEach((tick) => {
          expect(tick).toBeGreaterThanOrEqual(result.graphMin);
          expect(tick).toBeLessThanOrEqual(result.graphMax);
        });
      });

      it('graphMax 초과 tick은 포함되지 않는다', () => {
        const scale = createScale({ interval: 'hour' });
        const max = ts('2026-04-23 05:30:00');

        const result = scale.calculateSteps({
          minValue: ts('2026-04-23 03:00:00'),
          maxValue: max,
          maxSteps: 10,
        });

        // 06:00은 포함되면 안됨
        expect(result.ticks).not.toContain(ts('2026-04-23 06:00:00'));
        expect(result.ticks[result.ticks.length - 1]).toBe(ts('2026-04-23 05:00:00'));
      });
    });
  });
});
