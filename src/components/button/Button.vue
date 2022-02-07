<template>
  <button
    ref="buttonRef"
    class="ev-button"
    :class="{
      disabled,
      [`type-${type}`]: !!type,
      [`shape-${shape}`]: shape !== 'square',
      [`size-${size}`]: size !== 'medium',
    }"
    :type="htmlType"
    :disabled="disabled"
    :autofocus="autoFocus"
    @click="(e) => $emit('click', e)"
  >
    <slot />
  </button>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'EvButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    autoFocus: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'default',
      validator: val => ['default', 'primary', 'info', 'warning', 'error', 'ghost', 'dashed', 'text'].includes(val),
    },
    htmlType: {
      type: String,
      default: 'button',
      validator: val => ['button', 'submit', 'reset'].includes(val),
    },
    shape: {
      type: String,
      default: 'square',
      validator: val => ['square', 'radius', 'circle'].includes(val),
    },
    size: {
      type: String,
      default: 'medium',
      validator: val => ['small', 'medium', 'large'].includes(val),
    },
  },
  emits: {
    click: null,
  },
  setup(props) {
    const buttonRef = ref(null);

    onMounted(() => {
      if (props.autoFocus) {
        buttonRef.value.focus();
      }
    });

    return {
      buttonRef,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-button {
  $default-padding: 12px;
  $default-height: $input-default-height;

  height: $default-height;
  padding: 0 $default-padding;
  line-height: $default-height;
  font-size: $font-size-medium;
  border-radius: $default-radius;
  cursor: pointer;
  outline: none;
  color: $color-white;
  transition: opacity $animate-base;

  @each $type in (
    'default',
    'primary',
    'info',
    'warning',
    'error',
    'ghost',
    'dashed',
    'text',
  ) {
    &.type-#{$type} {
      @if $type != 'ghost' and $type != 'dashed' and $type != 'text' {
        @include evThemify() {
          border: 1px solid evThemed($type);
          background-color: evThemed($type);
        }
      }

      @else if $type == 'ghost' {
        background-color: transparent;

        @include evThemify() {
          border: 1px solid evThemed('border-base');
          color: evThemed('font-base');
        }
      }
      @else if $type == 'dashed' {
        background-color: transparent;

        @include evThemify() {
          border: 1px dashed evThemed('border-base');
          color: evThemed('font-base');
        }
      }
      @else if $type == 'text' {
        border: 1px solid transparent;
        background-color: transparent;

        @include evThemify() {
          color: evThemed('font-base');
        }
      }
    }
  }
  @each $shape, $radius in (
    'radius': 40px,
    'circle': 50%,
  ) {
    &.shape-#{$shape} {
      border-radius: $radius;

      @if $shape == 'circle' {
        min-width: $default-height;
        padding: 0 10px;
      }
    }
  }
  @each $size, $size-gap in (
    'large': 5px,
    'small': -5px,
  ) {
    &.size-#{$size} {
      height: $default-height + $size-gap;
      padding: 0 #{$default-padding + $size-gap};
      line-height: $default-height + $size-gap;

      @if $size == 'small' {
        font-size: $font-size-base;
      }

      @else if $size == 'large' {
        font-size: $font-size-large;
      }
    }
  }

  &:hover,
  &:focus {
    opacity: 0.7;
  }

  @include state('disabled') {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover,
    &:focus {
      opacity: 0.5;
    }
  }
}

@include state('ev-button-group') {
  .ev-button {
    margin: 0;
    border-radius: 0 !important;
    border-left: 1px solid $color-white !important;

    &:first-child {
      border-radius: $default-radius 0 0 $default-radius !important;
      border-left: 1px solid transparent !important;
    }
    &:last-child {
      border-radius: 0 $default-radius $default-radius 0 !important;
    }
  }
}
</style>
