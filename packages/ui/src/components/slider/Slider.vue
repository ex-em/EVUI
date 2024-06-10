<template>
  <div
    class="ev-slider"
    :class="{
      readonly,
      disabled,
      'hide-tooltip': !showTooltip,
      'show-input': showInput,
      'color-range': isColorArray,
      'show-mark': markList.length,
    }"
  >
    <div class="ev-slider-wrapper">
      <div
        ref="sliderLine"
        class="ev-slider-line"
      >
        <template v-if="showStep && step">
          <div class="ev-slider-step-wrapper">
            <span
              v-for="(stepLeft, idx) in stepList"
              :key="`slider-step-${idx}`"
              :style="{ left: `${stepLeft}%` }"
              class="ev-slider-step"
            />
          </div>
        </template>
        <template v-if="isColorArray && color.length > 1">
          <div
            v-if="range"
            :style="leftThumbStyle"
            class="ev-slider-thumb left"
          />
          <div
            :style="rightThumbStyle"
            class="ev-slider-thumb right"
          />
        </template>
        <div
          class="ev-slider-thumb"
          :style="rangeThumbStyle"
        />
        <template v-if="markList.length > 0">
          <div class="ev-slider-mark-wrapper">
            <div
              v-for="(markItem, idx) in markList"
              :key="`slider-step-${idx}`"
              :style="{
                ...markItem.style,
                left: `${markItem.posX}%`,
              }"
              class="ev-slider-mark"
            >
              <span class="ev-slider-mark-label">{{ markItem.label }}</span>
            </div>
          </div>
        </template>
        <span
          class="ev-slider-line-layer"
          @click="clickSlider"
        />
      </div>
      <div
        v-if="range"
        class="ev-slider-handle"
        :class="{ dragging: dragging && handleType === 'left' }"
        :style="leftHandleStyle"
        @mousedown.stop.prevent="startDrag('left')"
      >
        <span
          :style="handleBtnStyle"
          class="ev-slider-handle-btn"
        />
        <div
          class="ev-slider-tooltip"
          v-html="formatValue.left"
        />
      </div>
      <div
        class="ev-slider-handle"
        :class="{ dragging: dragging && handleType === 'right' }"
        :style="rightHandleStyle"
        @mousedown.stop.prevent="startDrag('right')"
      >
        <span
          :style="handleBtnStyle"
          class="ev-slider-handle-btn"
        />
        <div
          class="ev-slider-tooltip"
          v-html="formatValue.right"
        />
      </div>
    </div>
    <template v-if="showInput && !range">
      <ev-input-number
        v-model="currentValue"
        :step="step"
        :min="min"
        :max="max"
        step-strictly
        @change="changeInput"
      />
    </template>
    <template v-else-if="showInput && range && Array.isArray(modelValue)">
      <ev-input-number
        v-model="currentValue[0]"
        :step="step"
        :min="min"
        :max="currentValue[1]"
        step-strictly
        @change="changeInput($event, 'left')"
      />
      <ev-input-number
        v-model="currentValue[1]"
        :step="step"
        :min="currentValue[0]"
        :max="max"
        step-strictly
        @change="changeInput($event, 'right')"
      />
    </template>
  </div>
</template>

<script>
import { toRefs } from 'vue';
import { useModel, useStyle, useEvent, useInit } from './uses';

