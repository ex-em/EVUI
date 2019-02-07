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
      :class="dataSize"
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
    },
    data() {
      return {
        checkboxId: this._uid,
        isGroup: false, // group태그가 존재하는 경우 true
        groupBindValue: [],
        dataSize: '',
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
    },
  };
</script>

<style scoped>
  .ev-checkbox-wrap {
    height: 19px;
    float: left;
    user-select: none;
    cursor: pointer;
  }
  .ev-checkbox-wrap.small{
    height: 15px;
  }
  .ev-checkbox-wrap.disabled {
    color: #C0C4CC;
    cursor: not-allowed;
  }
  .ev-checkbox-label {
    position: relative;
    display: inline-block;
    padding-left: 25px;
    line-height: 19px;
    cursor: inherit;
  }
  .ev-checkbox-label.small {
    padding-left: 20px;
    line-height: 15px;
  }
  .ev-checkbox-label:before {
    position: absolute;
    top: 1px;
    left: 2px;
    width: 15px;
    height: 15px;
    background: transparent;
    border: 1px solid #B0B3B7;
    border-radius: 100%;
    text-align: center;
    content: '';
  }
  .ev-checkbox-label.small:before {
    width: 12px;
    height: 12px;
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
    top: 5px;
    left: 6px;
    width: 9px;
    height: 9px;
    border-radius: 100%;
    content: '';
  }
  .ev-checkbox-input:checked + .ev-checkbox-label.small:after {
    top: 5px;
    left: 6px;
    width: 6px;
    height: 6px;
  }
  .ev-checkbox-input:checked + .ev-checkbox-label:after {
    background: #41B7FD;
  }
  .ev-checkbox-wrap.disabled .ev-checkbox-input:checked + .ev-checkbox-label:after {
    background: #B01012;
  }
</style>
