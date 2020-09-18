<template>
  <div
    class="ev-radio"
    :class="[
      { disabled },
      { checked: mv === label },
      size,
    ]"
  >
    <label
      class="ev-radio-wrapper"
    >
      <input
        v-model="mv"
        type="radio"
        class="ev-radio-input"
        :value="label"
        :disabled="disabled"
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
  </div>
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

    return {
      mv,
      onChange,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-radio {
  display: inline-block;
  padding: 0 5px;
  margin-right: 30px;
  cursor: pointer;
  user-select: none;
  &-wrapper {
    $button-size-default: 18px;
    line-height: $button-size-default;
    cursor: pointer;
  }
  &-label {
    padding-left: 5px;
  }
  &.disabled {
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
