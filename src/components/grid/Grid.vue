<template>
  <div class="ev-grid">
    GRID
    <br>
    {{ sampleRef }}
    <br>
    {{ modelValue }}
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'EvGrid',
  props: {
    modelValue: {
      type: [Array],
      default: () => [],
    },
  },
  emits: {
  },
  setup() {
    const sampleRef = ref('test');

    return {
      sampleRef,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-grid {
  width: 100%;
  height: 150px;
  margin: 30px;
  cursor: pointer;
  user-select: none;
}

</style>
