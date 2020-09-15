<template>
  <div
    :class="[{ disabled: disabled }, size]"
    class="ev-radio"
  >
    <label
      class="ev-radio-label"
    >
      <input
        type="radio"
        class="ev-radio-input"
        :value="value"
        :name="name"
        :checked="modelValue"
        :disabled="disabled"
        @change="onChange"
      >
      <span class="ev-radio-label">
        <slot />
      </span>
    </label>
  </div>
</template>

<script>
import { nextTick } from 'vue';

export default {
  name: 'EvRadio',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number, Symbol, Boolean],
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update:modelValue': [Boolean],
    change: val => typeof val === 'boolean',
  },
  setup(props, { emit }) {
    const onChange = async (e) => {
      await nextTick();
      const value = !props.modelValue;
      emit('update:modelValue', value);
      emit('change', value, e);
    };

    return {
      onChange,
    };
  },
};
</script>

<style lang="scss">
.ev-radio {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  input {
    cursor: pointer;
  }

  &.disabled {
    color: #C0C4CC;
    cursor: not-allowed;
    input {
      cursor: not-allowed;
    }
  }
}
</style>
