<template>
  <label
    class="ev-checkbox"
    :class="[
      { 'disabled': disabled },
    ]"
  >
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <slot />
  </label>
</template>

<script>
import { nextTick } from 'vue';

export default {
  name: 'EvCheckbox',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
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
.ev-checkbox {
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
