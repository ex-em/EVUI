import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import EvIcon from './Icon.vue';

describe('EvIcon Snapshot', () => {
  // 1. 파일 기반 스냅샷 (별도 __snapshots__ 폴더에 저장)
  describe('파일 스냅샷', () => {
    it('기본 아이콘 렌더링', () => {
      const wrapper = mount(EvIcon, {
        props: { icon: 'ev-icon-search' },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('size가 적용된 아이콘', () => {
      const wrapper = mount(EvIcon, {
        props: {
          icon: 'ev-icon-check',
          size: 'large',
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('color가 적용된 아이콘', () => {
      const wrapper = mount(EvIcon, {
        props: {
          icon: 'ev-icon-warning',
          color: '#ff0000',
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('모든 props가 적용된 아이콘', () => {
      const wrapper = mount(EvIcon, {
        props: {
          icon: 'ev-icon-error',
          size: 'small',
          color: 'blue',
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  // 2. 인라인 스냅샷 (테스트 코드 내에 저장 - 첫 실행 시 자동 생성)
  describe('인라인 스냅샷', () => {
    it('기본 아이콘 인라인 스냅샷', () => {
      const wrapper = mount(EvIcon, {
        props: { icon: 'ev-icon-home' },
      });

      expect(wrapper.html()).toMatchInlineSnapshot(`"<i class="ev-icon-home"></i>"`);
    });

    it('size와 color가 적용된 인라인 스냅샷', () => {
      const wrapper = mount(EvIcon, {
        props: {
          icon: 'ev-icon-user',
          size: 'medium',
          color: '#333',
        },
      });

      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<i class="ev-icon-user ev-icon-medium" style="color: rgb(51, 51, 51);"></i>"`,
      );
    });
  });

  // 3. 다양한 상태의 스냅샷
  describe('다양한 아이콘 상태', () => {
    const iconVariants = [
      { name: 'search', props: { icon: 'ev-icon-search' } },
      { name: 'check', props: { icon: 'ev-icon-check', color: 'green' } },
      { name: 'close', props: { icon: 'ev-icon-close', size: 'large' } },
      { name: 'menu', props: { icon: 'ev-icon-menu', size: 'small', color: 'gray' } },
    ];

    iconVariants.forEach(({ name, props }) => {
      it(`${name} 아이콘 스냅샷`, () => {
        const wrapper = mount(EvIcon, { props });
        expect(wrapper.html()).toMatchSnapshot();
      });
    });
  });
});
