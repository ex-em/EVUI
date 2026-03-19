import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvTree from './Tree.vue';

describe('EvTree Component', () => {
  const sampleData = [
    {
      title: '루트',
      children: [{ title: '자식1' }, { title: '자식2' }],
    },
  ];

  describe('렌더링', () => {
    it('기본 트리가 렌더링된다', () => {
      const wrapper = mount(EvTree, {
        props: { data: sampleData },
      });

      expect(wrapper.find('.ev-tree-view').exists()).toBe(true);
    });

    it('데이터가 없으면 빈 텍스트가 표시된다', () => {
      const wrapper = mount(EvTree, {
        props: { data: [] },
      });

      expect(wrapper.text()).toContain('No Data');
    });

    it('커스텀 emptyText가 표시된다', () => {
      const wrapper = mount(EvTree, {
        props: { data: [], emptyText: '데이터 없음' },
      });

      expect(wrapper.text()).toContain('데이터 없음');
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvTree이다', () => {
      expect(EvTree.name).toBe('EvTree');
    });

    it('기본 data는 빈 배열이다', () => {
      expect(EvTree.props.data.default()).toEqual([]);
    });

    it('기본 useCheckbox는 false이다', () => {
      expect(EvTree.props.useCheckbox.default).toBe(false);
    });

    it('기본 emptyText는 No Data이다', () => {
      expect(EvTree.props.emptyText.default).toBe('No Data');
    });

    it('기본 searchWord는 빈 문자열이다', () => {
      expect(EvTree.props.searchWord.default).toBe('');
    });

    it('기본 searchIncludeChildren은 false이다', () => {
      expect(EvTree.props.searchIncludeChildren.default).toBe(false);
    });

    it('기본 contextMenuItems는 빈 배열이다', () => {
      expect(EvTree.props.contextMenuItems.default()).toEqual([]);
    });
  });
});
