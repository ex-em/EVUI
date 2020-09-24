<template>
  <label
    role="checkbox"
    class="ev-checkbox"
    :class="[
      { 'is-disabled': isDisabled },
      { 'is-checked': isChecked },
    ]"
  >
    <input
      v-model="mv"
      type="checkbox"
      :disabled="isDisabled"
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
import { inject, nextTick, computed } from 'vue';

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
        set: val => emit('update:modelValue', val),
      }),
    );
    const refLabel = computed(() => props.label);

    const isChecked = computed(() => {
      if (Array.isArray(mv.value)) {
        return mv.value.includes(refLabel.value);
      }
      return mv.value;
    });
    const isDisabled = computed(() => props.disabled);

    const onChange = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };

    return {
      mv,
      refLabel,
      isChecked,
      isDisabled,
      onChange,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-checkbox {
  margin-right: 30px;
  cursor: pointer;
  user-select: none;
  input {
    cursor: pointer;
  }
  &.is-disabled {
    cursor: not-allowed;

    @include evThemify() {
      color: evThemed('color-disabled');
    }
    input {
      cursor: not-allowed;
    }
  }
}
.ev-checkbox-label {
  padding-left: 10px;
}
</style>
