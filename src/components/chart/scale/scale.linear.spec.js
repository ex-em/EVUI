import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Util from '../helpers/helpers.util';
import LinearScale from './scale.linear';

// LinearScale의 순수 계산 메서드를 테스트하기 위해 최소 mock 생성
const createScale = (overrides = {}) => {
  const scale = Object.create(LinearScale.prototype);
  scale.interval = null;
  scale.decimalPoint = null;
  scale.startToZero = false;
  scale.fixedSteps = false;
  scale.formatter = null;
  scale.options = { type: 'line' };
  Object.assign(scale, overrides);
  return scale;
};

beforeEach(() => {
  vi.spyOn(Util, 'calcTextSizeCanvas').mockReturnValue({ width: 2, height: 2 });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LinearScale', () => {
  describe('getInterval', () => {
    it('기본 interval을 계산한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(20);
    });

    it('사용자 지정 interval이 있으면 그대로 반환한다', () => {
      const scale = createScale({ interval: 25 });
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 5 });
      expect(result).toBe(25);
    });

    it('steps가 0이면 0을 반환한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 0 });
      expect(result).toBe(0);
    });

    it('소수점이 없으면 ceil 처리한다', () => {
      const scale = createScale();
      const result = scale.getInterval({ maxValue: 100, minValue: 0, maxSteps: 3 });
      // 100/3 = 33.33... → ceil → 34
      expect(result).toBe(34);
    });

    it('소수점이 있으면 그대로 반환한다', () => {
      const scale = createScale({ decimalPoint: 2 });
      const result = scale.getInterval({ maxValue: 1, minValue: 0, maxSteps: 3 });
      expect(result).toBeCloseTo(0.333, 2);
    });

    it('startToZero이고 음수 포함 시 올바르게 계산한다', () => {
      const scale = createScale({ startToZero: true });
      const result = scale.getInterval({ maxValue: 80, minValue: -20, maxSteps: 5 });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calculateSteps', () => {
    it('userRange + userInterval이 호환되면 그대로 사용한다', () => {
      const scale = createScale({
        range: [0, 100],
        interval: 20,
      });
      const result = scale.calculateSteps({ minValue: 10, maxValue: 90, maxSteps: 5 });

      expect(result).toEqual({
        steps: 5,
        interval: 20,
        graphMin: 0,
        graphMax: 100,
      });
    });

    it('userRange only면 range를 딱 떨어지게 나누는 nice interval을 적용한다', () => {
      const scale = createScale({
        range: [0, 90],
      });
      const result = scale.calculateSteps({ minValue: 10, maxValue: 70, maxSteps: 3 });

      expect(result).toEqual({
        steps: 3,
        interval: 30,
        graphMin: 0,
        graphMax: 90,
      });
    });

    it('userInterval only면 범위를 interval 배수로 확장하고 steps를 제한한다', () => {
      const scale = createScale({
        interval: 10,
      });
      const result = scale.calculateSteps({ minValue: 3, maxValue: 97, maxSteps: 5 });

      expect(result.interval).toBe(20);
      expect(result.steps).toBeLessThanOrEqual(5);
      expect(result.graphMin).toBe(3);
      expect(result.graphMax).toBe(100);
    });

    it('fixedSteps가 true이면 userRange + userInterval이 비호환이어도 그대로 사용한다', () => {
      const scale = createScale({
        range: [0, 10],
        interval: 3,
        fixedSteps: true,
      });
    
      const result = scale.calculateSteps({ minValue: 1, maxValue: 9, maxSteps: 5 });
    
      expect(result).toEqual({
        steps: 3,
        interval: 3,
        graphMin: 0,
        graphMax: 10,
      });
    });

    it('fixedSteps가 false이면 userRange + userInterval이 비호환할 때 fallback 계산을 사용한다', () => {
      const scale = createScale({
        range: [0, 10],
        interval: 3,
        fixedSteps: false,
      });
    
      scale.getStepsWithNiceScale = () => ({
        min: 0,
        max: 10,
        steps: 5,
        interval: 2,
      });
    
      const result = scale.calculateSteps({ minValue: 1, maxValue: 9, maxSteps: 5 });
    
      expect(result).toEqual({
        steps: 5,
        interval: 2,
        graphMin: 0,
        graphMax: 10,
      });
    });

    it('fixedSteps가 false여도 userRange + userInterval이 호환되면 그대로 사용한다', () => {
      const scale = createScale({
        range: [0, 10],
        interval: 2,
        fixedSteps: false,
      });
    
      const result = scale.calculateSteps({ minValue: 1, maxValue: 9, maxSteps: 5 });
    
      expect(result).toEqual({
        steps: 5,
        interval: 2,
        graphMin: 0,
        graphMax: 10,
      });
    });

    it('userInterval only에서 계산된 steps가 maxSteps를 초과하면 interval을 재조정한다', () => {
      const scale = createScale({
        interval: 10,
      });
    
      const result = scale.calculateSteps({ minValue: 0, maxValue: 100, maxSteps: 3 });
    
      expect(result.interval).toBeGreaterThanOrEqual(34);
      expect(result.steps).toBeLessThanOrEqual(3);
    });

    it("decimalPoint가 'auto'일 때 작은 interval에 맞는 소수 자릿수를 계산한다", () => {
      const scale = createScale({
        decimalPoint: 'auto',
      });
    
      scale.getStepsWithNiceScale = () => ({
        min: 0,
        max: 0.3,
        steps: 3,
        interval: 0.1,
      });
    
      scale.calculateSteps({ minValue: 0, maxValue: 0.3, maxSteps: 3 });
    
      expect(scale.adjustedDecimalPoint).toBeGreaterThanOrEqual(1);
    });

    it('userRange의 범위가 0이면 안전하게 처리한다', () => {
      const scale = createScale({
        range: [5, 5],
      });
    
      const result = scale.calculateSteps({ minValue: 5, maxValue: 5, maxSteps: 5 });
    
      expect(result).toBeDefined();
    });

    it('음수 범위에서도 userRange + userInterval을 올바르게 계산한다', () => {
      const scale = createScale({
        range: [-100, 100],
        interval: 50,
      });
    
      const result = scale.calculateSteps({ minValue: -80, maxValue: 70, maxSteps: 10 });
    
      expect(result).toEqual({
        steps: 4,
        interval: 50,
        graphMin: -100,
        graphMax: 100,
      });
    });

    it('auto 모드에서 실제 nice scale 계산 결과를 반환한다', () => {
      const scale = createScale();
      const result = scale.calculateSteps({ minValue: 3, maxValue: 97, maxSteps: 5 });
    
      expect(result.graphMin).toBeLessThanOrEqual(3);
      expect(result.graphMax).toBeGreaterThanOrEqual(97);
      expect(result.steps).toBeLessThanOrEqual(5);
    });

    it("decimalPoint가 'auto'면 adjustedDecimalPoint를 갱신한다", () => {
      const scale = createScale({
        decimalPoint: 'auto',
      });

      scale.calculateSteps({ minValue: 0, maxValue: 1, maxSteps: 4 });

      expect(scale.adjustedDecimalPoint).toBeTypeOf('number');
      expect(scale.adjustedDecimalPoint).toBeGreaterThanOrEqual(0);
    });

    it('auto 모드에서 0~1 범위는 기존 특례를 복원한다', () => {
      const scale = createScale();

      const result = scale.calculateSteps({ minValue: 0, maxValue: 1, maxSteps: 4 });

      expect(result).toEqual({
        steps: 1,
        interval: 1,
        graphMin: 0,
        graphMax: 1,
      });
    });

    it('auto 모드에서 소수 축의 0~1 범위는 0.2 간격 특례를 사용한다', () => {
      const scale = createScale({
        decimalPoint: 2,
      });

      const result = scale.calculateSteps({ minValue: 0, maxValue: 1, maxSteps: 4 });

      expect(result).toEqual({
        steps: 5,
        interval: 0.2,
        graphMin: 0,
        graphMax: 1,
      });
    });

    it('userInterval only에서 interval이 배수 단위로 증가한다', () => {
      const scale = createScale({ interval: 10 });
      const result = scale.calculateSteps({ minValue: 0, maxValue: 100, maxSteps: 3 });
      expect(result.interval % 10).toBe(0); // 10의 배수
    });
  });

  describe('getLegacyOneMaxScale', () => {
    it('정수 축이면 1 간격 1 step을 반환한다', () => {
      const scale = createScale();

      expect(scale.getLegacyOneMaxScale(4)).toEqual({
        interval: 1,
        steps: 1,
      });
    });

    it('소수 축이고 maxSteps가 충분하면 0.2 간격 5 step을 반환한다', () => {
      const scale = createScale({
        decimalPoint: 2,
      });

      expect(scale.getLegacyOneMaxScale(4)).toEqual({
        interval: 0.2,
        steps: 5,
      });
    });

    it('소수 축이고 maxSteps가 작으면 0.5 간격 2 step을 반환한다', () => {
      const scale = createScale({
        decimalPoint: 2,
      });

      expect(scale.getLegacyOneMaxScale(2)).toEqual({
        interval: 0.5,
        steps: 2,
      });
    });
  });

  describe('calculateScaleRange', () => {
    it('데이터 범위가 없고 사용자 range도 없으면 0~1 기본 축 범위를 반환한다', () => {
      const scale = createScale({
        labelStyle: {},
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(0);
      expect(result.max).toBe(1);
      expect(result.minLabel).toBe('0');
      expect(result.maxLabel).toBe('1');
    });

    it('사용자 range가 있으면 빈 데이터여도 사용자 range를 유지한다', () => {
      const scale = createScale({
        labelStyle: {},
        range: [10, 20],
      });

      const result = scale.calculateScaleRange({ min: null, max: null });

      expect(result.min).toBe(10);
      expect(result.max).toBe(20);
    });

    it('min과 max가 같으면 max를 1 증가시킨다', () => {
      const scale = createScale({
        labelStyle: {},
      });

      const result = scale.calculateScaleRange({ min: 3, max: 3 });

      expect(result.min).toBe(3);
      expect(result.max).toBe(4);
    });
  });

  describe('getExactInterval', () => {
    it('range가 maxSteps로 나누어 떨어지면 정수 interval을 반환한다', () => {
      const scale = createScale();
      const { interval, steps } = scale.getExactInterval(90, 3);
      expect(interval).toBe(30);
      expect(steps).toBe(3);
    });

    it('range가 maxSteps로 나누어 떨어지지 않으면 유한 소수 interval을 반환한다', () => {
      const scale = createScale();
      // 13 / 5 = 2.6 (유한 소수)
      const { interval, steps } = scale.getExactInterval(13, 5);
      expect(interval).toBe(2.6);
      expect(steps).toBe(5);
    });

    it('소수점 자리수가 더 적은 interval을 우선 반환한다', () => {
      const scale = createScale();
      // 후보: steps=100→0.05(2자리), steps=50→0.1(1자리), steps=5→1.0(0자리)
      // 소수점 0자리인 steps=5, interval=1을 반환
      const { interval, steps } = scale.getExactInterval(5, 140);
      expect(interval).toBe(1);
      expect(steps).toBe(5);
    });

    it('소수점 자리수가 같으면 steps가 많은 쪽을 반환한다', () => {
      const scale = createScale();
      // 1.5 / 3 = 0.5 (1자리), 1.5 / 1 = 1.5 (1자리) → steps=3이 더 많음
      const { interval, steps } = scale.getExactInterval(1.5, 3);
      expect(interval).toBe(0.5);
      expect(steps).toBe(3);
    });

    it('정수 interval이 없으면 소수점 자리수가 가장 적은 유한 소수를 반환한다', () => {
      const scale = createScale();
      // 13은 소수라 maxSteps=10 이하에서 정수 divisor 없음 (steps=1은 interval===range라 제외)
      // steps=10 → 1.3(1자리), steps=5 → 2.6(1자리) → steps=10 우선
      const { interval, steps } = scale.getExactInterval(13, 10);
      expect(interval).toBe(1.3);
      expect(steps).toBe(10);
    });

    it('steps=1까지 내려가도 딱 떨어지는 값이 없으면 fallback을 반환한다', () => {
      const scale = createScale();
      // range=1/3은 유한 소수로 나누기 어려운 케이스
      // fallback: interval = range / maxSteps
      const { steps } = scale.getExactInterval(1 / 3, 3);
      expect(steps).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getDecimalFromInterval', () => {
    describe('정수 interval', () => {
      it('정수는 decimal 0을 반환한다', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });

        expect(scale.getDecimalPointFromInterval(1)).toBe(0);
        expect(scale.getDecimalPointFromInterval(10)).toBe(0);
        expect(scale.getDecimalPointFromInterval(100)).toBe(0);
      });
    });
  
    describe('정확히 표현 가능한 소수 (2ⁿ 분모)', () => {
      it('0.5 → 1', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.5)).toBe(1);
      });
  
      it('0.25 → 2', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.25)).toBe(2);
      });
  
      it('0.125 → 3', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.125)).toBe(3);
      });
  
      it('2.5 → 1', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(2.5)).toBe(1);
      });
    });
  
    describe('부동소수점 표현 불가능 값', () => {
      it('0.1 → 1', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.1)).toBe(1);
      });
  
      it('0.2 → 1', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.2)).toBe(1);
      });
  
      it('0.05 → 2', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.05)).toBe(2);
      });
  
      it('0.01 → 2', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.01)).toBe(2);
      });

      it('0.25 interval은 2자리 decimal이 필요하다 (0.3 방지)', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.25)).toBe(2);
      });

      it('0.1 + 0.2 문제를 유발하는 interval', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.1)).toBe(1);
      });
    });
  
    describe('작은 값', () => {
      it('0.001 → 3', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.001)).toBe(3);
      });
  
      it('0.0001 → 4', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0.0001)).toBe(4);
      });
    });
  
    describe('큰 값 + 소수 간격', () => {
      it('100.5 → 1', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(100.5)).toBe(1);
      });
  
      it('100.25 → 2', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(100.25)).toBe(2);
      });
    });
  
    describe('음수 interval', () => {
      it('부호는 무시하고 절댓값 기준으로 계산한다', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(-0.25)).toBe(2);
        expect(scale.getDecimalPointFromInterval(-2.5)).toBe(1);
      });
    });
  
    describe('경계값 / 예외', () => {
      it('0 → 0', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(0)).toBe(0);
      });
  
      it('NaN → 0', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(NaN)).toBe(0);
      });
  
      it('Infinity → 0', () => {
        const scale = createScale({
          decimalPoint: 'auto',
        });
        expect(scale.getDecimalPointFromInterval(Infinity)).toBe(0);
      });
    });
  });
});
