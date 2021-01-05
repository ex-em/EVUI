<template>
  <ev-checkbox
    v-model:modelValue="mv"
    :label="option.label"
    @change="clickedHandler"
  />
</template>
<script>
import { ref } from 'vue';

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
