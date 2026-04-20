import dayjs from 'dayjs';
import { describe, it, expect, vi } from 'vitest';
import { AXIS_UNITS } from '../helpers/helpers.constant';
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
