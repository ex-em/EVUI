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
  const prefixCls = 'ev-btn';

  export default {
    props: {
      /**
       * HTML <button> type Attribute
       */
      htmlType: {
        type: String,
        default: 'button',
        validator(value) {
          const list = ['button', 'submit', 'reset'];
          return list.indexOf(value) > -1;
        },
      },
      /**
       * 버튼의 유형를 설정한다.
       */
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
      /**
       * 버튼의 크기를 설정한다.
       */
      size: {
        type: String,
        default: 'medium',
        validator(value) {
          const list = ['small', 'medium', 'large'];
          return list.indexOf(value) > -1;
        },
      },
      /**
       * 버튼의 모양을 설정한다.
       */
      shape: {
        type: String,
        default: 'square',
        validator(value) {
          const list = ['square', 'radius', 'circle'];
          return list.indexOf(value) > -1;
        },
      },
      /**
       * 버튼의 활성화 유무를 결정한다.
       */
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
        /**
         * 버튼 클릭 시 발생
         *
         * @event click
         * @type {object}
         */
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
  @import '~@/styles/default';

  $border-radius-circle: 50%;
  $border-radius-half: 32px;

  .ev-btn {
    display: inline-block;
    border: $border-solid transparent;
    border-radius: $border-radius-base;
    background-color: $color-dark-level6;
    color: $color-white;
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
      cursor: default;

      @include evThemify() {
        color: evThemed('button-disabled') !important;
        background-color: evThemed('button-disabled-bg') !important;
        border-color: evThemed('button-disabled-border') !important;
      }
    }

    &-span {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  /** ev-btn > type(primary) **/
  .ev-btn-primary {
    color: $color-white;
    background-color: $color-primary;
    border-color: $color-primary;

    &.active,
    &:active {
      background-color: darken($color-primary, 10%);
      border-color: darken($color-primary, 10%);
    }
  }

  /** ev-btn > type(info) **/
  .ev-btn-info {
    color: $color-white;
    background-color: $color-info !important;
    border-color: $color-info !important;

    &.active,
    &:active {
      background-color: darken($color-info, 10%);
      border-color: darken($color-info, 10%);
    }
  }

  /** ev-btn > type(warning) **/
  .ev-btn-warning {
    color: $color-white;
    background-color: $color-warning;
    border-color: $color-warning;

    &.active,
    &:active {
      background-color: darken($color-warning, 10%);
      border-color: darken($color-warning, 10%);
    }
  }

  /** ev-btn > type(error) **/
  .ev-btn-error {
    color: $color-white !important;
    background-color: $color-error;
    border-color: $color-error;

    &.active,
    &:active {
      background-color: darken($color-error, 10%);
      border-color: darken($color-error, 10%);
    }
  }


  /** ev-btn > type(ghost) **/
  .ev-btn-ghost {
    background-color: transparent;

    @include evThemify() {
      color: evThemed('button-ghost');
      border-color: evThemed('button-ghost-border');
    }

    &.active,
    &:active {
      color: $color-primary;
      border-color: $color-primary;
    }
  }

  /** ev-btn > type(dashed) **/
  .ev-btn-dashed {
    background-color: transparent;
    border-style: dashed;

    @include evThemify() {
      color: evThemed('button-dashed');
      border-color: evThemed('button-dashed-border');
    }

    &.active,
    &:active {
      color: $color-primary;
      border-color: $color-primary;
    }
  }

  fieldset[disabled] .ev-btn-dashed,
  fieldset[disabled] .ev-btn-dashed:active,
  fieldset[disabled] .ev-btn-dashed:focus,
  fieldset[disabled] .ev-btn-dashed:hover {
    @include evThemify() {
      color: evThemed('button-disabled') !important;
      background-color: evThemed('button-disabled-bg') !important;
      border-color: evThemed('button-disabled-border') !important;
    }
  }

  /*
   ** 스타일 적용 안 되어 주석 처리 **
  .ev-btn-dashed:focus {
    -webkit-box-shadow: 0 0 0 2px rgba(45, 140, 240, .2);
    box-shadow: 0 0 0 2px rgba(45, 140, 240, .2)
  }
  */

  /** ev-btn > type(text) **/
  .ev-btn-text {
    background-color: transparent;
    border-color: transparent;

    @include evThemify() {
      color: evThemed('button-text');
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
  .ev-btn-text:hover {
    color: #6d7380;
    background-color: rgba(255,255,255,.2);
    border-color: rgba(255,255,255,.2)
  }
  .ev-btn-text:active {
    color: #454c5b;
    background-color: rgba(0,0,0,.05);
    border-color: rgba(0,0,0,.05)
  }
  */

  /** ev-btn > shape > circle **/
  .ev-btn-radius {
    border-radius: 32px;
  }
  .ev-btn-circle {
    border-radius: 50%;
  }

  /** size **/
  .ev-btn-size-small {
    padding: 7px 10px;
    font-size: $font-size-base;

    &.ev-btn-circle {
      padding: 7px;
    }

    i {
      font-size: $font-size-base !important;
    }
  }

  .ev-btn-size-medium {
    padding: 8px 12px;
    font-size: $font-size-medium;

    &.ev-btn-circle {
      padding: 8px;
    }

    i {
      font-size: $font-size-medium !important;
    }
  }

  .ev-btn-size-large {
    padding: 10px 14px;
    font-size: $font-size-large;

    &.ev-btn-circle {
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
