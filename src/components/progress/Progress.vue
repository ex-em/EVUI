<template>
  <div class="ev-progress">
    <div
      class="ev-progress-wrapper"
      :style="wrapperStyle"
    >
      <div
        class="ev-progress-inner"
        :style="innerStyle"
      >
        <div
          v-if="innerText"
          class="ev-progress-inner-text"
        >
          {{ innerText }}
        </div>
      </div>
    </div>
    <div
      v-if="$slots.default"
      class="ev-progress-label"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvProgress',
  props: {
    modelValue: {
      type: Number,
      default: 0,
      validator: val => (val >= 0 && val <= 100),
    },
    color: {
      type: [String, Array],
      default: '#409EFF',
    },
    strokeWidth: {
      type: Number,
      default: 6,
    },
    innerText: {
      type: String,
      default: '',
    },
  },
  emits: {
  },
  setup(props) {
    const wrapperStyle = computed(() => ({
      height: `${props.strokeWidth}px`,
    }));
    const innerStyle = computed(() => {
      if (Array.isArray(props.color)) {
        const sortedColorList = [...props.color].sort((curr, next) => curr.value - next.value);
        let color = sortedColorList[0].color;
        if (!props.modelValue) {
          return {
            width: `${props.modelValue}%`,
            'background-color': color,
          };
        }
        for (let i = 0; i < sortedColorList.length; i++) {
          const prevValue = i === 0 ? 0 : sortedColorList[i - 1].value;
          const currValue = sortedColorList[i].value;
          if (props.modelValue > prevValue && props.modelValue <= currValue) {
            color = sortedColorList[i].color;
            break;
          }
        }
        return {
          width: `${props.modelValue}%`,
          'background-color': color,
        };
      }
      return {
        width: `${props.modelValue}%`,
        'background-color': props.color,
      };
    });

    return {
      wrapperStyle,
      innerStyle,
    };
  },
};
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
    background-color: #EBEEF5;
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
    transition: width .6s ease;
  }

  &-inner-text {
    display: inline-block;
    margin: 0 5px;
    color: #FFFFFF;
    font-size: 12px;
  }

  &-label {
    min-width: 55px;
    text-align: right;
    margin-left: 10px;
  }
}
</style>
