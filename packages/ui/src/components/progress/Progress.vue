<template>
  <div class="ev-progress">
    <div class="ev-progress-wrapper" :style="wrapperStyle">
      <div class="ev-progress-inner" :style="innerStyle">
        <div v-if="innerText" class="ev-progress-inner-text">
          {{ innerText }}
        </div>
      </div>
    </div>
    <div v-if="$slots.default" class="ev-progress-label">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Props } from './progress.type';

defineOptions({
  name: 'EvProgress',
});

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  color: '#409EFF',
  strokeWidth: 6,
  innerText: '',
});
const wrapperStyle = computed(() => ({
  height: `${props.strokeWidth}px`,
}));
const innerStyle = computed(() => {
  if (typeof props.color === 'string') {
    return {
      width: `${props.modelValue}%`,
      'background-color': props.color,
    };
  }

  const sortedColorList = [...props.color].sort(
    (curr, next) => curr.value - next.value
  );

  let color = sortedColorList[0].color;

  sortedColorList.every((item) => {
    if (props.modelValue < item.value) {
      color = item.color;
      return false;
    }
    return true;
  });

  return {
    width: `${props.modelValue}%`,
    'background-color': color,
  };
});
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-progress {
  display: flex;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  &-wrapper {
    position: relative;
    height: 6px;
    border-radius: 100px;
    background-color: #ebeef5;
    overflow: hidden;
    flex: 1;
    align-self: center;
  }

  &-inner {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 100px;
    text-align: right;
    white-space: nowrap;
    transition: width 0.6s ease;
  }

  &-inner-text {
    display: inline-block;
    margin: 0 5px;
    color: #ffffff;
    font-size: 12px;
  }

  &-label {
    min-width: 55px;
    text-align: right;
    margin-left: 10px;
  }
}
</style>
