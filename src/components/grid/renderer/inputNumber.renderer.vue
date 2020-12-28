<template>
  <ev-input-number
      v-model="mv"
      :max="option.maxValue || 100"
      :min="option.minValue || 0"
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
        if (e !== props.item.value) {
          emit('change-renderer', props.item.rowIndex, props.item.cellIndex, e, props.item.value);
        }
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
