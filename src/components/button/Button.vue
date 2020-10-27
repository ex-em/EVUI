<template>
  <button
    class="ev-button"
    :class="{
      disabled,
      [`type-${type}`]: !!type,
      [`shape-${shape}`]: shape !== 'square',
      [`size-${size}`]: size !== 'medium',
    }"
    :type="htmlType"
    :disabled="disabled"
    @click="clickBtn"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'EvButton',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'default',
    },
    htmlType: {
      type: String,
      default: 'button',
    },
    shape: {
      type: String,
      default: 'square',
    },
    size: {
      type: String,
      default: 'medium',
    },
  },
  emits: {
    click: null,
  },
  setup(props, { emit }) {
    const clickBtn = (e) => {
      emit('click', e);
    };
    return {
      clickBtn,
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
  border-radius: $border-radius-button;
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

  &:hover {
    opacity: 0.7;
  }

  @include state('disabled') {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      opacity: 0.5;
    }
  }
}

@include state('ev-button-group') {
  .ev-button {
    margin: 0;
    border-radius: 0;
    border-left: 1px solid $color-white;

    &:first-child {
      border-radius: $border-radius-button 0 0 $border-radius-button;
      border-left: 1px solid transparent;
    }
    &:last-child {
      border-radius: 0 $border-radius-button $border-radius-button 0;
    }
  }
}
</style>
