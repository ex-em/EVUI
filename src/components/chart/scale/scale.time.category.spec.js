import dayjs from 'dayjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AXIS_UNITS } from '../helpers/helpers.constant';
import Scale from './scale';
import TimeCategoryScale from './scale.time.category';

const HOUR = 3600_000;

const createScale = (overrides = {}) => {
  const scale = Object.create(TimeCategoryScale.prototype);
  scale.interval = null;
  scale.labels = [];
  Object.assign(scale, overrides);
  return scale;
};

const createCtxMock = () => ({
  font: '',
  textAlign: '',
  textBaseline: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  beginPath: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
});

/**
 * draw() 호출에 필요한 최소한의 scale 인스턴스를 생성한다.
 * stepInfo는 calculateSteps()의 실제 반환값 또는 수동으로 구성한 값을 전달한다.
 */
const createDrawableScale = (overrides = {}) => {
  const ctx = createCtxMock();
  const scale = Object.create(TimeCategoryScale.prototype);

  scale.type = 'x';
  scale.position = 'bottom';
  scale.categoryMode = true;
  scale.interval = 'hour';
  scale.timeFormat = 'HH:mm';
  scale.formatter = null;
  scale.labelStyle = {
    color: '#000000',
    alignToGridLine: false,
    fontSize: 11,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontFamily: 'Arial',
    fitWidth: false,
    fitDir: 'right',
    fixWidth: undefined,
  };
  scale.axisLineWidth = 1;
  scale.axisLineColor = '#cccccc';
  scale.gridLineColor = '#eeeeee';
  scale.showGrid = false;
  scale.showAxisTick = false;
  scale.options = {};
  scale.labels = [];
  scale.units = AXIS_UNITS.x;
  scale.drawAxisTitle = vi.fn();
  scale.ctx = ctx;

  Object.assign(scale, overrides);
  return scale;
};

const chartRect = { x1: 0, x2: 600, y1: 0, y2: 300 };
const labelOffset = { left: 0, right: 0, top: 0, bottom: 0 };

