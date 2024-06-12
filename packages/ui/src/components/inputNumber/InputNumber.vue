<template>
  <div
    class="ev-input-number"
    :class="{
      disabled: props.disabled,
      readonly: props.disabled,
    }"
  >
    <div class="ev-input-number__wrapper">
      <span
        v-for="type in handlerType"
        :key="`step-arrow-${type}`"
        :class="['ev-input-number-icon', `step-${type}`]"
        @click="stepValue(type)"
      >
        <i :class="`ev-icon-s-arrow-${type}`" />
      </span>
      <input
        v-model.trim="currentValue"
        class="ev-input"
        type="text"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        @focus="focusInput"
        @blur="blurInput"
        @change="changeMv"
        @keydown.up.prevent="stepValue('up')"
        @keydown.down.prevent="stepValue('down')"
        @keydown.enter.prevent="validateValue(currentValue)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModel, useStep, useInit } from './uses';
import type { Props, Emits, HandleType } from './type';

defineOptions({
  name: 'EvInputNumber',
});

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  readonly: false,
  max: Infinity,
  min: -Infinity,
  step: 1,
  stepStrictly: false,
  precision: 0, // 0 ~ 100
});

const emit = defineEmits<Emits>();

const handlerType: HandleType[] = ['up', 'down'] as const;
const { currentValue, validateValue, focusInput, blurInput, changeMv } =
  useModel(props, emit);

const { stepValue } = useStep(props, {
  currentValue,
  validateValue,
});

useInit(props, {
  currentValue,
  validateValue,
});
</script>
<style lang="scss">
@import '../../style/index.scss';

.ev-input-number {
  position: relative;
  box-sizing: border-box;

  @include clearfix();

  @import '../../style/components/input.scss';
  &:hover {
    .ev-input,
    .ev-textarea {
      @include evThemify() {
        border: 1px solid evThemed('primary');
      }
    }
  }
  &__wrapper {
    position: relative;
  }
  .ev-input {
    $number-arrow-btn-width: 30px;
    padding: 0 #{$number-arrow-btn-width + $input-default-padding} 0 $input-default-padding;
    text-align: center;
  }
  .ev-input-number-icon {
    display: flex;
    position: absolute;
    right: 0;
    width: 30px;
    height: calc($input-default-height / 2);
    justify-content: center;
    align-items: center;
    font-size: 12px;
    cursor: pointer;

    @include evThemify() {
      border-left: 1px solid evThemed('border-base');
      background-color: evThemed('background-lighten');
    }
    &.step-up {
      top: 0;
      border-radius: 0 $default-radius 0 0;

      @include evThemify() {
        border-bottom: 1px solid evThemed('border-base');
      }
    }
    &.step-down {
      bottom: 0;
      border-radius: 0 0 $default-radius 0;
    }
    &:hover {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
  }
}

@include state('disabled') {
  .ev-input-number-icon {
    @include evThemify() {
      color: evThemed('disabled');
      border-left: 1px solid evThemed('disabled');
    }
    &.step-up {
      @include evThemify() {
        border-bottom: 1px solid evThemed('disabled');
      }
    }
    &:hover {
      @include evThemify() {
        color: evThemed('disabled');
      }
    }
  }
}
@include state('readonly') {
  .ev-input-number-icon {
    cursor: not-allowed;
    &:hover {
      @include evThemify() {
        color: inherit;
      }
    }
  }
}
</style>
