<template>
  <button
    :type="htmlType"
    :class="btnClass"
    :disabled="disabled"
    @click="onClick"
  >
    <span :class="`${prefixCls}-span`">
      <slot/>
    </span>
  </button>
</template>

<script>
  // import '@/styles/evui.css';

  const prefixCls = 'evui-btn';

  export default {
    props: {
      htmlType: {
        type: String,
        default: 'button',
        validator(value) {
            const list = ['button', 'submit', 'reset'];
            return list.indexOf(value) > -1;
        },
      },
      type: {
        type: String,
        default: 'default',
        validator(value) {
          const list = [
            'default', 'primary', 'ghost', 'dashed',
            'text', 'info', 'success', 'warning', 'error',
          ];
          return list.indexOf(value) > -1;
        },
      },
      size: {
        type: String,
        default: 'medium',
        validator(value) {
          const list = ['small', 'medium', 'large'];
          return list.indexOf(value) > -1;
        },
      },
      shape: {
        type: String,
        default: 'square',
        validator(value) {
          const list = ['square', 'radius', 'circle'];
          return list.indexOf(value) > -1;
        },
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        prefixCls,
      };
    },
    computed: {
      btnClass() {
        return this._getBtnClass();
      },
    },
    methods: {
      onClick(event) {
        this.$emit('click', event);
      },
      _getBtnClass() {
        return {
          [`${prefixCls}`]: true,
          [`${prefixCls}-${this.type}`]: this.type !== 'default',
          [`${prefixCls}-size-${this.size}`]: true,
          [`${prefixCls}-${this.shape}`]: true,
        };
      },
    },
  };
</script>

<style lang="scss">
@import '~evui/styles/default';

.evui-btn {
  display: inline-block;
  border: $border-solid transparent;
  border-radius: $border-radius-base;
  cursor: pointer;
  user-select: none;
  transition: color .2s linear,
    background-color .2s linear,
    border .2s linear,
    opacity .2s linear,
    box-shadow .2s linear;

  &:hover {
    opacity: 0.8;
  }

  &.active,
  &:active {
    background-color: $color-white;
    border-color: $color-primary;
  }

  &.disabled>*,
  &[disabled]>* {
    pointer-events: none;
  }

  &.disabled,
  &.disabled:active,
  &.disabled:hover,
  &[disabled],
  &[disabled]:active,
  &[disabled]:hover {
    @include themify() {
      color: themed('button-disabled') !important;
      background-color: themed('button-disabled-bg') !important;
      border-color: themed('button-disabled-border') !important;
    }
  }

  &-span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/** evui-btn > type(primary) **/
.evui-btn-primary {
  color: $color-white;
  background-color: $color-primary;
  border-color: $color-primary;

  &.active,
  &:active {
    background-color: darken($color-primary, 10%);
    border-color: darken($color-primary, 10%);
  }
}

/** evui-btn > type(info) **/
.evui-btn-info {
  color: $color-white;
  background-color: $color-info !important;
  border-color: $color-info !important;

  &.active,
  &:active {
    background-color: darken($color-info, 10%);
    border-color: darken($color-info, 10%);
  }
}

/** evui-btn > type(warning) **/
.evui-btn-warning {
  color: $color-white;
  background-color: $color-warning;
  border-color: $color-warning;

  &.active,
  &:active {
    background-color: darken($color-warning, 10%);
    border-color: darken($color-warning, 10%);
  }
}

/** evui-btn > type(error) **/
.evui-btn-error {
  color: $color-white !important;
  background-color: $color-error;
  border-color: $color-error;

  &.active,
  &:active {
    background-color: darken($color-error, 10%);
    border-color: darken($color-error, 10%);
  }
}


/** evui-btn > type(ghost) **/
.evui-btn-ghost {
  background-color: transparent;

  @include themify() {
    color: themed('button-ghost');
    border-color: themed('button-ghost-border');
  }

  &.active,
  &:active {
    color: $color-primary;
    border-color: $color-primary;
  }
}

/** evui-btn > type(dashed) **/
.evui-btn-dashed {
  background-color: transparent;
  border-style: dashed;

  @include themify() {
    color: themed('button-dashed');
    border-color: themed('button-dashed-border');
  }

  &.active,
  &:active {
    color: $color-primary;
    border-color: $color-primary;
  }
}

fieldset[disabled] .evui-btn-dashed,
fieldset[disabled] .evui-btn-dashed:active,
fieldset[disabled] .evui-btn-dashed:focus,
fieldset[disabled] .evui-btn-dashed:hover {
  @include themify() {
    color: themed('button-disabled') !important;
    background-color: themed('button-disabled-bg') !important;
    border-color: themed('button-disabled-border') !important;
  }
}

/*
 ** 스타일 적용 안 되어 주석 처리 **
.evui-btn-dashed:focus {
  -webkit-box-shadow: 0 0 0 2px rgba(45, 140, 240, .2);
  box-shadow: 0 0 0 2px rgba(45, 140, 240, .2)
}
*/

/** evui-btn > type(text) **/
.evui-btn-text {
  background-color: transparent;
  border-color: transparent;

  @include themify() {
    color: themed('button-text');
  }

  &:hover {
    color: $color-info;
  }

  &.active,
  &:active {
    color: $color-primary;
  }
}
/*
 ** 중복으로 주석 처리 **
.evui-btn-text:hover {
  color: #6d7380;
  background-color: rgba(255,255,255,.2);
  border-color: rgba(255,255,255,.2)
}
.evui-btn-text:active {
  color: #454c5b;
  background-color: rgba(0,0,0,.05);
  border-color: rgba(0,0,0,.05)
}
*/

/** evui-btn > shape > circle **/
.evui-btn-radius {
  border-radius: 32px;
}
.evui-btn-circle {
  border-radius: 50%;
}

/** size **/
.evui-btn-size-small {
  padding: 7px 10px;
  font-size: $font-size-base;

  &.evui-btn-circle {
    padding: 7px;
  }

  i {
    font-size: $font-size-base !important;
  }
}

.evui-btn-size-medium {
  padding: 8px 12px;
  font-size: $font-size-medium;

  &.evui-btn-circle {
    padding: 8px;
  }

  i {
    font-size: $font-size-medium !important;
  }
}

.evui-btn-size-large {
  padding: 10px 14px;
  font-size: $font-size-large;

  &.evui-btn-circle {
    padding: 10px;
  }

  i {
    font-size: $font-size-large !important;
  }
}

@-webkit-keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes spin {
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@-webkit-keyframes grdAiguille {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

@keyframes grdAiguille {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
