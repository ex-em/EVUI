<template>
  <ev-toggle
    v-model="mv"
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
.ev-toggle {
  vertical-align: middle;
}
</style>
