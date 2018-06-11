<template>
  <div
    :class="wrappedClasses"
  >
    <input
      :id="createId"
      :class="cls"
      :disabled="disabled"
      :value="value"
      :checked="wrapperedCheck"
      :checkboxType="checkboxType"
      type="checkbox"
      @click="checkPropsEvent"
    >
    <label
      :for="createId"
      :class="labelClasses"
    >
      {{ label }}
    </label>
  </div>
</template>

<script>
const prefixCls = 'evui-checkbox';

export default {
  name: 'CheckBox',
  model: {
    prop: 'checked',
    event: 'onChange',
  },
  props: {
    cls: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [String, Number, Boolean],
      default: null,
    },
    checkboxType: {
      type: String,
      default: 'normal',
    },
    clickEvent: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      currentChecked: null,
      wrapperedCheck: this.checked,
    };
  },
  computed: {
    wrappedClasses() {
      return [
        `${prefixCls}`,
        {
          'evui-disabled': this.disabled,
        },
      ];
    },
    labelClasses() {
      return [
        `${prefixCls}-label`,
      ];
    },
    checkPropsEvent() {
      return this.clickEvent ? this.clickEvent : this.onChange;
    },
    createId() {
      return this._uid;
    },
  },
  methods: {
    onChange(e) {
    if (this.$parent && this.$parent.change) {
        this.$parent.change(e, this.currentChecked);
      }
    },
    updateValue(newValue) {
      this.wrapperedCheck = newValue;
    },
  },
};
</script>
<style scoped>
</style>
