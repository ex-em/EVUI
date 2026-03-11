<template>
  <nav
    class="evui-navigation"
    :class="{ 'is-collapsed': collapsed }"
  >
    <!-- Search bar -->
    <div class="evui-nav-search">
      <i class="ev-icon-search evui-nav-search-icon" />
      <input
        ref="searchInputRef"
        v-model="searchText"
        class="evui-nav-search-input"
        type="text"
        placeholder="메뉴 검색..."
        @keydown.esc="searchText = ''"
      />
      <i
        v-if="searchText"
        class="ev-icon-close evui-nav-search-clear"
        @click="searchText = ''"
      />
    </div>

    <!-- Menu list -->
    <div class="evui-nav-menu-list">
      <ev-menu
        v-model="currentMenu"
        :items="filteredMenu"
        @change="changeMenu"
      />
      <p
        v-if="searchText && !filteredMenu.length"
        class="evui-nav-no-results"
      >
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
import { ref, computed, watch } from 'vue';
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

    router.beforeEach((to, from, next) => {
      if (!from.name) {
        currentMenu.value = to.name;
      }
      next();
    });

    const menu = router.getRoutes().filter(item => item.name !== 'PageNotFound').reduce((acc, cur) => {
      const menuInfoObj = {
        text: cur.name,
        value: cur.name,
      };
      if (!cur.meta.category) {
        acc.push(menuInfoObj);
      } else {
        const idx = acc.findIndex(v => v.text === cur.meta.category);
        if (idx < 0) {
          acc.push({
            text: cur.meta.category,
            value: cur.meta.category,
            children: [menuInfoObj],
          });
        } else {
          acc[idx].children.push(menuInfoObj);
        }
      }
      return acc;
    }, []);

    const filteredMenu = computed(() => {
      const query = searchText.value.toLowerCase().trim();
      if (!query) return menu;
      return menu.reduce((acc, item) => {
        if (item.children) {
          // 카테고리명이 매칭되면 하위 메뉴 전체 표시
          if (item.text.toLowerCase().includes(query)) {
            acc.push(item);
          } else {
            // 하위 메뉴 중 매칭되는 항목만 필터링
            const matchingChildren = item.children.filter(
              child => child.text.toLowerCase().includes(query),
            );
            if (matchingChildren.length > 0) {
              acc.push({ ...item, children: matchingChildren });
            }
          }
        } else if (item.text.toLowerCase().includes(query)) {
          acc.push(item);
        }
        return acc;
      }, []);
    });

    const changeMenu = (newVal) => {
      router.push({ name: newVal.value });
    };

    // 펼칠 때 검색 인풋에 자동 포커스
    watch(() => props.collapsed, (newVal) => {
      if (!newVal) {
        setTimeout(() => {
          searchInputRef.value?.focus();
        }, 350);
      }
    });

    return {
      menu,
      filteredMenu,
      currentMenu,
      searchText,
      searchInputRef,
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

  ul, li {
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
  align-items: center;
  padding: 12px 16px;
  position: relative;
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
  transition: border-color $animate-fast, background-color $animate-fast;

  @include themify() {
    background-color: themed('background-color-description');
    color: themed('font-color-base');
    border: 1px solid themed('border-color-base');
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
  position: fixed;
  top: calc(#{$header-height} + 14px);
  left: calc(#{$nav-width} - 14px);
  z-index: 15;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: left $animate-base, background-color $animate-fast, color $animate-fast;
  font-size: 12px;

  @include themify() {
    background-color: themed('background-color-base');
    color: themed('font-color-nav');
    border: 1px solid themed('border-color-base');
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
