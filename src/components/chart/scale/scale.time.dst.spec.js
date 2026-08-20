import dayjs from 'dayjs';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import TimeScale from './scale.time';

/**
 * DST 관측 타임존에서 day/week 단위 tick 이 자정에 정렬되는지 검증한다.
 * 프로세스 TZ 를 바꿔야만 재현되므로 다른 spec 과 파일을 분리했다.
 */

// Node 는 TZ 를 한 번 대입하면 delete 로 시스템 존으로 되돌아가지 않는다. 미설정 상태로
// 복원할 방법이 없으므로 진입 시점의 존을 명시 문자열로 잡아 두고 그것으로 되돌린다.
// (복원에 실패하면 같은 워커의 뒤 테스트 파일이 이 파일의 TZ 로 돌아간다)
const ORIGINAL_TZ = process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

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

const ts = (str) => dayjs(str).valueOf();
const times = (ticks) => ticks.map((tick) => dayjs(tick).format('HH:mm'));
const dates = (ticks) => ticks.map((tick) => dayjs(tick).format('YYYY-MM-DD'));
const stamps = (ticks) => ticks.map((tick) => dayjs(tick).format('MM-DD HH:mm'));
const isAscending = (ticks) => ticks.every((tick, i) => i === 0 || tick > ticks[i - 1]);

const useTZ = (tz) => {
  beforeAll(() => {
    process.env.TZ = tz;
  });
  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });
};

