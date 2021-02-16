<template>
  <ev-select
    v-model="mv"
    :items="option.selectItem"
    placeholder="Please select value."
    @change="clickedHandler"
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
    const clickedHandler = (e) => {
      emit('change-renderer', props.item.rowIndex, props.item.cellIndex, e, props.item.value);
    };
    return {
      clickedHandler,
      mv,
    };
  },
};
</script>
<style>
</style>
