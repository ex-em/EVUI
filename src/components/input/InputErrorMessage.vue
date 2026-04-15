<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useInputContext } from './context';

defineOptions({ name: 'EvInputErrorMessage', inheritAttrs: false });

const ctx = useInputContext();
const id = ctx ? `${ctx.fieldId}-error` : undefined;

onMounted(() => {
  if (ctx) {
    ctx.errorMessageId.value = id;
  }
});

onUnmounted(() => {
  if (ctx) {
    ctx.errorMessageId.value = null;
  }
});
</script>

<template>
  <div
    v-bind="$attrs"
    :id="id"
    role="alert"
    aria-live="assertive"
  >
    <slot />
  </div>
</template>
