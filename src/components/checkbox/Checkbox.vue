<template>
  <label
    role="checkbox"
    class="ev-checkbox"
    :class="[
      { disabled: disabled },
      { checked: checked },
    ]"
  >
    <input
      v-model="mv"
      type="checkbox"
      :disabled="disabled"
      :value="label"
      @change="changeMv"
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
      required: true,
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

    const checked = computed(() => {
      if (Array.isArray(mv.value)) {
        return mv.value.includes(refLabel.value);
      }
      return mv.value;
    });

    const changeMv = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };

    return {
      mv,
      checked,
      changeMv,
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
  &.disabled {
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
