<template>
  <li v-if="store.isVisible(node.id)" class="ad-tree-node">
    <div
      ref="rowRef"
      class="ad-tree-row"
      :class="{ 'is-active': isActive }"
      :style="{ paddingLeft: `${10 + node.depth * 14}px` }"
      @click="store.selectNode(node.id)"
    >
      <span
        class="ad-tree-caret"
        :class="{ 'is-open': hasChildren && store.isExpanded(node.id), 'is-leaf': !hasChildren }"
        @click.stop="hasChildren && store.toggleExpand(node.id)"
      />
      <span class="ad-tree-label">{{ node.name }}</span>
      <span v-if="node.required" class="ad-tree-required">*</span>
      <span v-if="hasChildren" class="ad-tree-count">{{ node.childIds.length }}</span>
    </div>
    <ul v-if="hasChildren && store.isExpanded(node.id)" class="ad-tree-children">
      <ApiTreeNode v-for="childId in node.childIds" :key="childId" :node="store.getNode(childId)" />
    </ul>
  </li>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { useApiDocsStore } from '../composables/useApiDocsStore';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

const store = useApiDocsStore();
const rowRef = ref(null);

const hasChildren = computed(() => props.node.childIds.length > 0);
const isActive = computed(() => store.activeId.value === props.node.id);

// 스크롤 스파이로 active 가 바뀌면 트리에서도 해당 노드가 보이도록 따라간다.
watch(isActive, async (active) => {
  if (!active) return;
  await nextTick();
  rowRef.value?.scrollIntoView({ block: 'nearest' });
});
</script>
