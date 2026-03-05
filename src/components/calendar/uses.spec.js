import { describe, it, expect } from 'vitest';
import { lpadToTwoDigits } from './uses';

describe('lpadToTwoDigits', () => {
  it('한 자리 숫자를 두 자리로 패딩한다', () => {
    expect(lpadToTwoDigits(1)).toBe('01');
    expect(lpadToTwoDigits(9)).toBe('09');
    expect(lpadToTwoDigits(0)).toBe('00');
  });

  it('두 자리 이상 숫자는 그대로 반환한다', () => {
    expect(lpadToTwoDigits(10)).toBe(10);
    expect(lpadToTwoDigits(31)).toBe(31);
    expect(lpadToTwoDigits(12)).toBe(12);
  });

  it('문자열 숫자도 처리한다', () => {
    expect(lpadToTwoDigits('5')).toBe('05');
    expect(lpadToTwoDigits('12')).toBe('12');
  });

  it('null이면 00을 반환한다', () => {
    expect(lpadToTwoDigits(null)).toBe('00');
  });
});
