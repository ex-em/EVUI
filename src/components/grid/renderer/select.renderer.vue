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
        // if (props.option.onClick) {
        //   props.option.onClick(e);
        // }
      };
      watch(
          () => mv.value,
          (curr, prev) => {
            console.log(curr, prev);
            emit('change-renderer', props.item.rowIndex, props.item.cellIndex, curr);
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
