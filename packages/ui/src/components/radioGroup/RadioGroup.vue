<template>
  <div
    class="ev-radio-group"
    :class="{ 'type-button': type === 'button' }"
    role="group"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, nextTick } from 'vue';
import { EvRadioGroupChangeKey, EvRadioGroupKey } from './provide';

interface Props {
  modelValue: string | number | symbol | boolean;
  type: 'radio' | 'button';
}
const props = withDefaults(defineProps<Props>(), {
  type: 'radio',
});
interface Emit {
  (e: 'update:modelValue', val: string | number | symbol | boolean): void;
  (e: 'change', val: string | number | symbol | boolean, event: Event): void;
}
const emit = defineEmits<Emit>();
const mv = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
provide(EvRadioGroupKey, mv);

const change = async (e: Event) => {
  await nextTick();
  emit('change', mv.value, e);
};
provide(EvRadioGroupChangeKey, change);
</script>
