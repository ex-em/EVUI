<template>
  <div
    :class="[{ disabled }, { checked }, size]"
    class="ev-radio"
  >
    <label
      class="ev-radio-wrapper"
    >
      <input
        ref="radio"
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
import { ref, computed, inject, nextTick } from 'vue';

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
    const radio = ref();
    const checked = ref(false);
    const mv = inject(
      'EvRadioGroupMv',
      computed({
        get: () => props.modelValue,
        set: () => {
          radio.value.checked = props.modelValue === props.label;
          if (props.modelValue === props.label) {
            checked.value = true;
          } else {
            checked.value = false;
          }
          emit('update:modelValue', props.label);
        },
      }),
    );
    const onChange = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };

    return {
      radio,
      mv,
      checked,
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