// ─────────────────────────────────────────────────
describe('TimeCategoryScale', () => {
  describe('getInterval', () => {
    it('사용자 지정 interval이 숫자이면 그대로 반환한다', () => {
      const scale = createScale({ interval: 3600000 });
      const result = scale.getInterval({ maxValue: 100000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(3600000);
    });

    it('사용자 지정 interval이 문자열이면 TIME_INTERVALS에서 조회한다', () => {
      const scale = createScale({ interval: 'second' });
      const result = scale.getInterval({ maxValue: 10000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(1000);
    });

    it('사용자 지정 interval이 객체이면 time * unit size로 계산한다', () => {
      const scale = createScale({ interval: { time: 5, unit: 'minute' } });
      const result = scale.getInterval({ maxValue: 600000, minValue: 0, maxSteps: 5 });
      expect(result).toBe(5 * 60000);
    });

    it('interval이 없으면 범위/step으로 계산한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(20);
    });

    it('나누어 떨어지지 않으면 ceil 처리한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 3 });
      expect(result).toBe(34);
    });
  });

  // ─────────────────────────────────────────────────
  describe('calculateScaleRange', () => {
    const T0 = dayjs('2026-01-01 00:00:00').valueOf();
    const labels = Array.from({ length: 10 }, (_, i) => T0 + i * HOUR);

    const makeScale = () => {
      const scale = Object.create(TimeCategoryScale.prototype);
      scale.labels = labels;
      scale.timeFormat = 'HH:mm';
      scale.formatter = null;
      scale.labelStyle = { color: '#000', fontSize: 11 };
      return scale;
    };

    // Scale.prototype.calculateScaleRange이 실제 canvas를 사용하므로
    // jsdom에서 실행하기 위해 spy로 minMax.min/max를 그대로 반환하는 구현으로 대체한다.
    // TimeCategoryScale의 인덱스 계산 로직은 baseRange.min/max 기준으로 동작하므로
    // minMax에 원하는 min/max를 직접 전달해 super 반환값을 제어한다.
    let superSpy;
    beforeEach(() => {
      superSpy = vi.spyOn(Scale.prototype, 'calculateScaleRange')
        .mockImplementation(minMax => ({
          min: minMax?.min,
          max: minMax?.max,
          minLabel: '',
          maxLabel: '',
          size: { width: 0, height: 0 },
        }));
    });
    afterEach(() => { superSpy.mockRestore(); });

    it('배열 range: 해당 구간의 minIndex/maxIndex를 반환한다', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0 + 3 * HOUR, max: T0 + 7 * HOUR });
      expect(result.minIndex).toBe(3);
      expect(result.maxIndex).toBe(7);
    });

    it('함수형 range 등 super가 계산한 min/max 기준으로 인덱스를 찾는다', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0 + 2 * HOUR, max: T0 + 8 * HOUR });
      expect(result.minIndex).toBe(2);
      expect(result.maxIndex).toBe(8);
    });

    it('range가 라벨 이후 구간: maxIndex = -1 (빈 범위)', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0 + 20 * HOUR, max: T0 + 30 * HOUR });
      expect(result.maxIndex).toBe(-1);
    });

    it('range가 라벨 이전 구간: maxIndex = -1 (빈 범위)', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0 - 10 * HOUR, max: T0 - HOUR });
      expect(result.maxIndex).toBe(-1);
    });

    it('range가 두 라벨 사이에 끼어 교집합 없음: maxIndex = -1 (빈 범위)', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0 + 0.3 * HOUR, max: T0 + 0.7 * HOUR });
      expect(result.maxIndex).toBe(-1);
    });

    it('라벨 경계와 정확히 일치하는 range: 전체 라벨 범위(0 ~ last)를 반환한다', () => {
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: T0, max: T0 + 9 * HOUR });
      expect(result.minIndex).toBe(0);
      expect(result.maxIndex).toBe(labels.length - 1);
    });

    it('super가 non-numeric min/max를 반환하면 전체 라벨 범위(0 ~ last) 폴백을 사용한다', () => {
      // baseRange.min/max가 undefined인 경우(데이터 없이 초기 렌더링 등)
      // typeof undefined !== 'number' → Number.isFinite 가드가 false → 폴백 반환
      const scale = makeScale();
      const result = scale.calculateScaleRange({});
      expect(result.minIndex).toBe(0);
      expect(result.maxIndex).toBe(labels.length - 1);
    });

    it('super가 NaN min/max를 반환하면 전체 라벨 범위(0 ~ last) 폴백을 사용한다', () => {
      // typeof NaN === 'number'이지만 Number.isFinite(NaN) === false이므로 가드가 막아야 한다
      const scale = makeScale();
      const result = scale.calculateScaleRange({ min: NaN, max: NaN });
      expect(result.minIndex).toBe(0);
      expect(result.maxIndex).toBe(labels.length - 1);
    });

    it('labels가 비어있으면 maxIndex = -1 (빈 범위)를 반환한다', () => {
      const scale = Object.create(TimeCategoryScale.prototype);
      scale.labels = [];
      scale.timeFormat = 'HH:mm';
      scale.formatter = null;
      scale.labelStyle = { color: '#000', fontSize: 11 };
      const result = scale.calculateScaleRange({ min: T0, max: T0 + 9 * HOUR });
      expect(result.minIndex).toBe(0);
      expect(result.maxIndex).toBe(-1);
    });
  });

  // ─────────────────────────────────────────────────
  describe('calculateSteps', () => {
    it('데이터 2개 → oriSteps=2, steps=2를 반환한다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t1 = dayjs('2026-01-01 01:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: t0,
        maxValue: t1,
        maxSteps: 10,
      });

      expect(result.oriSteps).toBe(2);
      expect(result.steps).toBe(2);
    });

    it('데이터 5개 → oriSteps=5, steps=5를 반환한다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t4 = dayjs('2026-01-01 04:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: t0,
        maxValue: t4,
        maxSteps: 10,
      });

      expect(result.oriSteps).toBe(5);
      expect(result.steps).toBe(5);
    });

    it('maxSteps보다 데이터가 많으면 steps가 maxSteps 이하로 줄어든다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t9 = dayjs('2026-01-01 09:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: t0,
        maxValue: t9,
        maxSteps: 3,
      });

      expect(result.oriSteps).toBe(10);
      expect(result.steps).toBeLessThanOrEqual(3);
    });

    it('graphMin/graphMax를 올바르게 반환한다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t1 = dayjs('2026-01-01 01:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: t0,
        maxValue: t1,
        maxSteps: 10,
      });

      expect(result.graphMin).toBe(t0);
      expect(result.graphMax).toBe(t1);
    });

    it('minIndex/maxIndex 없이 호출하면 결과에도 undefined로 포함된다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t1 = dayjs('2026-01-01 01:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({ minValue: t0, maxValue: t1, maxSteps: 10 });

      expect(result.minIndex).toBeUndefined();
      expect(result.maxIndex).toBeUndefined();
    });

    it('range의 minIndex/maxIndex를 결과에 그대로 포함한다', () => {
      const t0 = dayjs('2026-01-01 00:00:00').valueOf();
      const t4 = dayjs('2026-01-01 04:00:00').valueOf();
      const scale = createScale({ interval: 'hour' });

      const result = scale.calculateSteps({
        minValue: t0,
        maxValue: t4,
        maxSteps: 10,
        minIndex: 2,
        maxIndex: 6,
      });

      expect(result.minIndex).toBe(2);
      expect(result.maxIndex).toBe(6);
    });
  });

  // ─────────────────────────────────────────────────
  describe('draw - steps <= 2 라벨 렌더링', () => {
    const t0 = dayjs('2026-01-01 00:00:00').valueOf();

    const getDrawnLabels = (scale, stepInfo) => {
      scale.draw(chartRect, labelOffset, stepInfo, null, null);
      return scale.ctx.fillText.mock.calls.map(([text]) => text);
    };

    it('데이터 2개일 때 첫번째·마지막 라벨이 모두 그려진다', () => {
      const t1 = t0 + HOUR;
      const scale = createDrawableScale({
        labels: [dayjs(t0), dayjs(t1)],
        timeFormat: 'HH:mm',
      });
      const stepInfo = { steps: 2, oriSteps: 2, rawInterval: HOUR, graphMin: t0, graphMax: t1 };

      const labels = getDrawnLabels(scale, stepInfo);

      expect(labels).toHaveLength(2);
      expect(labels[0]).toBe(dayjs(t0).format('HH:mm'));
      expect(labels[1]).toBe(dayjs(t1).format('HH:mm'));
    });

    it('oriSteps > steps=2로 압축될 때 첫·마지막 라벨만 그려진다', () => {
      const t9 = t0 + 9 * HOUR;
      const labels = Array.from({ length: 10 }, (_, i) => dayjs(t0 + i * HOUR));
      const scale = createDrawableScale({ labels, timeFormat: 'HH:mm' });
      const stepInfo = { steps: 2, oriSteps: 10, rawInterval: HOUR, graphMin: t0, graphMax: t9 };

      const drawn = getDrawnLabels(scale, stepInfo);

      expect(drawn).toHaveLength(2);
      expect(drawn[0]).toBe(dayjs(t0).format('HH:mm'));
      expect(drawn[1]).toBe(dayjs(t9).format('HH:mm'));
    });

    it('alignToGridLine: true일 때 데이터 2개 모두 그려진다', () => {
      const t1 = t0 + HOUR;
      const scale = createDrawableScale({
        labels: [dayjs(t0), dayjs(t1)],
        timeFormat: 'HH:mm',
        labelStyle: {
          color: '#000000',
          alignToGridLine: true,
          fontSize: 11,
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontFamily: 'Arial',
          fitWidth: false,
          fitDir: 'right',
          fixWidth: undefined,
        },
      });
      const stepInfo = { steps: 2, oriSteps: 2, rawInterval: HOUR, graphMin: t0, graphMax: t1 };

      const drawn = getDrawnLabels(scale, stepInfo);

      expect(drawn.length).toBeGreaterThanOrEqual(2);
    });
  });
});
