<template>
  <ev-select
    v-model="mv"
    :items="option.selectItem"
    placeholder="Please select value."
    @change="clickedHandler"
  />
</template>
<script>
import { ref, watch } from 'vue';

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
  setup(props, { emit }) {
    const mv = ref(props.item.value);
    const clickedHandler = (e) => {
      emit('change-renderer', props.item.rowIndex, props.item.cellIndex, e, props.item.value);
    };
    watch(
      () => mv.value,
      (value) => {
        emit('change-renderer', props.item.rowIndex, props.item.cellIndex, value);
      },
    );
    return {
      clickedHandler,
      mv,
    };
  },
};
</script>
<style>
</style>
