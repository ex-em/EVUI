<template>
  <article class="article-wrapper">
    <h3 :id="kebabCase(title)" class="article-title">
      <a class="article-title-anchor" @click="$router.push({ hash: `#${kebabCase(title)}` })">
        ¶
      </a>
      {{ title }}
    </h3>
    <p
      class="article-description"
      v-html="description" />
    <div
        :class="['article-example', { 'vertical-mode':verticalMode }]"
    >
      <div
        ref="viewArea"
        :class="['view', { 'vertical-mode-item':verticalMode }]"
        :style="viewStyle"
      >
        <component :is="component" />
      </div>
      <div
        v-show="canResize"
        ref="resizeHandle"
        class="resize-handle"
        @mousedown="startResize"
      />
      <div
        v-show="codeVisible"
        v-highlight
        :class="[
          'code',
          { 'expend': codeExpend },
          { 'vertical-mode-item':verticalMode }
        ]"
        :style="codeStyle"
      >
        <div ref="codeWrapper" class="code-wrapper" :style="{ height: `${viewAreaHeight}px` }">
          <pre class="html">
            {{ parsedData?.template?.content }}
          </pre>
          <pre class="javascript">
            {{ parsedData?.script?.content }}
          </pre>
        </div>
        <div class="btn-show-more" @click="clickExpend">
          <i class="ev-icon-document-vertically" />
          {{ codeExpend ? 'Hide the code' : 'Show more code' }}
        </div>
      </div>
      <button
        :class="['btn-toggle-code', { 'is-narrow': isNarrow }]"
        :title="codeVisible ? 'Hide code' : 'Show code'"
        @click="toggleCode"
      >
        <i :class="toggleIcon" />
      </button>
    </div>
  </article>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { kebabCase } from 'lodash-es';
import highlight from 'docs/directives/highlight';

