<script setup>
import { useInputContext } from './context';

defineOptions({ name: 'EvInputLabel', inheritAttrs: false });

const ctx = useInputContext();
</script>

<template>
  <label
    v-bind="$attrs"
    :id="ctx?.labelId.value"
    :for="ctx?.inputId.value"
  >
    <slot />
  </label>
</template>
