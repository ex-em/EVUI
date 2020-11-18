<template>
  <div
    v-if="modelValue"
    class="ev-loading"
  >
    <div class="ev-loading-spinner">
      <i class="ev-icon-shard ev-loading-icon" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EvLoading',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-loading {
  position: absolute;
  width: inherit;
  height: inherit;
  background-color: #000000;
  opacity: 0.5;
}
.ev-loading-spinner {
  position: absolute;
  top: 50%;
  width: 100%;
  color: #409EFF;
  text-align: center;
}
.ev-loading-icon {
  width: 30px;
  height: 30px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
