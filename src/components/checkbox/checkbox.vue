<template>
  <div
    :class="[{ disabled: disabled }, dataSize]"
    class="ev-checkbox"
  >
    <input
      v-if="!isGroup"
      :id="`${checkboxId}_${value}`"
      :value="value"
      :disabled="disabled"
      v-model="bindValue"
      type="checkbox"
      class="ev-checkbox-input"
      @change="change"
      @click="click"
    >
    <input
      v-else
      :id="`${checkboxId}_${value}`"
      :value="value"
      :disabled="disabled"
      v-model="groupBindValue"
      type="checkbox"
      class="ev-checkbox-input group"
      @change="change"
    >
    <label
      :for="`${checkboxId}_${value}`"
      :class="[dataSize, dataType, dataAfterType]"
      class="ev-checkbox-label"
    >
      <slot/>
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
        default: null,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      customValue: {
        type: [Boolean, Array],
        default: null,
      },
      size: {
        type: String,
        default: '',
      },
      type: {
        type: String,
        default: '',
      },
      afterType: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        checkboxId: this._uid,
        isGroup: false, // group태그가 존재하는 경우 true
        groupBindValue: [],
        dataSize: this.size,
        dataType: this.type,
      };
    },
    computed: {
      bindValue: {
        get() {
          return this.customValue;
        },
        set(list) {
          this.groupBindValue = list;
        },
      },
      bindSize: {
        get() {
          return this.size;
        },
        set(size) {
          this.dataSize = size;
        },
      },
      bindType: {
        get() {
          return this.type;
        },
        set(size) {
          this.dataType = size;
        },
      },
      dataAfterType() {
        return this.afterType;
      },
    },
    created() {
      this.isGroup = this.$parent.$options.componentName === 'CheckboxGroup';
    },
    methods: {
      change(e) {
        if (this.isGroup) {
          this.$parent.$emit('on-change', e);
        } else {
          this.$emit('input', e.target.checked);
          this.$emit('on-change', e);
        }
      },
      click(e) {
        if (this.isGroup) {
          this.$parent.$emit('on-click', e);
        } else {
          this.$emit('input', e.target.checked);
          this.$emit('on-click', e);
        }
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-checkbox {
    height: 19px;
    line-height: 19px;
    float: left;
    user-select: none;
    font-size: $font-size-base;

    &.small {
      height: 16px;
      line-height: 16px;
    }
  }

  .ev-checkbox-label {
    position: relative;
    display: inline-flex;
    height: 100%;
    padding-left: 25px;
    cursor: pointer;

    @include evThemify() {
      color: evThemed('checkbox');
    }

    &:before {
      position: absolute;
      top: 50%;
      left: 2px;
      width: 16px;
      height: 16px;
      background-color: transparent;
      border-radius: 50%;
      text-align: center;
      transform: translateY(-50%);
      content: '';

      @include evThemify() {
        border: $border-solid evThemed('checkbox-border');
      }
    }

    &:after {
      display: block;
      content: '';
    }

    /* unchecked -- type: small */
    &.small {
      padding-left: 23px;

      &:before {
        width: 12px;
        height: 12px;
      }
    }

    /* unchecked -- type: square */
    &.square:before {
      border-radius: 0;
    }
  }

  .ev-checkbox-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    border: 0;
    vertical-align: middle;
    overflow: hidden;
    cursor: inherit;
    clip: rect(0, 0, 0, 0);

    /* checked */
    &:checked + .ev-checkbox-label:before {
      border-color: $color-primary;
    }

    &:checked + .ev-checkbox-label:after {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: 7px;
      width: 8px;
      height: 8px;
      border-radius: 100%;
      transform: translateY(-50%);
      background-color: $color-primary;
    }

    /* checked -- type: check */
    &:checked + .ev-checkbox-label.check:before {
      background-color: $color-primary;
    }

    &:checked + .ev-checkbox-label.check:after {
      position: absolute;
      top: 4px;
      left: 8px;
      width: 5px;
      height: 8px;
      border: solid $color-white;
      border-radius: 0;
      border-width: 0 1px 1px 0;
      transform: rotate(45deg);
      content: '';
    }

    &:checked + .ev-checkbox-label.check.small:after {
      top: 3px;
      left: 6px;
      width: 4px;
      height: 6px;
    }

    /* checked -- type: square */
    &:checked + .ev-checkbox-label.square:after {
      border-radius: 0;
    }

    /* checked -- type: small */
    &:checked + .ev-checkbox-label.small:after {
      left: 6px;
      width: 6px;
      height: 6px;
    }

    /* checked -- type: minus */
    &:checked + .ev-checkbox-label.minus:after {
      left: 5px;
      width: 12px;
      height: 4px;
      border-radius: 0;
    }

    /* checked -- type: minus + small */
    &:checked + .ev-checkbox-label.minus.small:after {
      width: 8px;
      height: 2px;
    }

    /* checked -- type: check + small */
    &:checked + .ev-checkbox-label.check.small:after {
      top: 3px;
      left: 6px;
      width: 4px;
      height: 6px;
      background: none;
    }
  }


  /* disabled */
  .disabled {
    .ev-checkbox-label {
      cursor: not-allowed;

      @include evThemify() {
        color: evThemed('checkbox-disabled');
      }

      &:before {
        border: $border-solid $color-not-allow;
      }
    }

    .ev-checkbox-input:checked + .ev-checkbox-label:before {
      border-color: $color-not-allow;
    }

    .ev-checkbox-input:checked + .ev-checkbox-label:after {
      background-color: $color-not-allow;
    }

    /* checked -- type: check */
    .ev-checkbox-input:checked + .ev-checkbox-label.check:before {
      background-color: $color-not-allow;
    }
  }
</style>
