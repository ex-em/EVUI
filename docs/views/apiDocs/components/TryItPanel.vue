<template>
  <aside class="ad-tryit" :class="{ 'is-open': !!node }">
    <template v-if="node">
      <header class="ad-tryit-header">
        <div class="ad-tryit-title">
          <span class="ad-badge" :class="`ad-badge-kind-${node.kind}`">{{ node.kind }}</span>
          <code class="ad-tryit-path">{{ node.path }}</code>
        </div>
        <button class="ad-tryit-close" title="닫기" @click="store.closeTryIt()">✕</button>
      </header>

      <div v-if="playground" class="ad-tryit-body">
        <!-- 라이브 미리보기: 플레이그라운드 예제 컴포넌트 -->
        <div class="ad-tryit-live">
          <component :is="playground.component" ref="pgCompRef" />
        </div>

        <!-- 에디터 영역 -->
        <div class="ad-tryit-editor">
          <div class="ad-tryit-editor-tabs">
            <button
              v-for="tab in EDITOR_TABS"
              :key="tab.key"
              class="ad-tryit-editor-tab"
              :class="{ 'is-active': editorTab === tab.key }"
              @click="editorTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
          <ChartPlaygroundEditor
            v-if="editorReady && editorTab === 'data'"
            :key="`data-${node.id}`"
            :model-value="snapshotData"
            :focus-path="dataFocus"
            @apply="applyData"
          />
          <ChartPlaygroundEditor
            v-if="editorReady && editorTab === 'options'"
            :key="`options-${node.id}`"
            :model-value="snapshotOptions"
            :focus-path="optionsFocus"
            @apply="applyOptions"
          />
        </div>
      </div>

      <p v-else class="ad-empty">
        이 컴포넌트는 아직 플레이그라운드 예제가 등록되지 않았습니다.<br />
        (JSON 문서의 playground 필드로 지정합니다)
      </p>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import ChartPlaygroundEditor from 'docs/components/ChartPlaygroundEditor';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const EDITOR_TABS = [
  { key: 'data', label: 'chartData' },
  { key: 'options', label: 'chartOptions' },
];

const store = useApiDocsStore();

const node = computed(() => store.tryItNode.value);
const playground = computed(() => store.playgroundExample.value);

const pgCompRef = ref(null);
const editorTab = ref('options');
const editorReady = ref(false);
const snapshotData = ref(null);
const snapshotOptions = ref(null);

/** 선택한 노드의 키 경로 (루트 data/options 제외) — 에디터 커서 포커스에 사용 */
const focusSegments = computed(() => {
  if (!node.value || node.value.kind !== 'props') return null;
  const segments = node.value.path.split('.');
  return segments.length > 1 ? segments.slice(1) : null;
});
const dataFocus = computed(() =>
  (node.value?.path.startsWith('data') ? focusSegments.value : null));
const optionsFocus = computed(() =>
  (node.value?.path.startsWith('options') ? focusSegments.value : null));

// Try It 대상 노드가 바뀔 때마다 현재 차트 상태를 스냅샷하고
// 노드 종류에 맞는 탭(data.* → chartData, 그 외 → chartOptions)을 연다.
watch(
  [node, pgCompRef],
  async ([n]) => {
    if (!n || !playground.value) return;
    editorReady.value = false;
    await nextTick();
    const comp = pgCompRef.value;
    if (!comp) return;
    snapshotData.value = comp.chartData;
    snapshotOptions.value = comp.chartOptions;
    editorTab.value = n.path.startsWith('data') ? 'data' : 'options';
    editorReady.value = true;
  },
  { immediate: true },
);

const applyData = (value) => {
  pgCompRef.value?.onApply?.({ chartData: value });
};
const applyOptions = (value) => {
  pgCompRef.value?.onApply?.({ chartOptions: value });
};
</script>
