<template>
  <ev-checkbox
    v-model="mv"
    :label="option.label"
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
      if (props.option.onClick) {
        props.option.onClick(e);
      }
    };
    return {
      clickedHandler,
      mv,
    };
  },
};
</script>

<style lang="scss" scoped>
.ev-checkbox {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
