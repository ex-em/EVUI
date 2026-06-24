<template>
  <nav class="evui-navigation" :class="{ 'is-collapsed': collapsed }">
    <!-- Search bar -->
    <div class="evui-nav-search">
      <i class="ev-icon-search evui-nav-search-icon" />
      <input
        ref="searchInputRef"
        v-model="searchText"
        class="evui-nav-search-input"
        type="text"
        placeholder="Search menu..."
        @keydown.esc="searchText = ''"
      />
      <i v-if="searchText" class="ev-icon-close evui-nav-search-clear" @click="searchText = ''" />
    </div>

    <!-- Menu list -->
    <div ref="menuListRef" class="evui-nav-menu-list">
      <ev-menu v-model="currentMenu" :items="filteredMenu" @change="changeMenu" />
      <p v-if="searchText && !filteredMenu.length" class="evui-nav-no-results">
        검색 결과가 없습니다.
      </p>
    </div>
  </nav>

  <!-- Toggle button (nav boundary) -->
  <button
    class="evui-nav-toggle"
    :class="{ 'is-collapsed': collapsed }"
    :title="collapsed ? '메뉴 펼치기 (Ctrl+B)' : '메뉴 접기 (Ctrl+B)'"
    @click="$emit('toggle-collapse')"
  >
    <i :class="collapsed ? 'ev-icon-arrow-right' : 'ev-icon-arrow-left'" />
  </button>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { kebabCase } from 'lodash-es';
import router from '../router';

