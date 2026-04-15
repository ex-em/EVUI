<script setup>
import { computed, useAttrs } from 'vue';
import { useInputContext } from './context';

defineOptions({ name: 'EvInput', inheritAttrs: false });

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  modelModifiers: {
    type: Object,
    default: () => ({}),
  },
  disabled: {
    type: Boolean,
    default: undefined,
  },
  required: {
    type: Boolean,
    default: undefined,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'input',
  'change',
]);

const ctx = useInputContext();
const attrs = useAttrs();

const isDisabled = computed(
  () => props.disabled ?? ctx?.disabled.value ?? false,
);
const isRequired = computed(
  () => props.required ?? ctx?.required.value ?? false,
);
const isInvalid = computed(() => ctx?.invalid.value ?? false);

const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs;
  return rest;
});

const ariaDescribedby = computed(() => {
  if (!ctx) return undefined;
  const ids = [
    ctx.errorMessageId.value,
    ctx.descriptionId.value,
  ].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
});

const emitValue = (val) => emit('update:modelValue', val);

const handleFocus = (e) => emit('focus', e);

const handleBlur = (e) => {
  if (props.modelModifiers.trim) {
    const trimmed = (e.target.value || '').trim();
    if (trimmed !== e.target.value) {
      e.target.value = trimmed;
      emitValue(trimmed);
    }
  }
  emit('blur', e);
};

const handleInput = (e) => {
  emitValue(e.target.value);
  emit('input', e.target.value, e);
};

const handleChange = (e) => emit('change', e.target.value, e);
</script>

<template>
  <input
    :id="ctx?.inputId.value"
    v-bind="inputAttrs"
    :value="modelValue"
    :disabled="isDisabled"
    :required="isRequired"
    :aria-labelledby="ctx?.labelId.value"
    :aria-describedby="ariaDescribedby"
    :aria-invalid="isInvalid || undefined"
    :aria-required="isRequired || undefined"
    @focus="handleFocus"
    @blur="handleBlur"
    @input="handleInput"
    @change="handleChange"
  />
</template>
