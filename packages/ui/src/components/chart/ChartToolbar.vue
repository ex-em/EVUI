<template>
  <div class="ev-chart-toolbar">
    <div class="ev-chart-toolbar__icon">
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
.ev-chart-toolbar {
  height: 30px;
  text-align: right;
  padding-right: 30px;

  &__icon {
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