describe('TimeScale day/week tick — DST 관측 타임존', () => {
  describe('America/Los_Angeles', () => {
    useTZ('America/Los_Angeles');

    it('TZ 주입이 실제로 적용됐다', () => {
      // 미적용 시 아래 DST 케이스가 전부 위양성 통과한다.
      expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(420); // PDT (UTC-7)
      expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(480); // PST (UTC-8)
    });

    it('봄 전환(2026-03-08)을 포함한 31일 조회: 모든 tick 이 자정이다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-02-20 00:00:00'),
        maxValue: ts('2026-03-23 00:00:00'),
        maxSteps: 40,
      });

      expect(result.ticks.length).toBe(32);
      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      expect(dates(result.ticks)[0]).toBe('2026-02-20');
      expect(dates(result.ticks).at(-1)).toBe('2026-03-23');
    });

    it('봄 전환일의 tick 간격은 23시간이다 (wall-clock 자정 유지의 결과)', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-03-07 00:00:00'),
        maxValue: ts('2026-03-10 00:00:00'),
        maxSteps: 10,
      });

      const gaps = result.ticks.slice(1).map((tick, i) => tick - result.ticks[i]);
      expect(gaps).toEqual([24, 23, 24].map((h) => h * 60 * 60 * 1000));
    });

    it('가을 전환일의 tick 간격은 25시간이다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-10-31 00:00:00'),
        maxValue: ts('2026-11-03 00:00:00'),
        maxSteps: 10,
      });

      const gaps = result.ticks.slice(1).map((tick, i) => tick - result.ticks[i]);
      expect(gaps).toEqual([24, 25, 24].map((h) => h * 60 * 60 * 1000));
    });

    it('가을 전환(2026-11-01)을 포함한 31일 조회: 날짜가 밀리지 않는다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-10-20 00:00:00'),
        maxValue: ts('2026-11-20 00:00:00'),
        maxSteps: 40,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      expect(dates(result.ticks)).toContain('2026-11-01');
      expect(dates(result.ticks)).toContain('2026-11-02');
    });

    it('{ time: 8, unit: day }: 8일 간격도 자정에 정렬된다', () => {
      const scale = createScale({ interval: { time: 8, unit: 'day' } });

      const result = scale.calculateSteps({
        minValue: ts('2026-02-20 00:00:00'),
        maxValue: ts('2026-03-23 00:00:00'),
        maxSteps: 10,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      result.ticks.slice(1).forEach((tick, i) => {
        expect(dayjs(tick).diff(dayjs(result.ticks[i]).add(8, 'day'))).toBe(0);
      });
    });

    it('week interval: 봄 전환을 포함해도 월요일 자정에 정렬된다', () => {
      const scale = createScale({ interval: 'week' });

      const result = scale.calculateSteps({
        minValue: ts('2026-02-20 00:00:00'),
        maxValue: ts('2026-04-20 00:00:00'),
        maxSteps: 40,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      expect(new Set(result.ticks.map((tick) => dayjs(tick).day()))).toEqual(new Set([1]));
      expect(dates(result.ticks)[0]).toBe('2026-02-23');
    });

    it('{ time: 2, unit: week }: 2주 간격도 월요일 자정에 정렬된다', () => {
      const scale = createScale({ interval: { time: 2, unit: 'week' } });

      const result = scale.calculateSteps({
        minValue: ts('2026-02-20 00:00:00'),
        maxValue: ts('2026-04-20 00:00:00'),
        maxSteps: 10,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      result.ticks.slice(1).forEach((tick, i) => {
        expect(dayjs(tick).diff(dayjs(result.ticks[i]).add(14, 'day'))).toBe(0);
      });
    });
  });

  describe('America/Santiago — 자정이 없는 전환일', () => {
    useTZ('America/Santiago');

    it('TZ 주입이 실제로 적용됐다', () => {
      expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(180); // -03 (DST)
      expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(240); // -04 (표준시)
    });

    it('전환일(2026-09-06)만 01:00 이고 다음 날부터 자정으로 복귀한다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-09-04 00:00:00'),
        maxValue: ts('2026-09-08 00:00:00'),
        maxSteps: 10,
      });

      // 09-06 은 그 존에 자정이 존재하지 않아 01:00 이 불가피하다.
      expect(stamps(result.ticks)).toEqual([
        '09-04 00:00',
        '09-05 00:00',
        '09-06 01:00',
        '09-07 00:00',
        '09-08 00:00',
      ]);
    });

    it('전환일을 지나도 tick 이 단조 증가한다', () => {
      const scale = createScale({ interval: 'day' });

      // 증가하지 않으면 generateVisibleTicks 가 MAX_TICKS 까지 도는 것으로만 드러난다.
      const result = scale.calculateSteps({
        minValue: ts('2026-09-01 00:00:00'),
        maxValue: ts('2026-09-30 00:00:00'),
        maxSteps: 40,
      });

      expect(isAscending(result.ticks)).toBe(true);
      expect(result.ticks.length).toBe(30);
    });

    it('week interval: 전환일이 주 안에 있어도 월요일 자정에 정렬된다', () => {
      const scale = createScale({ interval: 'week' });

      const result = scale.calculateSteps({
        minValue: ts('2026-08-24 00:00:00'),
        maxValue: ts('2026-09-28 00:00:00'),
        maxSteps: 40,
      });

      expect(stamps(result.ticks)).toEqual([
        '08-24 00:00',
        '08-31 00:00',
        '09-07 00:00',
        '09-14 00:00',
        '09-21 00:00',
        '09-28 00:00',
      ]);
    });
  });

  describe('America/Havana — 자정이 두 번 오는 전환일', () => {
    useTZ('America/Havana');

    it('TZ 주입이 실제로 적용됐다', () => {
      expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(300); // CST (UTC-5)
      expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(240); // CDT (UTC-4)
    });

    it('중복 자정 구간에서도 tick 이 자정에 정렬되고 날짜가 중복되지 않는다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-10-30 00:00:00'),
        maxValue: ts('2026-11-03 00:00:00'),
        maxSteps: 10,
      });

      expect(stamps(result.ticks)).toEqual([
        '10-30 00:00',
        '10-31 00:00',
        '11-01 00:00',
        '11-02 00:00',
        '11-03 00:00',
      ]);
    });
  });

  describe('Australia/Sydney — 남반구(연초가 DST 구간)', () => {
    useTZ('Australia/Sydney');

    it('TZ 주입이 실제로 적용됐다', () => {
      // 이 블록의 단정은 DST 미관측 호스트에서도 만족되므로 주입 실패 시 위양성 통과한다.
      expect(new Date(2026, 0, 1).getTimezoneOffset()).toBe(-660); // AEDT (UTC+11)
      expect(new Date(2026, 6, 1).getTimezoneOffset()).toBe(-600); // AEST (UTC+10)
    });

    it('표준시 구간 조회 시 tick 이 전날 23시로 밀리지 않는다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-06-01 00:00:00'),
        maxValue: ts('2026-06-16 00:00:00'),
        maxSteps: 20,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      expect(dates(result.ticks)[0]).toBe('2026-06-01');
    });

    it('week interval: 표준시 구간에서도 tick 이 전날 23시로 밀리지 않는다', () => {
      const scale = createScale({ interval: 'week' });

      const result = scale.calculateSteps({
        minValue: ts('2026-06-01 00:00:00'),
        maxValue: ts('2026-07-06 00:00:00'),
        maxSteps: 20,
      });

      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      expect(dates(result.ticks)[0]).toBe('2026-06-01');
      expect(dates(result.ticks).at(-1)).toBe('2026-07-06');
    });
  });

  describe('Asia/Seoul — DST 미관측 회귀', () => {
    useTZ('Asia/Seoul');

    it('출력이 자정 정렬로 동일하게 유지된다', () => {
      const scale = createScale({ interval: 'day' });

      const result = scale.calculateSteps({
        minValue: ts('2026-03-01 00:00:00'),
        maxValue: ts('2026-04-01 00:00:00'),
        maxSteps: 40,
      });

      expect(result.ticks.length).toBe(32);
      expect(new Set(times(result.ticks))).toEqual(new Set(['00:00']));
      const DAY = 24 * 60 * 60 * 1000;
      result.ticks.slice(1).forEach((tick, i) => {
        expect(tick - result.ticks[i]).toBe(DAY);
      });
    });
  });
});
