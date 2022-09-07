<template>
  <div
    :class="[{ disabled: disabled }, dataSize, type]"
    :style="{ width: buttonSize }"
    class="ev-radio"
  >
    <input
      :id="`${radioId}_${value}`"
      v-model="bindValue"
      :value="value"
      :name="groupName"
      :disabled="disabled"
      type="radio"
      class="ev-radio-input"
      @change="onChange"
    >
    <label
      :for="`${radioId}_${value}`"
      :class="[dataSize, type]"
      class="ev-radio-label"
    >
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'customValue',
  },
  props: {
    value: {
      type: [String, Number],
      required: true,
    },
    customValue: {
      type: [String, Number],
      default: null,
    },
    groupName: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
    buttonSize: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      bindValue: this.customValue,
      radioId: this._uid,
      dataSize: this.size,
      type: this.$parent.type,
    };
  },
  computed: {
    bindSize: {
      get() {
        return this.size;
      },
      set(size) {
        this.dataSize = size;
      },
    },
  },
  watch: {
  },
  created() {
  },
  mounted() {
  },
  methods: {
    onChange(e) {
      if (this.$parent.$options.componentName === 'RadioGroup') {
        // 부모 컴포넌트가 Radio Group인 경우
        this.$parent.$emit('input', e.target.value);
        this.$parent.$emit('on-change', e);
      }
//      else {
//        // 부모 컴포넌트가 Radio Group로 안감싼경우
//        this.$emit('input', e.target.value);
//      }
    },
  },
};
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-radio {
    /* height: 19px; */
    float: left;
    user-select: none;

    @include evThemify() {
      color: evThemed('radio');
    }

    &.small {
      height: 16px;
    }

    &.button {
      font-size: $font-size-base;
      height: 100%;
    }
  }

  .ev-radio-label {
    &:not(.button) {
      position: relative;
      display: inline-block;
      padding-left: 25px;
      line-height: 19px;
      cursor: pointer;
      margin-right: 10px;
    }

    &.button {
      display: flex;
      flex-direction: row;
      border-radius: 4px;
      justify-content: center;
      cursor: pointer;
      line-height: 19px;
      padding: 5px;
      margin-right: 10px;
      background-color: $color-gray60;
      color: $color-white;
      border: solid 1px $color-gray60;
      transition: opacity .2s linear;

      &:hover {
        opacity: 0.7;
        /*
        color: $color-primary;
        background-color: transparent;
        border-color: $color-primary;
         */
      }
    }

    &.small {
      padding-left: 20px;
      line-height: 16px;
    }

    &:not(.button):before {
      position: absolute;
      top: 50%;
      left: 2px;
      width: 16px;
      height: 16px;
      background: transparent;
      border: 1px solid #B0B3B7;
      border-radius: 100%;
      text-align: center;
      transform: translateY(-50%);
      content: '';
    }

    &:not(.button).small:before {
      width: 12px;
      height: 12px;
    }
  }

  .ev-radio-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    vertical-align: middle;
    overflow: hidden;
    cursor: inherit;
    clip: rect(0, 0, 0, 0);

    &:checked + .ev-radio-label:not(.button):before {
      @include evThemify() {
        border: 1px solid evThemed('color-primary');
      }
    }

    &:checked + .ev-radio-label:not(.button):after {
      position: absolute;
      top: 50%;
      left: 7px;
      width: 8px;
      height: 8px;
      border-radius: 100%;
      transform: translateY(-50%);
      content: '';
    }

    &:checked + .ev-radio-label.button {
      color: $color-white;

      @include evThemify() {
        background-color: evThemed('color-primary');
        border-color: evThemed('color-primary');
      }

      &:hover {
        opacity: 1;
      }
    }

    &:checked + .ev-radio-label.small:after {
      left: 6px;
      width: 6px;
      height: 6px;
    }

    &:checked + .ev-radio-label:after {
      @include evThemify() {
        background-color: evThemed('color-primary');
      }
    }
  }

  .disabled {
    .ev-radio-label:not(.button) {
      cursor: not-allowed;

      @include evThemify() {
        color: evThemed('radio-disabled');
      }

      &:before {
        border: 1px solid $color-not-allow;
      }
    }

    .ev-radio-label.button {
      cursor: not-allowed;

      @include evThemify() {
        color: evThemed('button-disabled');
      }
    }

    .ev-radio-input {
      &:checked + .ev-radio-label:not(.button):before {
        border: 1px solid $color-not-allow;
      }

      &:checked + .ev-radio-label.button {
        @include evThemify() {
          color: evThemed('button-disabled');
          background-color: evThemed('button-disabled-bg');
          border-color: evThemed('button-disabled-border');
        }
      }

      &:checked + .ev-radio-label:after {
        background-color: $color-not-allow;
      }
    }
  }
</style>
