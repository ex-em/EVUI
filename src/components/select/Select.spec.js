import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import EvSelect from './Select.vue';

const SELECT_SFC_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'Select.vue');
const SELECT_SFC_SOURCE = readFileSync(SELECT_SFC_PATH, 'utf-8');

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

  describe('Props', () => {
    it('disabled prop이 적용된다', () => {
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, disabled: true },
        ...globalConfig,
      });

      expect(wrapper.classes()).toContain('disabled');
      expect(wrapper.find('.ev-input').element.disabled).toBe(true);
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

    it('multiple + tagMaxRows>0 에서 tag-wrapper 클릭 시 드롭박스가 열린다 (회귀 가드)', async () => {
      // has-max-rows일 때 input.multiple은 pointer-events:none이라 click이 input을 통과해
      // tag-wrapper로 위임된다. 이렇게 해야 input이 wrapper overflow scroll/wheel을 가리지 않는다.
      // tagMaxRows=0 (기본)에서는 input @click이 그대로 동작하므로 사이드 이펙트가 없다.
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, tagMaxRows: 3, modelValue: [] },
        ...globalConfig,
      });

      await wrapper.find('.ev-select-tag-wrapper').trigger('click');

      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);
    });

    it('multiple 기본 모드(tagMaxRows=0)에서는 input click이 그대로 dropbox를 연다 (사이드 이펙트 가드)', async () => {
      // tagMaxRows=0에서는 pointer-events:none이 적용되지 않으므로
      // 기존 input @click 경로를 통해 dropbox가 열려야 한다.
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, modelValue: [] },
        ...globalConfig,
      });

      await wrapper.find('.ev-input.multiple').trigger('click');

      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);
    });

    it('multiple + tagMaxRows>0 에서 선택된 tag 본문 클릭은 드롭박스를 토글하지 않는다 (회귀 가드)', async () => {
      // tag-wrapper @click → clickSelectInput 이지만, tag 내부 click이 wrapper로 bubble되면
      // 사용자가 tag-name을 클릭할 때마다 dropbox가 토글된다.
      // .ev-select-tag 에 @click.stop이 걸려 있어 wrapper 토글을 막아야 한다.
      const wrapper = mount(EvSelect, {
        props: {
          ...defaultProps,
          multiple: true,
          tagMaxRows: 3,
          modelValue: ['opt1'],
        },
        ...globalConfig,
      });

      // 먼저 wrapper 클릭으로 한 번 열어둔다.
      await wrapper.find('.ev-select-tag-wrapper').trigger('click');
      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);

      // tag 본문 클릭이 wrapper로 bubble되어 다시 토글(=닫힘)되면 안 된다.
      await wrapper.find('.ev-select-tag .ev-tag-name').trigger('click');
      expect(wrapper.find('.ev-select-dropbox').exists()).toBe(true);
    });

    it('multiple + tagMaxRows>0 일 때 input.multiple은 readonly + tabindex=-1 로 유지된다 (스펙 가드)', () => {
      // pointer-events:none 효과는 jsdom에서 검증할 수 없어 SFC raw text 가드를 따로 둔다.
      // 여기서는 input 자체의 접근성/탭 흐름 속성만 본다.
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, tagMaxRows: 3, modelValue: [] },
        ...globalConfig,
      });

      const inputEl = wrapper.find('.ev-input.multiple').element;
      expect(inputEl.hasAttribute('readonly')).toBe(true);
      expect(inputEl.getAttribute('tabindex')).toBe('-1');
    });

    it('multiple 기본 모드(tagMaxRows=0)에서는 input.multiple에 tabindex가 적용되지 않는다 (회귀 가드)', () => {
      // 위의 스펙 가드 대칭. `hasMaxRows ? -1 : null` 바인딩에서 `> 0` 조건이 `>= 0` 등으로
      // 무너지면 기본 모드에서도 tabindex=-1이 박혀 키보드 탭 도달 경로가 사라진다.
      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, modelValue: [] },
        ...globalConfig,
      });

      const inputEl = wrapper.find('.ev-input.multiple').element;
      // null binding → 속성 자체가 DOM에 박히지 않아야 한다.
      expect(inputEl.hasAttribute('tabindex')).toBe(false);
    });

    it('Select.vue SFC: has-max-rows 분기에 pointer-events:none 이 살아 있다 (스타일 회귀 가드)', () => {
      // jsdom은 CSS를 적용하지 않으므로 실효 검증이 안 된다.
      // 의도가 silent하게 사라지는 회귀(파일에서 규칙이 지워짐)를 잡기 위해 SFC 텍스트를 검사한다.
      // 기본 모드(tagMaxRows=0)에는 적용되지 않아야 한다는 점이 핵심이므로 has-max-rows 스코프로만 매칭.
      expect(SELECT_SFC_SOURCE).toMatch(
        /\.ev-select-tag-wrapper\.has-max-rows\s+\.ev-input\.multiple\s*\{[^}]*pointer-events:\s*none/,
      );
      // 기본 모드 input.multiple 블록에는 pointer-events 규칙이 들어가지 않아야 한다.
      const multipleBlockMatch = SELECT_SFC_SOURCE.match(/&\.multiple\s*\{([^}]*)\}/);
      expect(multipleBlockMatch).not.toBeNull();
      expect(multipleBlockMatch[1]).not.toMatch(/pointer-events/);
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

    it('스크롤 ancestor 안에서 양쪽 모두 부족하지만 위가 더 넓으면 위로 펼친다 (native select 일관성)', async () => {
      // ev-window 내부에서 select 위/아래 모두 dropbox 전체를 담을 공간이 없는 상황.
      // 양쪽 다 부족하더라도 더 넓은 쪽(위)으로 펼쳐서 더 많은 항목을 노출한다 —
      // 컨테이너 안에서 가려지는 것보다 native select와 동일하게 더 큰 쪽으로 펼친다.
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

      // spaceAbove=135, spaceBelow=65, overflowsBottom=true, spaceAbove > spaceBelow → dropTop
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

    /**
     * 도중 selectWrapperRect 를 갈아끼울 수 있는 변형 mock.
     * tag wrap 등으로 wrapper height 가 바뀌는 시나리오를 시뮬레이트한다.
     */
    const mockMutableBounds = ({
      wrapperRectRef,
      dropboxRect,
      scrollContainer,
      scrollContainerRect,
      docClientHeight = 1000,
    }) => {
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(docClientHeight);
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
        if (this.classList?.contains('ev-select__wrapper')) return wrapperRectRef.current;
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

    it('multiple+checkable open 후 wrapper height가 늘어나도 flip 방향이 점프하지 않는다 (회귀 가드)', async () => {
      // window 내부 multiple+checkable 에서 항목 선택으로 wrapper height 가 늘어나면
      // mv.value watch 가 changeDropboxPosition 을 호출한다. 이 때 flip 방향을 재판정하면
      // dropbox 가 dropDown → dropTop 으로 점프하며 ev-window 상단 경계 밖으로 빠져나가 잘린다.
      // open 시점 결정 방향은 유지되어야 한다.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      const wrapperRectRef = {
        current: { top: 300, bottom: 330, height: 30, y: 300 },
      };

      mockMutableBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 540, height: 440, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, checkable: true, modelValue: [] },
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      // open 시점: spaceAbove=200, spaceBelow=210, overflowsBottom=false → dropDown
      expect(dropboxEl.style.top).toBe('30px');

      // tag wrap 으로 wrapper height 가 30 → 110 으로 늘어난 상황 시뮬레이트.
      // 이 상태에서 flip 을 재판정하면 spaceBelow=130 < dropboxHeight=175,
      // spaceAbove=200 >= 175 이라 dropTop 으로 점프할 조건이 된다.
      wrapperRectRef.current = { top: 300, bottom: 410, height: 110, y: 300 };
      await wrapper.setProps({ modelValue: ['opt1', 'opt2'] });
      await nextTick();
      await nextTick();

      // 방향은 유지되어야 하므로 여전히 dropDown. top 은 새 selectHeight(110) 추종.
      expect(dropboxEl.style.top).toBe('110px');

      wrapper.unmount();
      document.body.removeChild(scrollContainer);
    });

    it('multiple+checkable open(dropTop) 후 wrapper height가 늘어나도 방향이 점프하지 않는다 (회귀 가드)', async () => {
      // 대칭 케이스: open 시점에 dropTop으로 결정된 뒤 wrapper height가 늘어도 dropTop 유지.
      const scrollContainer = document.createElement('div');
      document.body.appendChild(scrollContainer);

      const selectMount = document.createElement('div');
      scrollContainer.appendChild(selectMount);

      const wrapperRectRef = {
        current: { top: 400, bottom: 430, height: 30, y: 400 },
      };

      mockMutableBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
        scrollContainer,
        scrollContainerRect: { top: 100, bottom: 530, height: 430, y: 100 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, multiple: true, checkable: true, modelValue: [] },
        attachTo: selectMount,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = wrapper.find('.ev-select-dropbox').element;
      // open 시점: spaceAbove=300, spaceBelow=100, overflowsBottom=true, spaceAbove>=175 → dropTop
      expect(dropboxEl.style.top).toBe('-175px');

      // wrapper height 30 → 110 (tag wrap 시뮬레이트). dropTop은 wrapper top 기준 절대 위치라
      // wrapper height가 늘어도 top 값 자체는 변하지 않는다. 핵심은 dropDown으로 점프하지 않는 것.
      wrapperRectRef.current = { top: 400, bottom: 510, height: 110, y: 400 };
      await wrapper.setProps({ modelValue: ['opt1', 'opt2'] });
      await nextTick();
      await nextTick();

      expect(dropboxEl.style.top).toBe('-175px');

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

  describe('Teleport 모드 dropbox flip 동작', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      document
        .querySelectorAll('body > .ev-select-dropbox')
        .forEach((el) => el.parentElement.removeChild(el));
    });

    const mockTeleportBounds = ({ selectWrapperRect, dropboxRect, docClientHeight = 1000 }) => {
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(docClientHeight);
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
        if (this.classList?.contains('ev-select__wrapper')) return selectWrapperRect;
        if (this.classList?.contains('ev-select-dropbox')) return dropboxRect;
        return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
      });
    };

    it('teleport="body" + 화면 상단 select 는 viewport bottom 좌표로 dropDown 한다', async () => {
      mockTeleportBounds({
        selectWrapperRect: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();
      // teleport 분기: dropDown 시 top = selectRect.bottom (viewport 절대 좌표, px)
      expect(dropboxEl.style.top).toBe('130px');
      expect(dropboxEl.style.left).toBe('50px');
      wrapper.unmount();
    });

    it('teleport="body" + 화면 하단 select 는 viewport top 기준으로 위로 펼친다', async () => {
      mockTeleportBounds({
        selectWrapperRect: { top: 900, bottom: 930, left: 50, width: 200, height: 30, y: 900 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();
      // teleport 분기 dropTop: top = selectRect.top - dropboxHeight = 900 - 175 = 725
      expect(dropboxEl.style.top).toBe('725px');
      expect(dropboxEl.style.left).toBe('50px');
      wrapper.unmount();
    });

    it('teleport="body" 활성 시 dropbox에 teleported 클래스가 적용되고 body 직속으로 옮겨진다', async () => {
      mockTeleportBounds({
        selectWrapperRect: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();
      expect(dropboxEl.classList.contains('teleported')).toBe(true);
      expect(dropboxEl.style.width).toBe('200px');
      wrapper.unmount();
    });

    /**
     * scroll 회귀 가드용 mock — selectWrapperRect를 ref-like 객체로 받아
     * 테스트 도중 갱신하면 다음 getBoundingClientRect 호출에서 새 값을 돌려준다.
     */
    const mockMutableTeleportBounds = ({ wrapperRectRef, dropboxRect, docClientHeight = 1000 }) => {
      vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(docClientHeight);
      vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
        if (this.classList?.contains('ev-select__wrapper')) return wrapperRectRef.current;
        if (this.classList?.contains('ev-select-dropbox')) return dropboxRect;
        return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
      });
    };

    it('teleport 모드에서 ancestor/viewport scroll 시 dropbox가 닫힌다', async () => {
      const wrapperRectRef = {
        current: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).not.toBeNull();

      // ancestor가 스크롤되면 dropbox는 위치 재계산이 아니라 닫혀야 한다 (native select UX)
      window.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).toBeNull();
      wrapper.unmount();
    });

    it('teleport 모드에서 dropbox 내부 scroll(필터 input, item list)은 닫지 않는다', async () => {
      const wrapperRectRef = {
        current: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();

      // dropbox 내부 element에서 발생한 scroll은 capture phase에서도 무시되어야 한다
      const innerScrollTarget = dropboxEl.querySelector('.ev-select-dropbox-list') || dropboxEl;
      innerScrollTarget.dispatchEvent(new Event('scroll', { bubbles: true }));
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).not.toBeNull();
      wrapper.unmount();
    });

    it('teleport 모드에서 select root 내부 scroll(tagMaxRows wrapper 등)은 dropbox를 닫지 않는다 (회귀 가드)', async () => {
      // tagMaxRows로 인해 .ev-select-tag-wrapper에 overflow-y:auto가 적용되면
      // wrapper 내부 wheel/touch scroll 이벤트가 발생한다. capture-phase scroll 리스너가
      // 이걸 외부 스크롤로 오인해 dropbox를 닫지 않아야 한다.
      const wrapperRectRef = {
        current: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: {
          ...defaultProps,
          teleport: 'body',
          multiple: true,
          checkable: true,
          tagMaxRows: 3,
          modelValue: [],
        },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).not.toBeNull();

      const tagWrapper = wrapper.find('.ev-select-tag-wrapper').element;
      tagWrapper.dispatchEvent(new Event('scroll', { bubbles: true }));
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).not.toBeNull();
      wrapper.unmount();
    });

    it('teleport 모드에서 window resize 시 dropbox가 닫힌다', async () => {
      const wrapperRectRef = {
        current: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).not.toBeNull();

      window.dispatchEvent(new Event('resize'));
      await nextTick();
      await nextTick();

      expect(document.querySelector('body > .ev-select-dropbox')).toBeNull();
      wrapper.unmount();
    });

    it('teleport+multiple+checkable: 항목 선택으로 wrapper height가 늘어나도 dropbox top이 새 selectRect.bottom을 추종한다 (회귀 가드)', async () => {
      // multiple+checkable에서 modelValue가 바뀔 때 mv.value watch가 changeDropboxPosition()을
      // recomputeDirection: false 로 호출 — teleport branch는 viewport 절대 좌표를 쓰므로
      // 변경된 wrapper bottom에 dropbox.top이 그대로 따라붙어야 한다.
      // cf8d3911 fix(multi+teleport tag wrap close)가 silent하게 회귀하면 여기서 잡힌다.
      const wrapperRectRef = {
        current: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: {
          ...defaultProps,
          teleport: 'body',
          multiple: true,
          checkable: true,
          modelValue: [],
        },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();
      expect(dropboxEl.style.top).toBe('130px');

      // tag wrap으로 wrapper height 30 → 110 시뮬레이트
      wrapperRectRef.current = {
        top: 100,
        bottom: 210,
        left: 50,
        width: 200,
        height: 110,
        y: 100,
      };
      await wrapper.setProps({ modelValue: ['opt1', 'opt2'] });
      await nextTick();
      await nextTick();

      expect(dropboxEl.style.top).toBe('210px');
      wrapper.unmount();
    });

    it('teleport+multiple+checkable: open 시점에 dropTop으로 결정되면 wrapper height 변화 후에도 방향이 유지된다 (회귀 가드)', async () => {
      // open 시점에 한 번 결정한 flip 방향(isDropTop)이 wrapper height 변화로
      // 재판정되면 위/아래 점프가 발생한다. mv.value watch는 recomputeDirection: false 로
      // 호출되어야 하며, top 좌표만 새 selectRect.top - dropboxHeight 로 갱신되어야 한다.
      const wrapperRectRef = {
        current: { top: 900, bottom: 930, left: 50, width: 200, height: 30, y: 900 },
      };
      mockMutableTeleportBounds({
        wrapperRectRef,
        dropboxRect: { height: 175 },
      });

      const wrapper = mount(EvSelect, {
        props: {
          ...defaultProps,
          teleport: 'body',
          multiple: true,
          checkable: true,
          modelValue: [],
        },
        attachTo: document.body,
        ...globalConfig,
      });

      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();

      const dropboxEl = document.querySelector('body > .ev-select-dropbox');
      expect(dropboxEl).not.toBeNull();
      // open 시점 dropTop: top = selectRect.top - dropboxHeight = 900 - 175 = 725
      expect(dropboxEl.style.top).toBe('725px');

      // 항목 선택으로 wrapper top이 위로 밀려나는 상황 (height 30 → 110, top 900 → 820)
      wrapperRectRef.current = {
        top: 820,
        bottom: 930,
        left: 50,
        width: 200,
        height: 110,
        y: 820,
      };
      await wrapper.setProps({ modelValue: ['opt1', 'opt2'] });
      await nextTick();
      await nextTick();

      // dropTop 유지 + top만 갱신: 820 - 175 = 645
      // (recomputeDirection 누설 회귀 시 spaceAbove 820 / spaceBelow 70 으로 여전히 dropTop이지만
      //  dropDown으로 점프하는 다른 회귀가 들어와도 이 expect로 잡힌다)
      expect(dropboxEl.style.top).toBe('645px');
      wrapper.unmount();
    });

    it('teleport 모드에서 dropbox close 시 scroll listener가 해제된다', async () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      mockTeleportBounds({
        selectWrapperRect: { top: 100, bottom: 130, left: 50, width: 200, height: 30, y: 100 },
        dropboxRect: { height: 175 },
        docClientHeight: 1000,
      });

      const wrapper = mount(EvSelect, {
        props: { ...defaultProps, teleport: 'body' },
        attachTo: document.body,
        ...globalConfig,
      });

      // open → scroll listener 등록
      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();
      const scrollAdds = addSpy.mock.calls.filter(([type]) => type === 'scroll');
      expect(scrollAdds.length).toBeGreaterThan(0);

      // close → scroll listener 해제
      await wrapper.find('.ev-input').trigger('click');
      await nextTick();
      await nextTick();
      const scrollRemoves = removeSpy.mock.calls.filter(([type]) => type === 'scroll');
      expect(scrollRemoves.length).toBeGreaterThan(0);

      wrapper.unmount();
    });
  });
});