export default {
  name: 'EvSlider',
  components: {},
  props: {
    modelValue: {
      type: [Number, Array],
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    range: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: 100,
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
      validator: (val) => val > 0,
    },
    mark: {
      type: Object,
      default: () => {},
    },
    showStep: {
      type: Boolean,
      default: false,
    },
    showTooltip: {
      type: Boolean,
      default: true,
    },
    showInput: {
      type: Boolean,
      default: false,
    },
    color: {
      type: [String, Array],
      default: null,
    },
    tooltipFormat: {
      type: Function,
      default: null,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup() {
    const {
      currentValue,
      state,
      slider,
      formatValue,
      sliderLine,
      updateSliderInfo,
      setSliderValue,
    } = useModel();

    const {
      isColorArray,
      leftHandleStyle,
      rightHandleStyle,
      handleBtnStyle,
      rangeThumbStyle,
      leftThumbStyle,
      rightThumbStyle,
    } = useStyle({
      currentValue,
      state,
      slider,
    });

    const { startDrag, clickSlider, changeInput } = useEvent({
      currentValue,
      state,
      slider,
      updateSliderInfo,
      setSliderValue,
    });

    useInit({
      currentValue,
      state,
      slider,
      updateSliderInfo,
      setSliderValue,
    });

    return {
      currentValue,
      isColorArray,
      leftHandleStyle,
      rightHandleStyle,
      handleBtnStyle,
      rangeThumbStyle,
      leftThumbStyle,
      rightThumbStyle,
      sliderLine,
      ...toRefs(state),
      ...toRefs(slider),
      formatValue,
      startDrag,
      clickSlider,
      changeInput,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-slider {
  $line-height: 6px;
  $handle-height: $line-height + 10px;
  $handle-padding: 6px;

  position: relative;
  box-sizing: border-box;
  user-select: none;
  &-wrapper {
    position: relative;
    height: $line-height + $handle-height;
    padding: #{$handle-height / 2} 0;
    margin: 0 #{$handle-height / 2};
  }
  &-line-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  &-line {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: #{$line-height / 2};

    @include evThemify() {
      background-color: evThemed('border-light');
    }
  }
  &-thumb {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: $line-height;
    border-radius: #{$line-height / 2};

    @include evThemify() {
      background-color: evThemed('primary');
    }
  }
  &-handle {
    $handle-size: $handle-height + $handle-padding;

    position: absolute;
    top: 50%;
    left: 0;
    z-index: 9;
    width: $handle-size;
    height: $handle-size;
    padding: $handle-padding / 2;
    margin-top: ($handle-size / 2) * -1;
    margin-left: ($handle-size / 2) * -1;
    cursor: grab;

    &.dragging {
      cursor: grabbing;
    }
    &.dragging,
    &:hover {
      .ev-slider-handle-btn {
        transform: scale(1.2);
      }
      .ev-slider-tooltip {
        display: block;
        opacity: 1;
      }
    }
    &-btn {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: $color-white;
      transition: transform 0.1s ease-in-out;
      box-sizing: border-box;

      @include evThemify() {
        border: 2px solid evThemed('primary');
      }
    }
  }
  &-tooltip {
    display: none;
    position: absolute;
    left: 50%;
    bottom: $handle-height + 10px;
    padding: 3px 5px;
    color: $color-white;
    border-radius: $default-radius;
    font-size: $font-size-base;
    opacity: 0;
    z-index: 850;
    transform: translateX(-50%);
    transition: all 0.2s ease-in-out;
    white-space: nowrap;

    @include evThemify() {
      background-color: evThemed('tooltip-background');
    }
    &:before {
      display: block;
      position: absolute;
      left: 50%;
      bottom: -4px;
      width: 6px;
      height: 6px;
      z-index: -1;
      transform: rotate(45deg) translateX(-50%);
      content: '';

      @include evThemify() {
        background-color: evThemed('tooltip-background');
      }
    }
  }
  &-step-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  &-step {
    display: block;
    position: absolute;
    top: 0;
    width: $line-height;
    height: $line-height;
    border-radius: #{$line-height / 2};
    transform: translateX(-50%);

    @include evThemify() {
      background-color: evThemed('border-base');
    }
  }
  &-mark-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }
  &-mark {
    position: absolute;
    top: $line-height * 2;
    padding: 0 3px;
    transform: translateX(-50%);
    font-size: $font-size-base;
    line-height: 1.4em;

    &:before {
      position: absolute;
      top: $line-height * -2;
      left: 50%;
      width: $line-height;
      height: $line-height;
      border-radius: #{$line-height / 2};
      transform: translateX(-50%);
      content: '';

      @include evThemify() {
        background-color: evThemed('slider-mark-background');
      }
    }
    .ev-slider-mark-label {
      display: block;
      white-space: nowrap;
    }
  }

  @include state('hide-tooltip') {
    .ev-slider-tooltip {
      display: none;
    }
  }
  @include state('show-input') {
    display: flex;
    height: $input-default-height;
    align-items: center;
    .ev-slider-wrapper {
      flex: 1;
    }
    .ev-input-number {
      width: 100px;
      margin-left: 10px;
    }
  }
  @include state('color-range') {
    .ev-slider-handle-btn {
      border-color: #666666;
    }
  }
  @include state('show-mark') {
    padding-bottom: $handle-height;
  }
  @include state('readonly') {
    &,
    * {
      cursor: default !important;
    }
    .ev-slider-handle {
      &.on,
      &:hover {
        .ev-slider-handle-btn {
          transform: scale(1);
        }
      }
    }
  }
  @include state('disabled') {
    &,
    * {
      cursor: not-allowed !important;
    }
    .ev-slider-thumb {
      @include evThemify() {
        background-color: evThemed('disabled');
      }
      &.left,
      &.right {
        @include evThemify() {
          background-color: lighten(evThemed('disabled'), 5%);
        }
      }
    }
    .ev-slider-handle {
      &-btn {
        cursor: not-allowed !important;

        @include evThemify() {
          background-color: evThemed('border-light');
          border-color: evThemed('disabled');
        }
      }
      &.on,
      &:hover {
        .ev-slider-handle-btn {
          transform: scale(1);
        }
      }
    }
    .ev-slider-tooltip,
    .ev-slider-tooltip:before {
      @include evThemify() {
        background-color: evThemed('disabled');
      }
    }
  }
}
</style>
