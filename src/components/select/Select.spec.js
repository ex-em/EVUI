import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import EvSelect from './Select.vue';

describe('EvSelect Component', () => {
  const defaultProps = {
    items: [
      { name: '옵션1', value: 'opt1' },
      { name: '옵션2', value: 'opt2' },
      { name: '옵션3', value: 'opt3' },
    ],
  };

  const globalConfig = {
    global: {
      directives: {
        clickoutside: {},
      },
    },
  };

  describe('렌더링', () => {
    it('기본 셀렉트가 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      expect(wrapper.find('.ev-select').exists()).toBe(true);
      expect(wrapper.find('.ev-input').exists()).toBe(true);
    });

    it('화살표 아이콘이 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input-suffix-arrow').exists()).toBe(true);
    });
  });

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, disabled: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('.ev-input').element.disabled).toBe(true);
    });

    it('placeholder prop이 적용된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, placeholder: '선택하세요' },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-input').attributes('placeholder')).toBe('선택하세요');
    });

    it('multiple prop이 적용되면 다중 선택 UI가 렌더링된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, modelValue: [] },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-select-tag-wrapper').exists()).toBe(true);
    });
  });

  describe('Events', () => {
    it('클릭 시 드롭박스가 열린다', async () => {
      const wrapper = mount(EvSelect, {
        props: defaultProps,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');

      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);
    });
  });

  describe('Dropbox flip 동작', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    /**
     * 부모/조부모 등 임의의 ancestor에 적용할 computed style을 mock한다.
     * (해당 ancestor가 세로 스크롤 컨테이너로 인식되도록 overflowY: auto 부여)
     */
    const mockBounds = ({
      selectWrapperRect,
      dropboxRect,
      scrollContainer,
      scrollContainerRect,
      docClientHeight = 1000,
    }) => {
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(docClientHeight);
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
        if (this.classList?.contains('ev-select__wrapper')) return selectWrapperRect;
        if (this.classList?.contains('ev-select-dropbox')) return dropboxRect;
        if (scrollContainer && this === scrollContainer) return scrollContainerRect;
        return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
      });
      if (scrollContainer) {
        const original = window.getComputedStyle.bind(window);
        vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
          if (el === scrollContainer) {
            return { overflow: 'visible', overflowY: 'auto' };
          }
          return original(el);
        });
      }
    };

    it('스크롤 ancestor가 없으면 viewport 기준으로 dropDown 한다', async () => {
      mockBounds({
        selectWrapperRect: { top: 100, bottom: 130, height: 30, y: 100 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('30px');
      wrapper.unmount();
    });

    it('스크롤 ancestor가 없고 viewport 하단을 넘으면 위로 펼친다', async () => {
      mockBounds({
        selectWrapperRect: { top: 900, bottom: 930, height: 30, y: 900 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('-175px');
      wrapper.unmount();
    });

    it('스크롤 ancestor 경계를 넘고 위에 공간이 있으면 위로 펼친다 (회귀 가드)', async () => {
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 480, bottom: 510, height: 30, y: 480 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 540, height: 440, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('-175px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('스크롤 ancestor 안에 충분한 공간이 있으면 dropDown 유지', async () => {
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 150, bottom: 180, height: 30, y: 150 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 540, height: 440, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('30px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('스크롤 ancestor가 viewport 하단 아래로 벗어난 경우에도 위로 펼친다', async () => {
      // ev-window를 viewport 하단까지 드래그해서 컨테이너 일부가 화면 밖으로 잘린 상황.
      // container.bottom > viewport.bottom 이라도 dropDown이 화면 밖에 그려지지 않도록
      // viewport와 교집합을 잡아 flip 되어야 한다.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 850, bottom: 880, height: 30, y: 850 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 500, bottom: 1400, height: 900, y: 500 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('-175px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('스크롤 ancestor 안에서 양쪽 모두 dropbox를 못 담아도 위쪽이 더 넓으면 위로 펼친다', async () => {
      // ev-window 내부 스크롤로 select 위/아래 모두 dropbox 전체를 담을 공간이 없는 상황.
      // spaceAbove(135) > spaceBelow(65) 이므로 더 많이 보이는 쪽인 위로 펼친다.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 235, bottom: 265, height: 30, y: 235 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 330, height: 230, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('-175px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('스크롤 ancestor 안에서 양쪽 모두 dropbox를 못 담고 아래쪽이 더 넓으면 dropDown 유지', async () => {
      // 대칭 케이스: 위쪽이 좁고 아래쪽이 넓으면 dropDown 으로 떨어진다.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 170, bottom: 200, height: 30, y: 170 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 330, height: 230, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('30px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('스크롤 ancestor가 viewport 상단 위로 벗어난 경우에도 dropDown 한다', async () => {
      // 반대 케이스: 컨테이너 top이 음수(화면 위로 잘림). topBoundary가 0으로 clamp 되어야 한다.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      mockBounds({
        selectWrapperRect: { top: 50, bottom: 80, height: 30, y: 50 },
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: -200, bottom: 700, height: 900, y: -200 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: defaultProps,
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      expect(dropboxEl.style.top).toBe('30px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvSelect이다', () => {
      expect(EvSelect.name).toBe('EvSelect');
    });

    it('기본 multiple은 false이다', () => {
      expect(EvSelect.props.multiple.default).toBe(false);
    });

    it('기본 clearable은 false이다', () => {
      expect(EvSelect.props.clearable.default).toBe(false);
    });

    it('기본 filterable은 false이다', () => {
      expect(EvSelect.props.filterable.default).toBe(false);
    });
  });
});
