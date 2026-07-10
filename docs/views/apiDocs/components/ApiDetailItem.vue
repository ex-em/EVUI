<template>
  <article
    class="ad-item"
    :class="{ 'is-active': isActive }"
    :data-node-id="node.id"
    @click="store.setActiveFromScroll(node.id)"
  >
    <header class="ad-item-header">
      <h3 class="ad-item-title" :style="{ paddingLeft: `${node.depth * 16}px` }">
        <span v-if="parentPath" class="ad-item-parent-path">{{ parentPath }}.</span
        ><span class="ad-item-name">{{ node.name }}</span>
      </h3>
      <button class="ad-tryit-btn" @click.stop="store.openTryIt(node.id)">Try It ▶</button>
    </header>

    <div class="ad-item-badges" :style="{ paddingLeft: `${node.depth * 16}px` }">
      <span class="ad-badge" :class="`ad-badge-kind-${node.kind}`">{{ kindLabel }}</span>
      <span v-if="node.type" class="ad-badge ad-badge-type">{{ node.type }}</span>
      <span v-if="node.required" class="ad-badge ad-badge-required">required</span>
      <span v-if="node.default !== undefined" class="ad-badge ad-badge-default">
        default: <code>{{ node.default }}</code>
      </span>
      <span v-if="node.version" class="ad-badge ad-badge-version">v{{ node.version }}+</span>
    </div>

    <p class="ad-item-desc" :style="{ paddingLeft: `${node.depth * 16}px` }">
      {{ node.description }}
    </p>

    <div v-if="node.values.length" class="ad-item-values" :style="{ paddingLeft: `${node.depth * 16}px` }">
      <span class="ad-item-values-label">가능한 값</span>
      <code v-for="value in node.values" :key="value" class="ad-item-value">{{ value }}</code>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const KIND_LABELS = { props: 'prop', events: 'event', slots: 'slot' };

const store = useApiDocsStore();

const isActive = computed(() => store.activeId.value === props.node.id);
const kindLabel = computed(() => KIND_LABELS[props.node.kind] || props.node.kind);
const parentPath = computed(() => {
  const lastDot = props.node.path.lastIndexOf('.');
  return lastDot < 0 ? '' : props.node.path.slice(0, lastDot);
});
</script>
