<template>
  <div
    :class="wrappedClasses"
  >
    <input
      v-if="group"
      v-model="model"
      :value="label"
      :disabled="disabled"
      :checked="currentValue"
      :id="createId"
      :class="wrappedInnerClasses"
      type="checkbox"
      @change="change"
    >
    <input
      v-else
      :id="createId"
      :class="wrappedInnerClasses"
      :disabled="disabled"
      :checked="currentValue"
      type="checkbox"
      @change="change"
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
import { getMatchedComponentUpward } from '../../common/utils';

const prefixCls = 'evui-checkbox';

export default {
  name: 'CheckBox',
  props: {
    cls: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    indeterminate: {
      type: Boolean,
      default: false,
    },
    label: {
      type: [String, Number, Boolean],
      default: null,
    },
    value: {
      type: [String, Number, Boolean],
      default: false,
    },
    trueValue: {
      type: [String, Number, Boolean],
      default: true,
    },
    falseValue: {
      type: [String, Number, Boolean],
      default: false,
    },
  },
  data() {
    return {
      model: [],
      group: false,
      currentValue: this.value,
      wrapperedInnerClass: this.cls,
      parent: getMatchedComponentUpward(this, 'CheckboxGroup'),
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
    createId() {
      return this._uid;
    },
    wrappedInnerClasses() {
      return this.wrapperedInnerClass;
    },
  },
  watch: {
    value(value) {
      if (value === this.trueValue || value === this.falseValue) {
        this.updateModel();
      }
    },
  },
  mounted() {
    this.parent = getMatchedComponentUpward(this, 'CheckboxGroup');

    if (this.parent) {
      this.group = true;
    }

    if (this.group) {
      this.parent.updateModel(true);
    } else {
      this.updateModel();
    }
  },
  methods: {
    change(e) {
      if (this.disabled) {
        return;
      }
      const checked = e.target.checked;
      this.currentValue = checked;
      const value = checked ? this.trueValue : this.falseValue;

      this.$emit('input', value);
      if (this.group) {
        this.parent.change(this.model);
      } else {
        this.$emit('on-change', value);
      }
    },
    updateModel() {
      this.currentValue = this.value === this.trueValue;
    },
    setDisabled(newValue) {
      this.wrapperedDisabled = newValue;
    },
  },
};
</script>
<style scoped>
</style>
