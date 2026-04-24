import { describe, it, expect } from 'vitest';
import Scale from './scale';

const createScale = () => {
  const scale = Object.create(Scale.prototype);
  return scale;
};

describe('Scale', () => {
  describe('calculateLabelRange', () => {
    describe('x축', () => {
      it('drawRange 내에 라벨이 여러 개 들어갈 수 있으면 maxSteps > 1을 반환한다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'x',
          { chartWidth: 500 },
          { left: 50, right: 50 },
          60,
        );
        // drawRange=400, bufferedTickSize=floor(60*1.2)=72
        // maxSteps=floor(400/72)=5
        expect(result.max).toBe(5);
        expect(result.min).toBe(1);
      });

      it('좁은 캔버스에서도 maxSteps가 최소 1을 반환한다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'x',
          { chartWidth: 100 },
          { left: 30, right: 30 },
          60,
        );
        // drawRange=40, bufferedTickSize=72
        // floor(40/72)=0 → Math.max(0,1)=1
        expect(result.max).toBe(1);
      });

      it('tickSize가 작으면 더 많은 라벨이 표시된다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'x',
          { chartWidth: 400 },
          { left: 50, right: 50 },
          30,
        );
        // drawRange=300, bufferedTickSize=floor(30*1.2)=36
        // maxSteps=floor(300/36)=8
        expect(result.max).toBe(8);
      });

      it('버퍼 배율 1.2가 적용된다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'x',
          { chartWidth: 300 },
          { left: 0, right: 0 },
          100,
        );
        // drawRange=300, bufferedTickSize=floor(100*1.2)=120
        // maxSteps=floor(300/120)=2
        expect(result.max).toBe(2);
      });
    });

    describe('y축', () => {
      it('drawRange 내에 라벨이 여러 개 들어갈 수 있으면 maxSteps > 1을 반환한다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'y',
          { chartHeight: 400 },
          { top: 20, bottom: 20 },
          14,
        );
        // drawRange=360, bufferedTickSize=floor(14*1.5)=21
        // maxSteps=floor(360/21)=17
        expect(result.max).toBe(17);
      });

      it('좁은 캔버스에서도 maxSteps가 최소 1을 반환한다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'y',
          { chartHeight: 50 },
          { top: 10, bottom: 10 },
          30,
        );
        // drawRange=30, bufferedTickSize=floor(30*1.5)=45
        // floor(30/45)=0 → Math.max(0,1)=1
        expect(result.max).toBe(1);
      });

      it('버퍼 배율 1.5가 적용된다', () => {
        const scale = createScale();
        const result = scale.calculateLabelRange(
          'y',
          { chartHeight: 300 },
          { top: 0, bottom: 0 },
          20,
        );
        // drawRange=300, bufferedTickSize=floor(20*1.5)=30
        // maxSteps=floor(300/30)=10
        expect(result.max).toBe(10);
      });

      it('차트 높이가 달라져도 동일한 tickSize면 bufferedTickSize가 동일하다', () => {
        const scale = createScale();
        const result300 = scale.calculateLabelRange(
          'y',
          { chartHeight: 300 },
          { top: 0, bottom: 0 },
          14,
        );
        const result600 = scale.calculateLabelRange(
          'y',
          { chartHeight: 600 },
          { top: 0, bottom: 0 },
          14,
        );
        // bufferedTickSize = floor(14*1.5) = 21 (차트 높이와 무관)
        // 300: floor(300/21)=14, 600: floor(600/21)=28
        expect(result600.max).toBe(result300.max * 2);
      });
    });
  });
});
