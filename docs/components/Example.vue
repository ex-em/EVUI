<template>
  <article class="article-wrapper">
    <h3 :id="kebabCase(title)" class="article-title">
      <a class="article-title-anchor" @click="$router.push({ hash: `#${kebabCase(title)}` })">
        ¶
      </a>
      {{ title }}
    </h3>
    <p class="article-description" v-html="description" />
    <div :class="['article-example', { 'vertical-mode': verticalMode }]">
      <div
        ref="viewArea"
        :class="['view', { 'vertical-mode-item': verticalMode }]"
        :style="viewStyle"
      >
        <component :is="component" ref="exampleComp" />
      </div>
      <div v-show="canResize" ref="resizeHandle" class="resize-handle" @mousedown="startResize" />
      <div
        v-show="codeVisible"
        :class="['code', { 'vertical-mode-item': verticalMode }]"
        :style="codeStyle"
      >
        <!-- 탭 바 -->
        <div v-if="hasPlayground" class="code-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['code-tab', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div ref="codeWrapper" class="code-wrapper">
          <!-- chartData 탭 -->
          <div
            v-if="dataTabMounted"
            v-show="activeTab === 'data'"
            class="playground-tab"
          >
            <chart-playground-editor
              :model-value="snapshotData"
              :raw-script="parsedData?.script?.content"
              source-var="chartData"
              @apply="onApplyData"
            />
          </div>

          <!-- chartOptions 탭 -->
          <div
            v-if="optionsTabMounted"
            v-show="activeTab === 'options'"
            class="playground-tab"
          >
            <chart-playground-editor
              :model-value="snapshotOptions"
              :raw-script="parsedData?.script?.content"
              source-var="chartOptions"
              @apply="onApplyOptions"
            />
          </div>

          <!-- Full Code 탭 (플레이그라운드 미지원 예제는 이 뷰만 노출) -->
          <div v-show="activeTab === 'source'" v-highlight>
            <pre class="html">
              {{ parsedData?.template?.content }}
            </pre>
            <pre class="javascript">
              {{ parsedData?.script?.content }}
            </pre>
          </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { kebabCase } from 'lodash-es';
import highlight from 'docs/directives/highlight';
import ChartPlaygroundEditor from 'docs/components/ChartPlaygroundEditor';

