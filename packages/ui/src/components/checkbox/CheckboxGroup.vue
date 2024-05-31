<template>
  <div
    class="ev-checkbox-group"
    :class="{ 'type-button': props.type === 'button' }"
    role="group"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, provide } from 'vue';
import {
  EvCheckboxGroupChangeKey,
  EvCheckboxGroupMvKey,
  type CheckValue,
} from './checkbox.type';

defineOptions({
  name: 'EvCheckboxGroup',
});
interface Props {
  modelValue: Array<CheckValue>;
  type?: 'checkbox' | 'button';
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  type: 'checkbox',
});

interface Emits {
  (event: 'update:modelValue', val: Array<CheckValue>): void;
  (event: 'change', val: Array<CheckValue>, e: Event): void;
}
const emit = defineEmits<Emits>();

const mv = computed({
  get: () => props.modelValue,
  set: (labels) => emit('update:modelValue', labels),
});
provide(EvCheckboxGroupMvKey, mv);

const change = async (e: Event) => {
  await nextTick();
  emit('change', mv.value, e);
};
provide(EvCheckboxGroupChangeKey, change);
</script>
