<template>
  <article
    class="ad-item"
    :class="{ 'is-active': isHeadActive }"
    :style="{ marginLeft: `${head.depth * 12}px` }"
    :data-node-id="head.id"
    @click="store.setActiveFromScroll(head.id)"
  >
    <!-- 그룹 헤더: Try It은 그룹당 하나 -->
    <header class="ad-item-header">
      <h3 class="ad-item-title">
        <span v-if="parentPath" class="ad-item-parent-path">{{ parentPath }}.</span
        ><span class="ad-item-name">{{ head.name }}</span>
      </h3>
      <!-- tryIt: false 지정 시 버튼 숨김 -->
      <button
        v-if="head.tryIt !== false"
        class="ad-tryit-btn"
        @click.stop="store.openTryIt(head.id)"
      >
        Try It ▶
      </button>
    </header>

    <div class="ad-item-badges">
      <span class="ad-badge" :class="`ad-badge-kind-${head.kind}`">{{ kindLabel }}</span>
      <span v-if="head.type" class="ad-badge ad-badge-type">{{ head.type }}</span>
      <span v-if="head.required" class="ad-badge ad-badge-required">required</span>
      <span v-if="head.default !== undefined" class="ad-badge ad-badge-default">
        default: <code>{{ head.default }}</code>
      </span>
      <span v-if="head.version" class="ad-badge ad-badge-version">v{{ head.version }}+</span>
    </div>

    <p class="ad-item-desc">{{ head.description }}</p>

    <div v-if="head.values.length" class="ad-item-values">
      <span class="ad-item-values-label">가능한 값</span>
      <code v-for="value in head.values" :key="value" class="ad-item-value">{{ value }}</code>
    </div>

    <!-- leaf 하위 속성: 컴팩트 행 (개별 Try It 없음) -->
    <ul v-if="rows.length" class="ad-group-rows">
      <li
        v-for="row in rows"
        :key="row.id"
        class="ad-group-row"
        :class="{
          'is-active': store.flashId.value === row.id,
          'is-object': row.childIds.length > 0,
        }"
        :style="{ paddingLeft: `${14 + (row.depth - head.depth - 1) * 20}px` }"
        :data-node-id="row.id"
        @click.stop="store.setActiveFromScroll(row.id)"
      >
        <div class="ad-row-head">
          <code class="ad-row-name">{{ row.name }}</code>
          <span v-if="row.type" class="ad-badge ad-badge-type">{{ row.type }}</span>
          <span v-if="row.required" class="ad-badge ad-badge-required">required</span>
          <span v-if="row.default !== undefined" class="ad-badge ad-badge-default">
            default: <code>{{ row.default }}</code>
          </span>
          <span v-if="row.version" class="ad-badge ad-badge-version">v{{ row.version }}+</span>
          <!-- 전용 tryIt 스니펫이 있는 행에만 노출 -->
          <button
            v-if="row.tryIt"
            class="ad-tryit-btn ad-tryit-btn-row"
            @click.stop="store.openTryIt(row.id)"
          >
            Try It ▶
          </button>
        </div>
        <p class="ad-row-desc">{{ row.description }}</p>
        <div v-if="row.values.length" class="ad-item-values">
          <span class="ad-item-values-label">가능한 값</span>
          <code v-for="value in row.values" :key="value" class="ad-item-value">{{ value }}</code>
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
</script>