export default {
  name: 'Example',
  directives: {
    highlight,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    component: {
      type: Object,
      default: null,
    },
    parsedData: {
      type: [String, Object],
      default: null,
    },
    verticalMode: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const codeExpend = ref(false);
    const codeWrapper = ref(null);
    const clickExpend = () => {
      codeExpend.value = !codeExpend.value;
      if (!codeExpend.value) {
        codeWrapper.value.scrollTop = 0;
      }
    };

    const viewArea = ref();
    const viewAreaHeight = ref();
    onMounted(() => {
      viewAreaHeight.value = viewArea.value.offsetHeight;
    });

    // --- 반응형 감지 (1280px 기준) ---
    const NARROW_QUERY = '(max-width: 1280px)';
    const mql = window.matchMedia(NARROW_QUERY);
    const isNarrow = ref(mql.matches);

    // --- code 토글 & 드래그 리사이즈 ---
    const codeVisible = ref(true);
    const resizeHandle = ref(null);
    const viewRatio = ref(null); // wide 모드: 가로 비율 (%)
    const narrowViewHeight = ref(null); // narrow 모드: view 높이 (px)

    const onMediaChange = (e) => {
      isNarrow.value = e.matches;
      viewRatio.value = null;
      narrowViewHeight.value = null;
    };
    mql.addEventListener('change', onMediaChange);
    onUnmounted(() => mql.removeEventListener('change', onMediaChange));

    const toggleCode = () => {
      codeVisible.value = !codeVisible.value;
      viewRatio.value = null;
      narrowViewHeight.value = null;
    };

    // wide 모드: 가로 비율 스타일 / narrow 모드: 세로 높이 스타일
    const viewStyle = computed(() => {
      if (isNarrow.value) {
        if (narrowViewHeight.value != null) return { height: `${narrowViewHeight.value}px` };
        return {};
      }
      if (!codeVisible.value) return { width: '100%', borderRight: 'none' };
      if (viewRatio.value != null) return { width: `${viewRatio.value}%` };
      return {};
    });
    const codeStyle = computed(() => {
      if (isNarrow.value) return {};
      if (viewRatio.value != null) return { width: `${100 - viewRatio.value}%` };
      return {};
    });

    // 양쪽 모드 모두 리사이즈 가능
    const canResize = computed(() => codeVisible.value);

    // narrow(상하 배치) → 상하 화살표, wide(좌우 배치) → 좌우 화살표
    const toggleIcon = computed(() => {
      if (isNarrow.value) {
        return codeVisible.value ? 'ev-icon-arrow-down' : 'ev-icon-arrow-up';
      }
      return codeVisible.value ? 'ev-icon-arrow-right' : 'ev-icon-arrow-left';
    });

    const startResize = (e) => {
      e.preventDefault();
      const narrow = isNarrow.value;
      const cursorStyle = narrow ? 'row-resize' : 'col-resize';

      document.body.style.cursor = cursorStyle;
      document.body.style.userSelect = 'none';

      if (narrow) {
        // --- narrow 모드: 세로 리사이즈 (view 높이 조절) ---
        const startY = e.clientY;
        const startHeight = viewArea.value.offsetHeight;
        const onMouseMove = (ev) => {
          const delta = ev.clientY - startY;
          const newHeight = Math.max(80, startHeight + delta);
          narrowViewHeight.value = newHeight;
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      } else {
        // --- wide 모드: 가로 리사이즈 (좌우 비율 조절) ---
        const container = viewArea.value.parentElement;
        const onMouseMove = (ev) => {
          const rect = container.getBoundingClientRect();
          let ratio = ((ev.clientX - rect.left) / rect.width) * 100;
          ratio = Math.min(Math.max(ratio, 5), 95);
          viewRatio.value = ratio;
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    };

    return {
      kebabCase,
      codeExpend,
      codeWrapper,
      clickExpend,
      viewArea,
      viewAreaHeight,
      isNarrow,
      codeVisible,
      toggleCode,
      resizeHandle,
      viewRatio,
      narrowViewHeight,
      viewStyle,
      codeStyle,
      canResize,
      toggleIcon,
      startResize,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

.content-title {
  padding-bottom: 15px;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: bold;

  @include themify() {
    border-bottom: 1px solid themed('border-color-base');
  }
}
.article-wrapper {
  padding: 20px 0 55px;
  font-size: 15px;
}
.article-title {
  margin-bottom: 20px;
  font-size: 23px;
  font-weight: bold;
  &-anchor {
    float: left;
    margin-left: -1em;
    color: $color-blue;
    opacity: 0;
    cursor: pointer;
    text-decoration: none;
    &:hover {
      opacity: 1;
    }
  }
  &:hover .article-title-anchor {
    opacity: 1;
  }
}
.article-description {
  margin-bottom: 30px;
  line-height: 1.5em;
}
.article-example {
  display: flex;
  position: relative;
  border: 1px solid $color-yellow;
  border-radius: 4px;
  .view {
    width: 50%;
    padding: 15px 20px;
    border-right: 1px solid $color-yellow;
  }
  .resize-handle {
    position: relative;
    z-index: 2;
    width: 6px;
    margin: 0 -3px;
    cursor: col-resize;
    background: transparent;
    flex-shrink: 0;
    &:hover,
    &:active {
      background: rgba($color-blue, 0.3);
    }
  }
  .btn-toggle-code {
    display: flex;
    position: absolute;
    z-index: 3;
    top: 50%;
    right: -14px;
    width: 28px;
    height: 48px;
    justify-content: center;
    align-items: center;
    transform: translateY(-50%);
    border: 1px solid $color-yellow;
    border-radius: 0 6px 6px 0;
    cursor: pointer;
    font-size: 14px;
    transition: all $animate-fast;

    @include themify() {
      background-color: themed('background-color-base');
      color: themed('font-color-base');
    }
    &:hover {
      background-color: rgba($color-yellow, 0.5);
    }
  }
  .case {
    padding: 15px 0;
    &-title {
      margin-bottom: 25px;
      font-size: 15px;
      font-weight: bold;
    }
  }
  .description {
    padding: 9px 12px;
    margin-top: 15px;
    border-radius: 4px;
    font-size: 13px;
    word-break: break-all;
    overflow-x: auto;

    @include themify() {
      background-color: themed('background-color-description');
      border: 1px solid themed('border-color-base');
    }
    .badge {
      display: inline-block;
      padding: 3px 7px;
      margin-right: 10px;
      border-radius: 4px;

      @include themify() {
        background-color: themed('border-color-base');
      }
      &.yellow {
        background-color: rgba($color-yellow, 0.6);
        color: $color-black;

        @include themify() {
          border: 1px solid themed('border-color-base');
        }
      }
      &.dark {
        background-color: #666666;
        color: $color-white;
      }
    }
    .btn {
      padding: 4px 7px;
      outline: none;
      cursor: pointer;
      background-color: rgba($color-yellow, 0.5);
      border: 1px solid $color-yellow;

      @include themify() {
        color: themed('font-color-base');
      }
      &:hover {
        background-color: $color-yellow;
      }
    }
  }
  .code {
    position: relative;
    width: 50%;
    overflow: hidden;
    .code-wrapper {
      height: 100px;
      min-height: 350px;
      overflow: hidden;
    }
    .btn-show-more {
      display: flex;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      line-height: 45px;
      background-color: rgba($color-yellow, 0.5);
      backdrop-filter: blur(2px);
      color: $color-black;
      text-align: center;
      cursor: pointer;
      transition: all $animate-fast;
      &:hover {
        background-color: rgba($color-yellow, 0.8);
      }
    }
    &.expend {
      .code-wrapper {
        padding-top: 40px;
        overflow-y: auto;
      }
      .btn-show-more {
        height: 40px;
      }
    }
  }
}
.vertical-mode {
  display: block !important;
}
.vertical-mode-item {
  width: 100% !important;
}

@media all and (max-width: 1280px) {
  .article-example {
    display: block;
    .view {
      width: 100% !important;
      border-right: 0;
      border-bottom: 1px solid $color-yellow;
      overflow: auto;
    }
    // narrow 모드: 리사이즈 핸들을 가로 바로 전환
    .resize-handle {
      width: 100% !important;
      height: 6px;
      margin: -3px 0;
      cursor: row-resize;
    }
    .code {
      max-width: none;
      width: 100% !important;
      .code-wrapper {
        height: 40px !important;
        transition: all $animate-fast;
      }
      .btn-show-more {
        height: 40px;
      }
      &.expend {
        .code-wrapper {
          height: 300px !important;
        }
      }
    }
    // narrow 모드: 토글 버튼을 하단 중앙으로 이동
    .btn-toggle-code.is-narrow {
      top: auto;
      bottom: -14px;
      right: 50%;
      transform: translateX(50%);
      width: 48px;
      height: 28px;
      border-radius: 0 0 6px 6px;
    }
  }
}
</style>
