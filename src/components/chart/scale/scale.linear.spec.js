import { describe, it, expect } from 'vitest';
import LinearScale from './scale.linear';

// LinearScale의 순수 계산 메서드를 테스트하기 위해 최소 mock 생성
const createScale = (overrides = {}) => {
  const scale = Object.create(LinearScale.prototype);
  scale.interval = null;
  scale.decimalPoint = null;
  scale.startToZero = false;
  scale.fixedSteps = false;
  scale.formatter = null;
  Object.assign(scale, overrides);
  return scale;
};

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

  describe('getDecimalPointFromRange', () => {
    it('정수 범위는 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 100, numberOfSteps: 5 })).toBe(0);
    });

    it('소수점 범위의 자릿수를 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 1, numberOfSteps: 10 })).toBe(1);
    });

    it('매우 작은 범위의 자릿수를 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 0.01, numberOfSteps: 10 })).toBe(3);
    });

    it('numberOfSteps가 0이면 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 100, numberOfSteps: 0 })).toBe(0);
    });

    it('graphRange가 0이면 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 0, numberOfSteps: 5 })).toBe(0);
    });

    it('유효하지 않은 값(Infinity/NaN)이면 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: Infinity, numberOfSteps: 5 })).toBe(0);
      expect(scale.getDecimalPointFromRange({ graphRange: 1, numberOfSteps: NaN })).toBe(0);
    });

    it('소수점 계산은 최대 10자리까지만 반환한다', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 1e-15, numberOfSteps: 1 })).toBe(10);
    });

    // 버그 재현: graphRange=0.5, numberOfSteps=2 → interval=0.25 → 소수점 2자리여야 함
    it('graphRange=0.5, numberOfSteps=2이면 2를 반환한다 (interval=0.25)', () => {
      const scale = createScale();
      expect(scale.getDecimalPointFromRange({ graphRange: 0.5, numberOfSteps: 2 })).toBe(2);
    });

    it('interval이 0.5이면 1을 반환한다', () => {
      const scale = createScale();
      // graphRange=1, numberOfSteps=2 → interval=0.5
      expect(scale.getDecimalPointFromRange({ graphRange: 1, numberOfSteps: 2 })).toBe(1);
    });

    it('interval이 0.125이면 3을 반환한다', () => {
      const scale = createScale();
      // graphRange=0.5, numberOfSteps=4 → interval=0.125
      expect(scale.getDecimalPointFromRange({ graphRange: 0.5, numberOfSteps: 4 })).toBe(3);
    });

    it('interval이 정확히 1이면 0을 반환한다', () => {
      const scale = createScale();
      // graphRange=5, numberOfSteps=5 → interval=1
      expect(scale.getDecimalPointFromRange({ graphRange: 5, numberOfSteps: 5 })).toBe(0);
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

    it('userRange only면 maxSteps 기준으로 interval을 계산한다', () => {
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
  });

  describe('getNiceInterval', () => {
    it('양수 값에 대해 nice interval을 반환한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(33);
      // 33 → exponent=1, normalized=3.3 → fraction=5 → 50
      expect(result).toBe(50);
    });

    it('작은 양수에 대해 동작한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(0.7);
      expect(result).toBe(1);
    });

    it('음수 값에 대해 음수 nice interval을 반환한다', () => {
      const scale = createScale();
      const result = scale.getNiceInterval(-33);
      expect(result).toBe(-50);
    });

    it('0은 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(0)).toBe(0);
    });

    it('Infinity는 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(Infinity)).toBe(0);
    });

    it('NaN은 0을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(NaN)).toBe(0);
    });

    it('1에 대해 1을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(1)).toBe(1);
    });

    it('10에 대해 10을 반환한다', () => {
      const scale = createScale();
      expect(scale.getNiceInterval(10)).toBe(10);
    });

    it('15에 대해 20을 반환한다', () => {
      const scale = createScale();
      // 15 → exponent=1, normalized=1.5 → fraction=2 → 20
      expect(scale.getNiceInterval(15)).toBe(20);
    });
  });
});
