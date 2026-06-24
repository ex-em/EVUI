<template>
  <div class="detail-topbar">
    <router-link :to="basePath" class="detail-back">
      <i class="ev-icon-arrow-left" /> Gallery
    </router-link>
    <h2 class="detail-title">{{ $route.name.replace(/Api$/, '') }} API</h2>
  </div>

  <div class="api-layout">
    <div ref="contentRef" class="api-content">
      <markdown-view :source="mdText" />
    </div>

    <!-- 우측 목차 (On this page) -->
    <nav v-if="toc.length" class="api-toc">
      <div class="api-toc-title">On this page</div>
      <ul class="api-toc-list">
        <li
          v-for="item in toc"
          :key="item.id"
          :class="['api-toc-item', `level-${item.level}`, { active: activeId === item.id }]"
        >
          <a :title="item.text" @click="scrollTo(item.id)">{{ item.text }}</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import MarkdownView from 'docs/components/MarkdownView';

export default {
  name: 'ApiView',
  components: {
    MarkdownView,
  },
  inheritAttrs: false,
  props: {
    mdText: {
      type: String,
      default: '',
    },
    components: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const route = useRoute();
    const basePath = computed(() => `/${route.path.split('/').filter(Boolean)[0]}`);

    const contentRef = ref(null);
    const toc = ref([]);
    const activeId = ref('');

    // 렌더된 마크다운에서 heading(h2~h4)을 읽어 목차를 만든다. (실제 id를 써서 앵커가 정확함)
    const buildToc = () => {
      const root = contentRef.value;
      if (!root) {
        toc.value = [];
        return;
      }
      const headings = [...root.querySelectorAll('.markdown h2, .markdown h3, .markdown h4')];
      toc.value = headings
        .filter((el) => el.id && el.innerText.replace(/¶/g, '').trim() !== 'Example')
        .map((el) => ({
          id: el.id,
          text: el.innerText.replace(/¶/g, '').trim(),
          level: Number(el.tagName.slice(1)), // H2 → 2
        }));
    };

    // 고정 헤더 + 고정 topbar 높이. 이동/스파이 모두 이 값만큼 상단을 비운다.
    const SCROLL_OFFSET = 130;

    const scrollTo = (id) => {
      const el = document.getElementById(id);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
        window.scrollTo({ top: y, behavior: 'smooth' });
        activeId.value = id;
      }
    };

    // 스크롤 스파이: 뷰포트 상단(고정 영역 아래)을 지난 마지막 heading 을 active 로 표시한다.
    const updateActive = () => {
      let current = '';
      for (let i = 0; i < toc.value.length; i++) {
        const el = document.getElementById(toc.value[i].id);
        if (el && el.getBoundingClientRect().top <= SCROLL_OFFSET + 10) {
          current = toc.value[i].id;
        }
      }
      if (current && current !== activeId.value) {
        activeId.value = current;
      }
    };

    const handleScroll = () => {
      updateActive();
    };

    const refresh = () => {
      nextTick(() => {
        buildToc();
        updateActive();
      });
    };

    // 다른 차트의 API 로 이동하면 마크다운이 갱신되므로 목차를 다시 만든다.
    watch(() => props.mdText, refresh);

    onMounted(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      refresh();
    });

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      basePath,
      contentRef,
      toc,
      activeId,
      scrollTo,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.detail-topbar {
  display: flex;
  position: sticky;
  z-index: 4;
  top: $header-height;
  align-items: center;
  gap: 16px;
  padding: 15px 0;
  margin-bottom: 20px;

  @include themify() {
    background-color: themed('background-color-base');
    border-bottom: 1px solid themed('border-color-base');
  }
}

.detail-title {
  font-size: 28px;
  font-weight: bold;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 16px;
  font-size: 13px;
  text-decoration: none;
  transition: all $animate-fast;

  @include themify() {
    background-color: themed('background-color-description');
    border: 1px solid themed('border-color-base');
    color: themed('font-color-nav');
  }

  &:hover {
    background-color: $color-blue;
    border-color: $color-blue;
    color: $color-white;
  }
}

/* ── API 본문 + 우측 목차 레이아웃 ── */
.api-layout {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.api-content {
  flex: 1;
  min-width: 0;
}

.api-toc {
  position: sticky;
  // 고정 헤더($header-height) + 고정 topbar 높이만큼 아래에 둔다.
  top: calc(#{$header-height} + 75px);
  width: 220px;
  flex-shrink: 0;
  max-height: calc(100vh - #{$header-height} - 95px);
  overflow-y: auto;

  @include themify() {
    border-left: 1px solid themed('border-color-base');
  }
}

.api-toc-title {
  padding: 0 0 10px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  @include themify() {
    color: themed('color-disabled');
  }
}

.api-toc-list {
  list-style: none;
}

.api-toc-item {
  a {
    display: block;
    padding: 5px 16px;
    border-left: 2px solid transparent;
    margin-left: -1px;
    font-size: 13px;
    line-height: 1.4;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: all $animate-fast;

    @include themify() {
      color: themed('font-color-nav');
    }

    &:hover {
      color: $color-blue;
    }
  }

  &.level-3 a {
    padding-left: 30px;
    font-size: 12px;
  }
  &.level-4 a {
    padding-left: 44px;
    font-size: 12px;
  }

  &.active a {
    border-left-color: $color-blue;
    color: $color-blue;
    font-weight: 600;
  }
}

@media all and (max-width: 1280px) {
  .api-toc {
    display: none;
  }
}
</style>
