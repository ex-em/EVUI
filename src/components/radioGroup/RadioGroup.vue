<template>
  <div
    class="ev-radio-group"
    role="group"
  >
    <slot />
  </div>
</template>

<script>
import { computed, provide, nextTick } from 'vue';

export default {
  name: 'EvRadioGroup',
  props: {
    modelValue: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const mv = computed({
      get: () => props.modelValue,
      set: label => emit('update:modelValue', label),
    });
    provide('EvRadioGroupMv', mv);

    const change = async (e) => {
      await nextTick();
      emit('change', mv.value, e);
    };
    provide('EvRadioGroupChange', change);
  },
};
</script>
