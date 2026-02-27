import { describe, it, expect } from 'vitest';
import EvuiResolver from './resolver';

describe('EvuiResolver', () => {
  describe('기본 동작', () => {
    it('type이 component인 resolver를 반환해야 한다', () => {
      const resolver = EvuiResolver();
      expect(resolver.type).toBe('component');
      expect(typeof resolver.resolve).toBe('function');
    });
  });

  describe('컴포넌트 매칭', () => {
    it('Ev로 시작하는 PascalCase 컴포넌트를 resolve해야 한다', () => {
      const { resolve } = EvuiResolver();

      expect(resolve('EvButton')).toEqual({
        name: 'EvButton',
        from: 'evui',
        sideEffects: 'evui/style',
      });
      expect(resolve('EvGrid')).toEqual({
        name: 'EvGrid',
        from: 'evui',
        sideEffects: 'evui/style',
      });
      expect(resolve('EvChart')).toEqual({
        name: 'EvChart',
        from: 'evui',
        sideEffects: 'evui/style',
      });
    });

    it('Ev로 시작하지 않는 컴포넌트는 undefined를 반환해야 한다', () => {
      const { resolve } = EvuiResolver();

      expect(resolve('VButton')).toBeUndefined();
      expect(resolve('ElInput')).toBeUndefined();
      expect(resolve('MyComponent')).toBeUndefined();
    });

    it('Ev 뒤에 소문자가 오는 이름은 매칭하지 않아야 한다 (오탐 방지)', () => {
      const { resolve } = EvuiResolver();

      expect(resolve('Event')).toBeUndefined();
      expect(resolve('Every')).toBeUndefined();
      expect(resolve('Evaluate')).toBeUndefined();
    });
  });

  describe('importStyle 옵션', () => {
    it('기본값(true)이면 sideEffects에 evui/style을 포함해야 한다', () => {
      const { resolve } = EvuiResolver();

      expect(resolve('EvButton').sideEffects).toBe('evui/style');
    });

    it('true이면 sideEffects에 evui/style을 포함해야 한다', () => {
      const { resolve } = EvuiResolver({ importStyle: true });

      expect(resolve('EvButton').sideEffects).toBe('evui/style');
    });

    it('false이면 sideEffects가 undefined여야 한다', () => {
      const { resolve } = EvuiResolver({ importStyle: false });

      expect(resolve('EvButton').sideEffects).toBeUndefined();
    });
  });

  describe('exclude 옵션', () => {
    it('exclude 패턴에 매칭되는 컴포넌트는 undefined를 반환해야 한다', () => {
      const { resolve } = EvuiResolver({ exclude: /EvChart/ });

      expect(resolve('EvChart')).toBeUndefined();
      expect(resolve('EvChartGroup')).toBeUndefined();
      expect(resolve('EvButton')).toBeDefined();
    });

    it('exclude 없으면 모든 Ev 컴포넌트를 resolve해야 한다', () => {
      const { resolve } = EvuiResolver();

      expect(resolve('EvChart')).toBeDefined();
      expect(resolve('EvChartGroup')).toBeDefined();
      expect(resolve('EvButton')).toBeDefined();
    });
  });
});
