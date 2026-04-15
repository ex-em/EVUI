import { inject, provide, computed, ref } from 'vue';

const INPUT_CONTEXT_KEY = Symbol('EvInputContext');

let uid = 0;

export function provideInputContext(props) {
  const fieldId = `ev-input-${uid++}`;
  const inputId = computed(() => `${fieldId}-input`);
  const labelId = computed(() => `${fieldId}-label`);
  const descriptionId = ref(null);
  const errorMessageId = ref(null);

  const context = {
    fieldId,
    inputId,
    labelId,
    descriptionId,
    errorMessageId,
    disabled: computed(() => props.disabled),
    required: computed(() => props.required),
    invalid: computed(() => props.invalid),
  };

  provide(INPUT_CONTEXT_KEY, context);
  return context;
}

export function useInputContext() {
  return inject(INPUT_CONTEXT_KEY, null);
}
