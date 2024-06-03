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
    />
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

<script setup lang="ts">
import { computed, inject, nextTick } from 'vue';
import { EvRadioGroupChangeKey, EvRadioGroupKey } from '../radioGroup/provide';

interface Props {
  modelValue: string | number | symbol | boolean;
  label: string | number | symbol | boolean;
  disabled?: boolean;
  size?: 's' | 'm';
}
const props = defineProps<Props>();

interface Emit {
  (e: 'update:modelValue', val: string | number | symbol | boolean): void;
  (e: 'change', val: string | number | symbol | boolean, event: Event): void;
}
const emit = defineEmits<Emit>();

const mv = inject(
  EvRadioGroupKey,
  computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  })
);

const changeMv = inject(EvRadioGroupChangeKey, async (e) => {
  await nextTick();
  emit('change', mv.value, e);
});

const checked = computed(() => mv.value === props.label);
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
  &-input {
    cursor: pointer;
  }
}

@include state('disabled') {
  .ev-radio-label {
    @include evThemify() {
      color: evThemed('disabled');
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
      border: 1px solid evThemed('border-base');
      border-left: 0;
    }
    &:first-child {
      border-radius: $default-radius 0 0 $default-radius;

      @include evThemify() {
        border-left: 1px solid evThemed('border-base');
      }
    }
    &:last-child {
      border-radius: 0 $default-radius $default-radius 0;
    }
    &.checked {
      color: $color-white;

      @include evThemify() {
        background-color: evThemed('primary');
      }
    }
    &.disabled.checked {
      @include evThemify() {
        background-color: rgba(evThemed('border-base'), 0.5);
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
