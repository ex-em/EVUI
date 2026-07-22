import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import EvTabs from './Tabs.vue';

describe('EvTabs Component', () => {
  const defaultPanels = [
    { text: '탭1', value: 'tab1' },
    { text: '탭2', value: 'tab2' },
    { text: '탭3', value: 'tab3' },
  ];

  const globalConfig = {
    global: {
      directives: {
        resize: {},
        observeVisibility: {},
      },
    },
  };

  describe('렌더링', () => {
    it('기본 탭이 렌더링된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      expect(wrapper.find('.ev-tabs').exists()).toBe(true);
      expect(wrapper.find('.ev-tabs-header').exists()).toBe(true);
      expect(wrapper.find('.ev-tabs-body').exists()).toBe(true);
    });

    it('탭 목록이 렌더링된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      expect(tabs).toHaveLength(3);
      expect(tabs[0].text()).toContain('탭1');
      expect(tabs[1].text()).toContain('탭2');
    });

    it('선택된 탭에 active 클래스가 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab2', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      expect(tabs[0].classes()).not.toContain('active');
      expect(tabs[1].classes()).toContain('active');
    });
  });

  describe('Props', () => {
    it('closable prop이 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels, closable: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('closable');
      expect(wrapper.findAll('.close-icon').length).toBeGreaterThan(0);
    });

    it('stretch prop이 적용된다', () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels, stretch: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('stretch');
    });
  });

  describe('Events', () => {
    it('탭 클릭 시 update:modelValue 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      await tabs[1].trigger('click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('tab2');
    });

    it('탭 클릭 시 change 이벤트가 발생한다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: defaultPanels },
        ...globalConfig,
      });

      const tabs = wrapper.findAll('.ev-tabs-title');
      await tabs[1].trigger('click');

      expect(wrapper.emitted('change')).toBeTruthy();
      expect(wrapper.emitted('change')[0][0]).toBe('tab2');
    });
  });

  describe('has-scroll 시 선택 탭 자동 스크롤', () => {
    const TAB_WIDTH = 100; // .ev-tabs-title 너비
    const WRAPPER_WIDTH = 300; // 헤더 뷰포트 (탭 3개 정도만 보임)
    const manyPanels = Array.from({ length: 12 }, (_, i) => ({
      text: `탭${i + 1}`,
      value: `tab${i + 1}`,
    }));

    // jsdom 은 레이아웃을 계산하지 않으므로 offset 값을 목킹한다.
    // NOTE: 'li.offsetLeft 이 ul 기준' 이라는 좌표계 가정 자체는 여기서 검증되지 않는다
    //       (실브라우저에선 ul 의 v-resize 가 position:relative 를 걸어 offsetParent 가 ul 로 확정됨).
    //       실제 좌표/스크롤 픽셀 검증은 docs/views/tab/example/Default.vue 데모로 수행한다.
    const mockLayout = (wrapper) => {
      const listWrapperEl = wrapper.find('.ev-tabs-list-wrapper').element;
      const listEl = wrapper.find('.ev-tabs-list').element;
      const tabEls = wrapper.findAll('.ev-tabs-title').map((w) => w.element);

      Object.defineProperty(listWrapperEl, 'offsetWidth', {
        configurable: true,
        get: () => WRAPPER_WIDTH,
      });
      Object.defineProperty(listEl, 'offsetWidth', {
        configurable: true,
        get: () => TAB_WIDTH * tabEls.length,
      });
      Object.defineProperty(listEl, 'offsetLeft', {
        configurable: true,
        get: () => 0,
      });
      tabEls.forEach((el, i) => {
        Object.defineProperty(el, 'offsetLeft', {
          configurable: true,
          get: () => TAB_WIDTH * i,
        });
        Object.defineProperty(el, 'offsetWidth', {
          configurable: true,
          get: () => TAB_WIDTH,
        });
      });
    };

    const getTranslateX = (wrapper) => {
      const listEl = wrapper.find('.ev-tabs-list').element;
      const m = /translateX\((-?\d+(?:\.\d+)?)px\)/.exec(listEl.style.transform || '');
      return m ? parseFloat(m[1]) : 0;
    };

    // 선택 탭이 뷰포트 [viewLeft, viewRight] 안에 완전히 보이는지 판정
    const isActiveTabVisible = (wrapper, activeIdx) => {
      const translateX = getTranslateX(wrapper);
      const viewLeft = -translateX;
      const viewRight = viewLeft + WRAPPER_WIDTH;
      const activeLeft = TAB_WIDTH * activeIdx;
      const activeRight = activeLeft + TAB_WIDTH;
      return activeLeft >= viewLeft && activeRight <= viewRight;
    };

    it('탭이 넘치면 has-scroll 이 활성화된다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: manyPanels },
        ...globalConfig,
      });

      mockLayout(wrapper);
      wrapper.vm.onResize();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).toContain('has-scroll');
    });

    it('마지막(오른쪽 끝) 탭이 선택된 채 마운트되면 헤더가 그 탭으로 스크롤된다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab12', panels: manyPanels },
        ...globalConfig,
      });

      mockLayout(wrapper);
      wrapper.vm.onResize(); // 최초 렌더/가시성/리사이즈 시점 재계산
      await flushPromises();

      // 오른쪽 끝 정렬: translateX = WRAPPER_WIDTH - listWidth = 300 - 1200 = -900
      expect(getTranslateX(wrapper)).toBe(WRAPPER_WIDTH - TAB_WIDTH * manyPanels.length);
      expect(isActiveTabVisible(wrapper, 11)).toBe(true);
    });

    it('modelValue 를 뷰포트 밖 탭으로 변경하면 헤더가 따라 스크롤된다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: manyPanels },
        ...globalConfig,
      });

      mockLayout(wrapper);
      wrapper.vm.onResize();
      await flushPromises();

      // tab1 은 처음부터 보이므로 스크롤 없음
      expect(getTranslateX(wrapper)).toBe(0);

      // 오른쪽 끝 탭으로 변경
      await wrapper.setProps({ modelValue: 'tab12' });
      await flushPromises();

      expect(isActiveTabVisible(wrapper, 11)).toBe(true);
      expect(getTranslateX(wrapper)).toBe(WRAPPER_WIDTH - TAB_WIDTH * manyPanels.length);
    });

    it('오른쪽으로 스크롤된 상태에서 첫 탭을 선택하면 왼쪽으로 스크롤된다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab12', panels: manyPanels },
        ...globalConfig,
      });

      mockLayout(wrapper);
      wrapper.vm.onResize();
      await flushPromises();
      expect(getTranslateX(wrapper)).toBeLessThan(0);

      await wrapper.setProps({ modelValue: 'tab1' });
      await flushPromises();

      // tab1 좌측 정렬 → translateX = 0
      expect(getTranslateX(wrapper)).toBe(0);
      expect(isActiveTabVisible(wrapper, 0)).toBe(true);
    });

    it('스크롤이 없으면(탭이 적으면) translateX 는 0 을 유지한다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab3', panels: defaultPanels },
        ...globalConfig,
      });

      const listWrapperEl = wrapper.find('.ev-tabs-list-wrapper').element;
      const listEl = wrapper.find('.ev-tabs-list').element;
      Object.defineProperty(listWrapperEl, 'offsetWidth', { configurable: true, get: () => 600 });
      Object.defineProperty(listEl, 'offsetWidth', { configurable: true, get: () => 300 });

      wrapper.vm.onResize();
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).not.toContain('has-scroll');
      expect(getTranslateX(wrapper)).toBe(0);
    });
  });

  describe('패널 추가/삭제 시 has-scroll 재계산', () => {
    const TAB_WIDTH = 100; // .ev-tabs-title 너비
    const WRAPPER_WIDTH = 300; // 헤더 뷰포트 (탭 3개 정도만 보임)

    const makePanels = (n) =>
      Array.from({ length: n }, (_, i) => ({ text: `탭${i + 1}`, value: `tab${i + 1}` }));

    // jsdom 은 레이아웃을 계산하지 않으므로 offsetWidth 를 목킹한다.
    // 래퍼 폭은 300 고정(섹션 폭은 변하지 않는 상황), 리스트 폭은 살아있는 li 개수에 비례.
    const mockDynamicLayout = (wrapper) => {
      const listWrapperEl = wrapper.find('.ev-tabs-list-wrapper').element;
      const listEl = wrapper.find('.ev-tabs-list').element;

      Object.defineProperty(listWrapperEl, 'offsetWidth', {
        configurable: true,
        get: () => WRAPPER_WIDTH,
      });
      Object.defineProperty(listEl, 'offsetWidth', {
        configurable: true,
        get: () => TAB_WIDTH * listEl.children.length,
      });
    };

    it('마운트 후 패널을 추가해 리스트가 래퍼를 넘치면 has-scroll 이 나타난다', async () => {
      // 탭 2개 → 200 < 300 → 스크롤 없음
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: makePanels(2) },
        ...globalConfig,
      });

      mockDynamicLayout(wrapper);
      wrapper.vm.onResize(); // 최초 가시성/리사이즈 시점 측정
      await flushPromises();
      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).not.toContain('has-scroll');

      // 탭 6개 → 600 > 300 → 넘침. 섹션 폭은 그대로라 섹션 v-resize 로는 못 잡던 케이스.
      // 실브라우저에선 ul 의 v-resize(ResizeObserver)가 리스트 폭 변화를 감지해 자동 재계산하지만,
      // jsdom 은 RO/디렉티브가 스텁이라 그 트리거를 onResize() 수동 호출로 대체한다.
      await wrapper.setProps({ panels: makePanels(6) });
      wrapper.vm.onResize();
      await flushPromises();

      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).toContain('has-scroll');
    });

    it('패널을 제거해 더 이상 넘치지 않으면 has-scroll 이 사라진다', async () => {
      const wrapper = mount(EvTabs, {
        props: { modelValue: 'tab1', panels: makePanels(6) },
        ...globalConfig,
      });

      mockDynamicLayout(wrapper);
      wrapper.vm.onResize();
      await flushPromises();
      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).toContain('has-scroll');

      // 실브라우저에선 ul 의 v-resize(ResizeObserver)가 담당하는 재계산을, jsdom 에선 수동 트리거.
      await wrapper.setProps({ panels: makePanels(2) });
      wrapper.vm.onResize();
      await flushPromises();

      expect(wrapper.find('.ev-tabs-nav-wrapper').classes()).not.toContain('has-scroll');
    });
  });

  describe('기본값', () => {
    it('컴포넌트 이름이 EvTabs이다', () => {
      expect(EvTabs.name).toBe('EvTabs');
    });

    it('기본 closable은 false이다', () => {
      expect(EvTabs.props.closable.default).toBe(false);
    });

    it('기본 stretch는 false이다', () => {
      expect(EvTabs.props.stretch.default).toBe(false);
    });

    it('기본 draggable은 false이다', () => {
      expect(EvTabs.props.draggable.default).toBe(false);
    });
  });
});
