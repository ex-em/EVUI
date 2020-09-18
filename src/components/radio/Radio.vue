<template>
  <label
    class="ev-radio"
    :class="[
      { 'is-disabled': isDisabled },
      { 'is-checked': isChecked },
      size,
    ]"
  >
    <input
      v-model="mv"
      type="radio"
      class="ev-radio-input"
      :value="label"
      :disabled="isDisabled"
      @change="onChange"
    >
    <span
      v-if="$slots.default"
      class="ev-radio-label"
    >
      <slot />
    </span>
    <span
      v-else
      class="ev-radio-label"
    >
      {{ label }}
    </span>
  </label>
</template>

<script>
import { computed, inject, nextTick } from 'vue';

export default {
  name: 'EvRadio',
  props: {
    modelValue: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
    label: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup(props, { emit }) {
    const mv = inject(
      'EvRadioGroupMv',
      computed({
        get: () => props.modelValue,
        set: val => emit('update:modelValue', val),
      }),
    );

    const onChange = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };

    const isDisabled = computed(() => props.disabled);
    const isChecked = computed(() => mv.value === props.label);

    return {
      mv,
      isDisabled,
      isChecked,
      onChange,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-radio {
  $button-size-default: 18px;
  display: inline-block;
  padding: 0 5px;
  margin-right: 30px;
  user-select: none;
  line-height: $button-size-default;
  cursor: pointer;
  &-label {
    padding-left: 5px;
  }
  &.is-disabled {
    @include evThemify() {
      color: evThemed('color-disabled');
    }
    input,
    .ev-radio-wrapper {
      cursor: not-allowed !important;
    }
  }
}
</style>
