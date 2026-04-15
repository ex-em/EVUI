<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useInputContext } from './context';

defineOptions({ name: 'EvInputDescription', inheritAttrs: false });

const ctx = useInputContext();
const id = ctx ? `${ctx.fieldId}-description` : undefined;

onMounted(() => {
  if (ctx) {
    ctx.descriptionId.value = id;
  }
});

onUnmounted(() => {
  if (ctx) {
    ctx.descriptionId.value = null;
  }
});
</script>

<template>
  <div
    v-bind="$attrs"
    :id="id"
  >
    <slot />
  </div>
</template>
