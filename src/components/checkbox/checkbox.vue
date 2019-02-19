<template>
  <div
    :class="[{ disabled: disabled }, dataSize]"
    class="ev-checkbox-wrap"
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
        type: String,
        default: '',
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
        // dataAfterType: this.afterType,
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
          this.$parent.$emit('change-event', e);
        } else {
          this.$emit('change-event', e);
          this.$emit('input', e.target.checked);
        }
      },
      click(e) {
        if (this.isGroup) {
          this.$parent.$emit('click-event', e);
        } else {
          this.$emit('click-event', e);
          this.$emit('input', e.target.checked);
        }
      },
    },
  };
</script>

<style scoped>
  .ev-checkbox-wrap {
    height: 19px;
    float: left;
    user-select: none;
  }
  .ev-checkbox-wrap.small{
    height: 16px;
  }
  .ev-checkbox-wrap.disabled {
    color: #C0C4CC;
  }
  .ev-checkbox-label {
    position: relative;
    height: 100%;
    display: inline-block;
    padding-left: 25px;
    line-height: 19px;
    cursor: pointer;
  }
  .ev-checkbox-label.small {
    padding-left: 23px;
    line-height: 16px;
  }
  .ev-checkbox-label:before {
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
  .ev-checkbox-label.square:before {
    border-radius: 0;
  }
  .ev-checkbox-label.small:before {
    width: 12px;
    height: 12px;
  }
  .ev-checkbox-wrap.disabled .ev-checkbox-label {
    cursor: not-allowed;
  }
  .ev-checkbox-wrap.disabled .ev-checkbox-label:before {
    border: 1px solid #B01012;
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
  }
  .ev-checkbox-input:checked + .ev-checkbox-label:before {
    border: 1px solid #41B7FD;
  }
  .ev-checkbox-wrap.disabled .ev-checkbox-input:checked + .ev-checkbox-label:before {
    border: 1px solid #B01012;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label:after {
    position: absolute;
    top: 50%;
    left: 7px;
    width: 8px;
    height: 8px;
    border-radius: 100%;
    transform: translateY(-50%);
    content: '';
  }
  .ev-checkbox-input:checked + .ev-checkbox-label.square:after {
    border-radius: 0;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label.small:after {
    left: 6px;
    width: 6px;
    height: 6px;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label.minus:after {
    left: 5px;
    width: 12px;
    height: 4px;
    border-radius: 0;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label.minus.small:after {
    width: 8px;
    height: 2px;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label:after {
    background: #41B7FD;
  }
  .ev-checkbox-wrap.disabled .ev-checkbox-input:checked + .ev-checkbox-label:after {
    background: #B01012;
  }
</style>
