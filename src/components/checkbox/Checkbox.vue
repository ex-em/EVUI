<template>
  <label
    role="checkbox"
    class="ev-checkbox"
    :class="[
      { 'disabled': disabled },
    ]"
  >
    <input
      v-model="mv"
      type="checkbox"
      :disabled="disabled"
      :value="refLabel"
      @change="onChange"
    />
    <span
      v-if="$slots.default"
      class="ev-checkbox-label"
    >
      <slot />
    </span>
    <span
      v-else
      class="ev-checkbox-label"
    >
      {{ label }}
    </span>
  </label>
</template>

<script>
import { ref, inject, nextTick, computed } from 'vue';

export default {
  name: 'EvCheckbox',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Symbol, Array],
      default: false,
    },
    label: {
      type: [String, Number, Boolean, Symbol],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': [Boolean],
    change: null,
  },
  setup(props, { emit }) {
    const mv = inject(
      'EvCheckboxGroupMv',
      computed({
        get: () => props.modelValue,
        set: () => emit('update:modelValue', !props.modelValue),
      }),
    );
    const refLabel = ref(props.label);

    const onChange = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };

    return {
      mv,
      refLabel,
      onChange,
    };
  },
};
</script>

<style lang="scss">
.ev-checkbox {
  margin-right: 30px;
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
.ev-checkbox-label {
  padding-left: 10px;
}
</style>
