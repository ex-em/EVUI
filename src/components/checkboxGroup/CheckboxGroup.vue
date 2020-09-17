<template>
  <div
    class="ev-checkbox-group"
    role="group"
  >
    <slot />
  </div>
</template>

<script>
import { computed, provide } from 'vue';

export default {
  name: 'EvCheckboxGroup',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: {
    'update:modelValue': null,
  },
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.modelValue,
      set: labels => emit('update:modelValue', labels),
    });
    provide('EvCheckboxGroupMv', mv);
  },
};
</script>

<style lang="scss">
</style>
