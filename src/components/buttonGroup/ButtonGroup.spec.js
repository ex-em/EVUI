import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvButtonGroup from './ButtonGroup.vue';

describe('EvButtonGroup Component', () => {
  describe('렌더링', () => {
    it('기본 버튼 그룹이 렌더링된다', () => {
      const wrapper = mount(EvButtonGroup);

      expect(wrapper.find('.ev-button-group').exists()).toBe(true);
    });

    it('slot 내용이 렌더링된다', () => {
      const wrapper = mount(EvButtonGroup, {
        slots: {
          default: '<button>버튼1</button><button>버튼2</button>',
        },
      });

      expect(wrapper.findAll('button')).toHaveLength(2);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvButtonGroup이다', () => {
      expect(EvButtonGroup.name).toBe('EvButtonGroup');
    });
  });
});
