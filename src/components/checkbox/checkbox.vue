<template>
  <div
    :class="wrappedClasses"
  >
    <input
      :id="createId"
      :class="wrappedInnerClasses"
      :disabled="disabled"
      :value="value"
      :checked="wrapperedCheck"
      :checkboxType="checkboxType"
      v-model="model"
      type="checkbox"
      @click="clickDefaultEvent"
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
      default: false,
    },
    checkboxType: {
      type: String,
      default: 'normal',
    },
  },
  data() {
    return {
      model: [],
      currentChecked: null,
      wrapperedCheck: this.checked,
      wrapperedDisabled: this.disabled,
      wrapperedValue: this.value,
      wrapperedInnerClass: this.cls,
    };
  },
  computed: {
    wrappedClasses() {
      return [
        `${prefixCls}`,
        {
          'evui-disabled': this.wrapperedDisabled,
        },
      ];
    },
    labelClasses() {
      return [
        `${prefixCls}-label`,
      ];
    },
    createId() {
      return this._uid;
    },
    wrappedInnerClasses() {
      return this.wrapperedInnerClass;
    },
  },
  methods: {
    clickDefaultEvent(e) {
      this.wrapperedCheck = e.target.checked;
      if (this.$parent && this.$parent.changeCheckValue) {
        this.$parent.changeCheckValue(this.model);
        this.$emit('on-change', this.model);
      }
    },
    updateValue(newValue) {
      this.wrapperedCheck = newValue;
    },
    setDisabled(newValue) {
      this.wrapperedDisabled = newValue;
    },
  },
};
</script>
<style scoped>
</style>