export default {
  name: 'Example',
  components: {
    ChartPlaygroundEditor,
  },
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
    // --- 기존 코드 토글 / 리사이즈 ---
    const codeWrapper = ref(null);

    const viewArea = ref();

    const NARROW_QUERY = '(max-width: 1280px)';
    const mql = window.matchMedia(NARROW_QUERY);
    const isNarrow = ref(mql.matches);

    const codeVisible = ref(true);
    const resizeHandle = ref(null);
    const viewRatio = ref(null);
    const narrowViewHeight = ref(null);

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

    const viewStyle = computed(() => {
      if (isNarrow.value) {
        if (narrowViewHeight.value != null) {
          return { height: `${narrowViewHeight.value}px` };
        }
        return {};
      }
      if (!codeVisible.value) {
        return { width: '100%', borderRight: 'none' };
      }
      if (viewRatio.value != null) {
        return { width: `${viewRatio.value}%` };
      }
      return {};
    });
    const codeStyle = computed(() => {
      if (isNarrow.value) return {};
      if (viewRatio.value != null) {
        return { width: `${100 - viewRatio.value}%` };
      }
      return {};
    });

    const canResize = computed(() => codeVisible.value);

    const toggleIcon = computed(() => {
      if (isNarrow.value) {
        return codeVisible.value
          ? 'ev-icon-arrow-down'
          : 'ev-icon-arrow-up';
      }
      return codeVisible.value
        ? 'ev-icon-arrow-right'
        : 'ev-icon-arrow-left';
    });

    const startResize = (e) => {
      e.preventDefault();
      const narrow = isNarrow.value;
      document.body.style.cursor = narrow ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';

      if (narrow) {
        const startY = e.clientY;
        const startHeight = viewArea.value.offsetHeight;
        const onMouseMove = (ev) => {
          narrowViewHeight.value = Math.max(80, startHeight + ev.clientY - startY);
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
        const container = viewArea.value.parentElement;
        const onMouseMove = (ev) => {
          const rect = container.getBoundingClientRect();
          let ratio = ((ev.clientX - rect.left) / rect.width) * 100;
          viewRatio.value = Math.min(Math.max(ratio, 5), 95);
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

    // --- Playground 탭 ---
    const exampleComp = ref(null);
    const hasPlayground = ref(false);
    const activeTab = ref('source');

    const dataTabMounted = ref(false);
    const optionsTabMounted = ref(false);

    const snapshotData = ref(null);
    const snapshotOptions = ref(null);

    const tabs = [
      { key: 'data', label: 'chartData' },
      { key: 'options', label: 'chartOptions' },
      { key: 'source', label: 'Full Code' },
    ];

    watch(activeTab, (tab) => {
      const comp = exampleComp.value;
      if (!comp) return;
      if (tab === 'data' && !dataTabMounted.value) {
        snapshotData.value = comp.chartData;
        dataTabMounted.value = true;
      }
      if (tab === 'options' && !optionsTabMounted.value) {
        snapshotOptions.value = comp.chartOptions;
        optionsTabMounted.value = true;
      }
    });

    onMounted(() => {
      const comp = exampleComp.value;
      if (
        comp
        && comp.chartData !== undefined
        && comp.chartOptions !== undefined
        && typeof comp.onApply === 'function'
      ) {
        hasPlayground.value = true;
        // 플레이그라운드 지원 예제는 첫 탭(chartData)을 기본 선택
        activeTab.value = 'data';
      }
    });

    const onApplyData = (newData) => {
      exampleComp.value?.onApply?.({ chartData: newData });
    };
    const onApplyOptions = (newOptions) => {
      exampleComp.value?.onApply?.({ chartOptions: newOptions });
    };

    return {
      kebabCase,
      codeWrapper,
      viewArea,
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
      exampleComp,
      hasPlayground,
      activeTab,
      tabs,
      dataTabMounted,
      optionsTabMounted,
      snapshotData,
      snapshotOptions,
      onApplyData,
      onApplyOptions,
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
  /* 컨테이너가 높이의 기준 — 모든 탭(view/code)이 동일한 높이를 공유한다 */
  height: 480px;
  border: 1px solid $color-yellow;
  border-radius: 4px;
  .view {
    width: 50%;
    height: 100%;
    padding: 15px 20px;
    overflow: auto;
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

  /* ── 탭 바 ── */
  .code-tabs {
    display: flex;
    position: relative;
    z-index: 1;
    flex-shrink: 0;

    @include themify() {
      background-color: themed('background-color-base');
      border-bottom: 1px solid themed('border-color-base');
    }
  }
  .code-tab {
    padding: 7px 14px;
    border: none;
    background: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: color $animate-fast;
    border-bottom: 2px solid transparent;

    @include themify() {
      color: themed('font-color-nav');
    }
    &:hover {
      color: $color-blue;
    }
    &.active {
      color: $color-blue;
      border-bottom-color: $color-blue;
    }
  }

  /* ── Playground 탭 콘텐츠 ── */
  .playground-tab {
    height: 100%;
  }

  /* ── 코드 영역 ── */
  .code {
    display: flex;
    position: relative;
    flex-direction: column;
    width: 50%;
    min-height: 0;
    overflow: hidden;

    .code-wrapper {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }
}
.vertical-mode {
  display: block !important;
  height: auto !important;
}
.vertical-mode-item {
  width: 100% !important;
}

@media all and (max-width: 1280px) {
  .article-example {
    display: block;
    height: auto;
    .view {
      width: 100% !important;
      height: 300px;
      border-right: 0;
      border-bottom: 1px solid $color-yellow;
      overflow: auto;
    }
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
        height: 300px !important;
        transition: all $animate-fast;
      }
    }
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
