import Line from '@/components/chart/element/element.line';
import { LINE_OPTION } from '@/components/chart/helpers/helpers.constant';

describe('Chart Interpolation', () => {
  describe('LINE_OPTION 기본값 테스트', () => {
    it('none이 기본값이어야 함', () => {
      expect(LINE_OPTION.interpolation).toBe('none');
    });

    it('passingValue는 null이어야 함', () => {
      expect(LINE_OPTION.passingValue).toBe(null);
    });
  });

  describe('Line class constructor 테스트', () => {
    it('interpolation이 "linear"일 때 useLinearInterpolation은 true여야 함', () => {
      const line = new Line('test', { interpolation: 'linear' }, 0);
      expect(line.interpolation).toBe('linear');
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation이 "none"이고 passingValue가 없을 때 useLinearInterpolation은 false여야 함', () => {
      const line = new Line('test', { interpolation: 'none' }, 0);
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(null);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation이 "none"이고 passingValue가 있고, hasPassingValueInData가 true일 때 useLinearInterpolation은 true여야 함', () => {
      const line = new Line('test', { interpolation: 'none', passingValue: -1 }, 0);
      line.hasPassingValueInData = true;
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation이 "linear"이고 passingValue가 있을 때 useLinearInterpolation은 true여야 함', () => {
      const line = new Line('test', { interpolation: 'linear', passingValue: -1 }, 0);
      expect(line.interpolation).toBe('linear');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('interpolation이 "zero"일 때 useLinearInterpolation은 false여야 함', () => {
      const line = new Line('test', { interpolation: 'zero' }, 0);
      expect(line.interpolation).toBe('zero');
      expect(line.useLinearInterpolation()).toBe(false);
    });
  });


  describe('기존 로직 호환 테스트', () => {
    it('기존 사용법: passingValue만 설정, hasPassingValueInData가 true일 때 useLinearInterpolation은 true여야 함', () => {
      // 기존 사용법: passingValue만 설정
      const line = new Line('test', { passingValue: -1 }, 0);
      line.hasPassingValueInData = true;

      // interpolation은 기본값 'none'이지만 useLinearInterpolation은 true여야 함
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(true);
    });

    it('기존 사용법: passingValue만 설정, hasPassingValueInData가 false일 때 useLinearInterpolation은 false여야 함', () => {
      const line = new Line('test', { passingValue: -1 }, 0);
      line.hasPassingValueInData = false;
      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(-1);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation과 passingValue가 없을 때 기본값 사용', () => {
      const line = new Line('test', {}, 0);

      expect(line.interpolation).toBe('none');
      expect(line.passingValue).toBe(null);
      expect(line.useLinearInterpolation()).toBe(false);
    });

    it('interpolation이 "linear"이고 값이 null일 때 useLinearInterpolation은 true여야 함', () => {
      const line = new Line('test', { interpolation: 'linear' }, 0);

      expect(line.interpolation).toBe('linear');
      expect(line.useLinearInterpolation()).toBe(true);
    });
  });
});
