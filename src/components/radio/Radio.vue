<template>
  <label
    class="ev-radio"
    :class="[
      {
        disabled,
        checked,
      },
      size,
    ]"
  >
    <input
      v-model="mv"
      type="radio"
      class="ev-radio-input"
      :value="label"
      :disabled="disabled"
      @change.stop="changeMv"
    >
    <span class="ev-radio-label">
      <template v-if="$slots.default">
        <slot />
      </template>
      <template v-else>
        {{ label }}
      </template>
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

    const changeMv = inject(
      'EvRadioGroupChange',
      async (e) => {
        await nextTick();
        emit('change', mv.value, e);
      },
    );

    const checked = computed(() => mv.value === props.label);

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

.ev-radio {
  $button-size-default: 18px;
  display: inline-block;
  position: relative;
  padding: 0 5px;
  margin-right: 30px;
  user-select: none;
  line-height: $button-size-default;
  cursor: pointer;
  &-label {
    padding-left: 5px;
  }
}

@include state('disabled') {
  .ev-radio-label {
    @include evThemify() {
      color: evThemed('color-disabled');
    }
  }
  .ev-radio-input,
  .ev-radio-label {
    cursor: not-allowed !important;
  }
}
@include state('type-button') {
  .ev-radio {
    display: inline-block;
    padding: 0;
    margin: 0;
    text-align: center;

    @include evThemify() {
      border: 1px solid evThemed('color-line-base');
      border-left: 0;
    }
    &:first-child {
      border-radius: $border-radius-button 0 0 $border-radius-button;

      @include evThemify() {
        border-left: 1px solid evThemed('color-line-base');
      }
    }
    &:last-child {
      border-radius: 0 $border-radius-button $border-radius-button 0;
    }
    &.checked {
      color: $color-white;

      @include evThemify() {
        background-color: evThemed('color-primary');
      }
    }
    &.disabled.checked {
      @include evThemify() {
        background-color: rgba(evThemed('color-line-base'), 0.5);
      }
    }
  }
  .ev-radio-input {
    @include visible-hide();
  }
  .ev-radio-label {
    display: inline-block;
    padding: 7px 12px;
  }
}
</style>
