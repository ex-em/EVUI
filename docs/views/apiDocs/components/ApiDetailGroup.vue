<template>
  <article
    class="apidoc-item"
    :class="{ 'is-active': isHeadActive }"
    :style="{ marginLeft: `${head.depth * 12}px` }"
    :data-node-id="head.id"
    @click="store.setActiveFromScroll(head.id)"
  >
    <!-- 그룹 헤더: Try It은 그룹당 하나 -->
    <header class="apidoc-item-header">
      <h3 class="apidoc-item-title">
        <span v-if="parentPath" class="apidoc-item-parent-path">{{ parentPath }}.</span
        ><span class="apidoc-item-name">{{ head.name }}</span>
      </h3>
      <!-- tryIt: false 지정 시 버튼 숨김 -->
      <button
        v-if="head.tryIt !== false"
        class="apidoc-tryit-btn"
        @click.stop="store.openTryIt(head.id)"
      >
        Try It ▶
      </button>
    </header>

    <div class="apidoc-item-badges">
      <span class="apidoc-badge" :class="`apidoc-badge-kind-${head.kind}`">{{ kindLabel }}</span>
      <span v-if="head.type" class="apidoc-badge apidoc-badge-type">{{ head.type }}</span>
      <span v-if="head.required" class="apidoc-badge apidoc-badge-required">required</span>
      <span v-if="head.default !== undefined" class="apidoc-badge apidoc-badge-default">
        default: <code>{{ head.default }}</code>
      </span>
      <span v-if="head.version" class="apidoc-badge apidoc-badge-version">v{{ head.version }}+</span>
    </div>

    <p class="apidoc-item-desc">{{ head.description }}</p>

    <div v-if="head.values.length" class="apidoc-item-values">
      <span class="apidoc-item-values-label">가능한 값</span>
      <code v-for="value in head.values" :key="value" class="apidoc-item-value">{{ value }}</code>
    </div>

    <!-- leaf 하위 속성: 컴팩트 행 (개별 Try It 없음) -->
    <ul v-if="rows.length" class="apidoc-group-rows">
      <li
        v-for="row in rows"
        :key="row.id"
        class="apidoc-group-row"
        :class="{
          'is-active': store.flashId.value === row.id,
          'is-object': row.childIds.length > 0,
        }"
        :style="{ paddingLeft: `${14 + (row.depth - head.depth - 1) * 20}px` }"
        :data-node-id="row.id"
        @click.stop="store.setActiveFromScroll(row.id)"
      >
        <div class="apidoc-row-head">
          <code class="apidoc-row-name">
            <span class="apidoc-row-path">{{ rowParentPath(row) }}.</span>{{ row.name }}
          </code>
          <span v-if="row.type" class="apidoc-badge apidoc-badge-type">{{ row.type }}</span>
          <span v-if="row.required" class="apidoc-badge apidoc-badge-required">required</span>
          <span v-if="row.default !== undefined" class="apidoc-badge apidoc-badge-default">
            default: <code>{{ row.default }}</code>
          </span>
          <span v-if="row.version" class="apidoc-badge apidoc-badge-version">v{{ row.version }}+</span>
          <!-- 전용 tryIt 스니펫이 있는 행에만 노출 -->
          <button
            v-if="row.tryIt"
            class="apidoc-tryit-btn apidoc-tryit-btn-row"
            @click.stop="store.openTryIt(row.id)"
          >
            Try It ▶
          </button>
        </div>
        <p class="apidoc-row-desc">{{ row.description }}</p>
        <div v-if="row.values.length" class="apidoc-item-values">
          <span class="apidoc-item-values-label">가능한 값</span>
          <code v-for="value in row.values" :key="value" class="apidoc-item-value">{{ value }}</code>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const props = defineProps({
  head: {
    type: Object,
    required: true,
  },
  rows: {
    type: Array,
    default: () => [],
  },
});

const KIND_LABELS = { props: 'prop', events: 'event', slots: 'slot' };

const store = useApiDocsStore();

// 트리 클릭 직후에만 잠깐 표시되는 플래시 하이라이트 (상시 하이라이트는 트리 담당)
const isHeadActive = computed(() => store.flashId.value === props.head.id);
const kindLabel = computed(() => KIND_LABELS[props.head.kind] || props.head.kind);
const parentPath = computed(() => {
  const lastDot = props.head.path.lastIndexOf('.');
  return lastDot < 0 ? '' : props.head.path.slice(0, lastDot);
});

// 행(leaf)의 부모 경로 — 헤더가 스크롤로 사라져도 full path를 알 수 있도록 프리픽스로 표시
const rowParentPath = (row) => {
  const lastDot = row.path.lastIndexOf('.');
  return lastDot < 0 ? '' : row.path.slice(0, lastDot);
};
</script>
