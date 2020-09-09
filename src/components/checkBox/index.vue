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
export default {
  name: 'CheckBox',
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
    const onChange = (e) => {
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