export default {
  inheritAttrs: false,
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggle-collapse'],
  setup(props) {
    const currentMenu = ref(null);
    const searchText = ref('');
    const searchInputRef = ref(null);
    const menuListRef = ref(null);

    const route = router.currentRoute;

    // 현재 경로의 최상위 세그먼트 ('/lineChart/fill' → '/lineChart')
    const activeBasePath = computed(() => {
      const [seg] = route.value.path.split('/').filter(Boolean);
      return seg ? `/${seg}` : '';
    });

    // 갤러리 라우트(meta.gallery)는 props.components 로부터 예제 children 을 만든다.
    const buildExampleChildren = (record) => {
      const components = record.props?.default?.components;
      if (!record.meta.gallery || !components) {
        return null;
      }
      return Object.keys(components).map((name) => ({
        text: name,
        value: `${record.path}/${kebabCase(name)}`,
      }));
    };

    const baseMenu = computed(() =>
      router
        .getRoutes()
        .filter((item) => item.name !== 'PageNotFound' && !item.meta.hideInMenu)
        .reduce((acc, cur) => {
          const exampleChildren = buildExampleChildren(cur);
          let node;
          if (exampleChildren?.length) {
            // 갤러리 차트: '전체 보기'(갤러리) + 예제 목록 + API 문서를 children 으로 가진다.
            const children = [{ text: '전체 보기', value: cur.name }, ...exampleChildren];
            if (cur.props?.default?.mdText) {
              children.push({ text: 'API', value: `${cur.name}Api` });
            }
            node = {
              text: cur.name,
              value: `${cur.name}__group`,
              path: cur.path,
              expand: cur.path === activeBasePath.value,
              children,
            };
          } else {
            node = { text: cur.name, value: cur.name, path: cur.path };
          }

          if (!cur.meta.category) {
            acc.push(node);
          } else {
            const idx = acc.findIndex((v) => v.text === cur.meta.category);
            if (idx < 0) {
              acc.push({ text: cur.meta.category, value: cur.meta.category, children: [node] });
            } else {
              acc[idx].children.push(node);
            }
          }
          return acc;
        }, []),
    );

    // 검색어를 노드 트리에 재귀 적용한다. 매칭되는 하위가 있으면 부모를 펼친다.
    const filterNodes = (nodes, query) =>
      nodes.reduce((acc, node) => {
        const selfMatch = node.text.toLowerCase().includes(query);
        if (node.children) {
          if (selfMatch) {
            acc.push({ ...node, expand: true });
          } else {
            const children = filterNodes(node.children, query);
            if (children.length) {
              acc.push({ ...node, children, expand: true });
            }
          }
        } else if (selfMatch) {
          acc.push(node);
        }
        return acc;
      }, []);

    const filteredMenu = computed(() => {
      const query = searchText.value.toLowerCase().trim();
      if (!query) return baseMenu.value;
      return filterNodes(baseMenu.value, query);
    });

    const changeMenu = (newVal) => {
      // 예제 항목은 경로(value)로, 그 외에는 라우트 이름으로 이동한다.
      if (typeof newVal.value === 'string' && newVal.value.startsWith('/')) {
        router.push(newVal.value);
      } else {
        router.push({ name: newVal.value });
      }
    };

    // 현재 보고 있는 메뉴 항목으로 사이드바를 스크롤한다.
    const scrollToActive = () => {
      const container = menuListRef.value;
      const activeEl = container?.querySelector('.ev-menu-item.active > .ev-menu-title');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    };

    // 라우트 변경 시 active 값을 동기화하고 해당 항목으로 스크롤한다.
    watch(
      route,
      () => {
        currentMenu.value = route.value.params.exampleId
          ? route.value.path
          : route.value.name;
        nextTick(() => requestAnimationFrame(scrollToActive));
      },
      { immediate: true },
    );

    onMounted(() => {
      nextTick(() => requestAnimationFrame(scrollToActive));
    });

    // 펼칠 때 검색 인풋에 자동 포커스
    watch(
      () => props.collapsed,
      (newVal) => {
        if (!newVal) {
          setTimeout(() => {
            searchInputRef.value?.focus();
          }, 350);
        }
      },
    );

    return {
      filteredMenu,
      currentMenu,
      searchText,
      searchInputRef,
      menuListRef,
      changeMenu,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

.evui-navigation {
  position: fixed;
  top: $header-height;
  left: 0;
  width: $nav-width;
  height: calc(100% - #{$header-height});
  box-sizing: border-box;
  overflow: hidden;
  transition: width $animate-base;
  z-index: 5;

  @include themify() {
    border-right: 1px solid themed('border-color-base');
    background-color: themed('background-color-base');
  }

  &.is-collapsed {
    width: 0;
    border-right-color: transparent;
  }

  ul,
  li {
    list-style: none;
  }

  .ev-menu-item:not(.depth1) {
    border-left: 5px solid transparent;
    &.active {
      border-left: 5px solid $color-blue;
    }
  }
  .ev-menu-title {
    padding: 3px 33px;
    font-size: $font-size-base;
    line-height: 1.7em;

    @include themify() {
      color: themed('font-color-nav');
    }
  }
  .depth1 > .ev-menu-title {
    padding: 0 30px;
    margin: 27px 0 10px;

    @include themify() {
      color: themed('color-disabled');
    }
  }
}

/* ── Search Bar ── */
.evui-nav-search {
  display: flex;
  position: relative;
  padding: 12px 16px;
  align-items: center;
  min-width: $nav-width;

  @include themify() {
    border-bottom: 1px solid themed('border-color-base');
  }
}

.evui-nav-search-icon {
  position: absolute;
  left: 26px;
  font-size: 14px;
  pointer-events: none;

  @include themify() {
    color: themed('color-disabled');
  }
}

.evui-nav-search-input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition:
    border-color $animate-fast,
    background-color $animate-fast;

  @include themify() {
    border: 1px solid themed('border-color-base');
    background-color: themed('background-color-description');
    color: themed('font-color-base');
  }

  &:focus {
    border-color: $color-blue !important;
  }

  &::placeholder {
    @include themify() {
      color: themed('color-disabled');
    }
  }
}

.evui-nav-search-clear {
  position: absolute;
  right: 26px;
  cursor: pointer;
  font-size: 12px;
  padding: 4px;

  @include themify() {
    color: themed('color-disabled');
  }

  &:hover {
    @include themify() {
      color: themed('font-color-base');
    }
  }
}

/* ── Menu List ── */
.evui-nav-menu-list {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100% - 58px);
  padding-bottom: 17px;
  min-width: $nav-width;
}

/* ── No Results ── */
.evui-nav-no-results {
  padding: 30px 20px;
  text-align: center;
  font-size: 13px;

  @include themify() {
    color: themed('color-disabled');
  }
}

/* ── Toggle Button ── */
.evui-nav-toggle {
  display: flex;
  position: fixed;
  z-index: 15;
  top: calc(#{$header-height} + 14px);
  left: calc(#{$nav-width} - 14px);
  width: 28px;
  height: 28px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition:
    left $animate-base,
    background-color $animate-fast,
    color $animate-fast;
  font-size: 12px;

  @include themify() {
    background-color: themed('background-color-base');
    border: 1px solid themed('border-color-base');
    color: themed('font-color-nav');
  }

  &:hover {
    background-color: $color-blue !important;
    color: $color-white !important;
    border-color: $color-blue !important;
  }

  &.is-collapsed {
    left: 8px;
  }
}
</style>
