<template>
  <h2 class="content-title">
    {{ $route.name }}
  </h2>

  <!-- Article Breadcrumb -->
  <nav
    v-if="articleNames.length"
    ref="breadcrumbRef"
    class="article-breadcrumb"
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

  <example
    v-for="(value, name, index) in components"
    :key="`${currentMenu}_${name}_${index}`"
    v-bind="value"
    :title="name"
  />
  <icon-list v-if="$route.name === 'Icon'"/>
  <markdown-view
    :source="mdText"
  />
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
      });
    });

    // 페이지 변경 시 scroll spy 재설정
    watch(currentMenu, () => {
      activeArticle.value = '';
      nextTick(() => {
        updateActiveArticle();
      });
    });

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      nextTick(() => updateActiveArticle());
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      currentMenu,
      articleNames,
      activeArticle,
      breadcrumbRef,
      toKebab,
      scrollToArticle,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

/* ── Article Breadcrumb ── */
.article-breadcrumb {
  display: flex;
  gap: 6px;
  position: sticky;
  top: $header-height;
  z-index: 4;
  padding: 12px 0;
  margin-bottom: 10px;
  overflow-x: auto;

  @include themify() {
    background-color: themed('background-color-base');
    border-bottom: 1px solid themed('border-color-base');
  }

  /* 스크롤바 숨김 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all $animate-fast;
  user-select: none;
  flex-shrink: 0;

  @include themify() {
    color: themed('font-color-nav');
    background-color: themed('background-color-description');
    border: 1px solid themed('border-color-base');
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
