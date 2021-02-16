<template>
  <ev-input-number
    v-model="mv"
    :max="option.maxValue || 100"
    :min="option.minValue || 0"
  />
</template>
<script>
import { computed } from 'vue';

export default {
  props: {
    item: {
      type: Object,
      default: () => ({ message: '' }),
    },
    option: {
      type: Object,
      default: () => ({ message: '' }),
    },
  },
  emits: {
    'change-renderer': null,
  },
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.item.value,
      set: val => emit('change-renderer', props.item.rowIndex, props.item.cellIndex, val),
    });
    return {
      mv,
    };
  },
};
</script>
<style>
</style>
