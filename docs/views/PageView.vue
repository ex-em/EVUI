<template>
  <h2 class="content-title">
    {{ $route.name }}
  </h2>

  <!-- Article Breadcrumb -->
  <div
    v-if="articleNames.length"
    class="article-breadcrumb-wrapper"
  >
    <button
      v-if="canScrollLeft"
      class="breadcrumb-scroll-btn breadcrumb-scroll-btn-left"
      @click="scrollLeft"
    >
      <i class="ev-icon-s-arrow-left" />
    </button>
    <nav
      ref="breadcrumbRef"
      class="article-breadcrumb"
      @scroll="updateScrollButtons"
    >
      <a
        v-for="name in articleNames"
        :key="name"
        :class="['breadcrumb-item', { active: activeArticle === toKebab(name) }]"
        :title="name"
        @click="scrollToArticle(name)"
      >
        {{ name }}
      </a>
    </nav>
    <button
      v-if="canScrollRight"
      class="breadcrumb-scroll-btn breadcrumb-scroll-btn-right"
      @click="scrollRight"
    >
      <i class="ev-icon-s-arrow-right" />
    </button>
  </div>

  <example
    v-for="(value, name, index) in components"
    :key="`${currentMenu}_${name}_${index}`"
    v-bind="value"
    :title="name"
  />
  <icon-list v-if="$route.name === 'Icon'" />
  <markdown-view :source="mdText" />
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { kebabCase } from 'lodash-es';
import router from 'docs/router';
import Example from 'docs/components/Example';
import MarkdownView from 'docs/components/MarkdownView';
import IconList from 'docs/views/icon/example/IconList';

export default {
  components: {
    Example,
    MarkdownView,
    IconList,
  },
  inheritAttrs: false,
  props: {
    mdText: {
      type: String,
      default: '',
    },
    components: {
      type: Object,
      default: () => {},
    },
  },
  setup(props) {
    const currentMenu = computed(() => router.currentRoute?.value.name);
    const activeArticle = ref('');
    const breadcrumbRef = ref(null);
    const canScrollLeft = ref(false);
    const canScrollRight = ref(false);
    let ticking = false;

    const toKebab = name => kebabCase(name);

    // components 키 + API 항목으로 breadcrumb 생성
    const articleNames = computed(() => {
      const names = props.components ? Object.keys(props.components) : [];
      if (props.mdText) {
        names.push('API');
      }
      return names;
    });

    // 특정 article로 스크롤 이동
    const scrollToArticle = (name) => {
      const id = kebabCase(name);
      router.push({ hash: `#${id}` });
    };

    // 현재 뷰포트에 보이는 article 감지 (Scroll Spy)
    const updateActiveArticle = () => {
      const names = articleNames.value;
      let current = '';

      for (let i = 0; i < names.length; i++) {
        const id = kebabCase(names[i]);
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // header(60px) + breadcrumb(~50px) 아래에 있는 article을 감지
          if (rect.top <= 130) {
            current = id;
          }
        }
      }

      if (current && current !== activeArticle.value) {
        activeArticle.value = current;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveArticle();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 스크롤 버튼 표시 상태 업데이트
    const updateScrollButtons = () => {
      const container = breadcrumbRef.value;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      canScrollLeft.value = scrollLeft > 0;
      canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1;
    };

    // 왼쪽으로 스크롤
    const scrollLeft = () => {
      const container = breadcrumbRef.value;
      if (!container) return;
      container.scrollBy({ left: -200, behavior: 'smooth' });
    };

    // 오른쪽으로 스크롤
    const scrollRight = () => {
      const container = breadcrumbRef.value;
      if (!container) return;
      container.scrollBy({ left: 200, behavior: 'smooth' });
    };

    // active breadcrumb 아이템이 보이도록 자동 스크롤
    watch(activeArticle, () => {
      nextTick(() => {
        const container = breadcrumbRef.value;
        if (!container) return;
        const activeEl = container.querySelector('.breadcrumb-item.active');
        if (activeEl) {
          const containerRect = container.getBoundingClientRect();
          const itemRect = activeEl.getBoundingClientRect();
          if (itemRect.left < containerRect.left || itemRect.right > containerRect.right) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
        updateScrollButtons();
      });
    });

    // 페이지 변경 시 scroll spy 재설정
    watch(currentMenu, () => {
      activeArticle.value = '';
      nextTick(() => {
        updateActiveArticle();
        updateScrollButtons();
      });
    });

    // articleNames 변경 시 스크롤 버튼 상태 업데이트
    watch(articleNames, () => {
      nextTick(() => {
        updateScrollButtons();
      });
    });

    // 창 크기 변경 시 스크롤 버튼 상태 업데이트
    const handleResize = () => {
      updateScrollButtons();
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });
      nextTick(() => {
        updateActiveArticle();
        updateScrollButtons();
      });
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    });

    return {
      currentMenu,
      articleNames,
      activeArticle,
      breadcrumbRef,
      canScrollLeft,
      canScrollRight,
      toKebab,
      scrollToArticle,
      scrollLeft,
      scrollRight,
      updateScrollButtons,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

/* ── Article Breadcrumb ── */
.article-breadcrumb-wrapper {
  display: flex;
  position: sticky;
  z-index: 4;
  top: $header-height;
  align-items: center;
  margin-bottom: 10px;

  @include themify() {
    background-color: themed('background-color-base');
    border-bottom: 1px solid themed('border-color-base');
  }
}

.article-breadcrumb {
  display: flex;
  gap: 6px;
  padding: 12px 0;
  overflow-x: auto;
  flex: 1;

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.breadcrumb-scroll-btn {
  display: flex;
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all $animate-fast;
  flex-shrink: 0;
  z-index: 5;

  @include themify() {
    border: 1px solid themed('border-color-base');
    background-color: themed('background-color-description');
    color: themed('font-color-nav');
  }

  &:hover {
    background-color: $color-blue;
    color: $color-white;
    border-color: $color-blue;
  }

  &:active {
    transform: scale(0.95);
  }

  i {
    font-size: 16px;
  }
}

.breadcrumb-scroll-btn-left {
  margin-right: 8px;
}

.breadcrumb-scroll-btn-right {
  margin-left: 8px;
}

.breadcrumb-item {
  display: inline-flex;
  padding: 5px 14px;
  align-items: center;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all $animate-fast;
  user-select: none;
  flex-shrink: 0;

  @include themify() {
    background-color: themed('background-color-description');
    border: 1px solid themed('border-color-base');
    color: themed('font-color-nav');
  }

  &:hover {
    color: $color-blue;
    border-color: $color-blue;
  }

  &.active {
    background-color: $color-blue;
    color: $color-white;
    border-color: $color-blue;
  }
}
</style>
