<template>
  <div
    class="ev-checkbox-group"
    role="group"
  >
    <slot />
  </div>
</template>

<script>
import { computed, nextTick, provide } from 'vue';

export default {
  name: 'EvCheckboxGroup',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: {
    'update:modelValue': [Array],
    change: [Array],
  },
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.modelValue,
      set: labels => emit('update:modelValue', labels),
    });
    provide('EvCheckboxGroupMv', mv);

    const change = async () => {
      await nextTick();
      emit('change', mv.value);
    };
    provide('EvCheckboxGroupChange', change);
  },
};
</script>

<style lang="scss">
</style>
