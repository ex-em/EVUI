<template>
  <div class="ev-chart__toolbar__wrapper">
    <div class="ev-chart__toolbar__wrapper__icon">
      <ev-icon
        v-for="(option, iconType) in $props.toolbar.items"
        :key="`${iconType}-${option.icon}`"
        :class="iconType"
        :icon="option.icon"
        :size="option.size"
        :title="option.title"
        @click="$emit('onClickToolbar', $event, iconType)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EvChartToolbar',
  props: {
    toolbar: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['onClickToolbar'],
};
</script>

<style lang="scss" scoped>
.ev-chart__toolbar__wrapper {
  position: relative;

  &__icon {
    position: absolute;
    top: 13px;
    right: 30px;
    z-index: 1;

    i {
      pointer-events: none;
      opacity: 0.5;
      cursor: pointer;
    }

    i + i {
      margin-left: 10px;
    }

    .active {
      font-weight: bold;
    }
  }
}
</style>
